import { Platform } from 'react-native'
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from '../lib/supabase'

export type OAuthProvider = 'google' | 'apple'

/** Local flag so a guest (no account) can keep playing across reloads. */
const GUEST_KEY = 'gitlife-guest'

/**
 * Real accounts, backed by Supabase Auth. Sign-up / log-in / reset all hit the
 * server, so an account works across devices and browsers, and Supabase owns
 * the users table, password hashing, email confirmation and password resets.
 *
 * This store just mirrors the current session (who's logged in) for the UI —
 * the session itself is persisted by the Supabase client, not here.
 */

interface AuthResult {
  ok: boolean
  error?: string
  /** True when sign-up succeeded but the email must be confirmed before login. */
  needsConfirm?: boolean
}

interface AuthState {
  currentEmail: string | null
  currentName: string | null
  /** Playing without an account: progress saves locally, but no purchases. */
  isGuest: boolean
  hasHydrated: boolean
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  logIn: (email: string, password: string) => Promise<AuthResult>
  /** Sign in with Google or Apple via OAuth (redirect on web, in-app browser on native). */
  signInWithProvider: (provider: OAuthProvider) => Promise<AuthResult>
  /** Skip the account and play locally. */
  continueAsGuest: () => void
  /** Leave guest mode and show the sign-in screen (e.g. to buy Premium). */
  exitGuest: () => void
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Where Supabase should send users back to after a confirm / reset link. */
const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined

export const useAuthStore = create<AuthState>()(() => ({
  currentEmail: null,
  currentName: null,
  isGuest: false,
  hasHydrated: false,

  continueAsGuest: () => {
    AsyncStorage.setItem(GUEST_KEY, '1')
    useAuthStore.setState({ isGuest: true })
  },

  exitGuest: () => {
    AsyncStorage.removeItem(GUEST_KEY)
    useAuthStore.setState({ isGuest: false })
  },

  signUp: async (name, email, password) => {
    const e = normalizeEmail(email)
    if (!name.trim()) return { ok: false, error: 'Please enter your name.' }
    if (!EMAIL_RE.test(e)) return { ok: false, error: 'Enter a valid email address.' }
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
    const { data, error } = await supabase.auth.signUp({
      email: e,
      password,
      options: { data: { name: name.trim() }, emailRedirectTo: redirectTo },
    })
    if (error) return { ok: false, error: error.message }
    // With email confirmation ON, sign-up creates the user but no session yet.
    if (!data.session) return { ok: true, needsConfirm: true }
    return { ok: true }
  },

  logIn: async (email, password) => {
    const e = normalizeEmail(email)
    if (!EMAIL_RE.test(e)) return { ok: false, error: 'Enter a valid email address.' }
    const { error } = await supabase.auth.signInWithPassword({ email: e, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  signInWithProvider: async (provider) => {
    try {
      // Web: hand off to a full-page redirect; the session is picked up on the
      // way back by detectSessionInUrl.
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
        if (error) return { ok: false, error: error.message }
        return { ok: true }
      }
      // Native: open the provider in a secure in-app browser, then swap the
      // returned auth code for a session (PKCE).
      const redirect = makeRedirectUri({ scheme: 'gitlife', path: 'auth-callback' })
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirect, skipBrowserRedirect: true },
      })
      if (error) return { ok: false, error: error.message }
      if (!data?.url) return { ok: false, error: 'Could not start sign-in.' }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirect)
      if (result.type !== 'success' || !result.url) return { ok: false, error: 'Sign-in cancelled.' }
      const match = result.url.match(/[?&]code=([^&#]+)/)
      const code = match ? decodeURIComponent(match[1]) : null
      if (!code) return { ok: false, error: 'Sign-in failed — no code returned.' }
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) return { ok: false, error: exchangeError.message }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Sign-in failed.' }
    }
  },

  logOut: async () => {
    await supabase.auth.signOut()
  },

  resetPassword: async (email) => {
    const e = normalizeEmail(email)
    if (!EMAIL_RE.test(e)) return { ok: false, error: 'Enter your email first, then tap reset.' }
    const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },
}))

/** Push the current session's user into the store (or clear it). */
function syncSession(
  user: { email?: string | null; user_metadata?: { name?: string } } | null,
) {
  useAuthStore.setState({
    currentEmail: user?.email ?? null,
    currentName: user?.user_metadata?.name ?? null,
  })
}

/**
 * Restore any existing session (and guest flag) on startup, then flag ready.
 *
 * The session lookup must never be able to hang the app: if Supabase is
 * unreachable (a paused project, no signal, a locked-down network) we still
 * have to finish hydrating, otherwise the UI sits on its loading spinner
 * forever. So the lookup is raced against a timeout and any failure is treated
 * as "no session" — the player lands on the sign-in screen and can still tap
 * "Continue as guest" and play offline.
 */
const SESSION_LOOKUP_TIMEOUT_MS = 8000

async function hydrateAuth() {
  // Local, and always reliable — read it first so a dead network can't cost
  // the player their saved guest choice.
  let guestFlag: string | null = null
  try {
    guestFlag = await AsyncStorage.getItem(GUEST_KEY)
  } catch {
    guestFlag = null
  }

  let session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] = null
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('session lookup timed out')), SESSION_LOOKUP_TIMEOUT_MS),
      ),
    ])
    session = result.data.session
  } catch {
    // Offline, or Supabase unreachable — carry on logged out.
    session = null
  }

  syncSession(session?.user ?? null)
  useAuthStore.setState({
    // A real session always wins; otherwise honour a saved guest choice.
    isGuest: !session && guestFlag === '1',
    hasHydrated: true,
  })
}

void hydrateAuth()

// Keep the store in step with logins, logouts and token refreshes. Signing in
// for real supersedes guest mode.
supabase.auth.onAuthStateChange((_event, session) => {
  syncSession(session?.user ?? null)
  if (session) {
    AsyncStorage.removeItem(GUEST_KEY)
    useAuthStore.setState({ isGuest: false })
  }
})
