import { create } from 'zustand'
import { supabase } from '../lib/supabase'

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
  hasHydrated: boolean
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  logIn: (email: string, password: string) => Promise<AuthResult>
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
  hasHydrated: false,

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

// Restore any existing session on startup, then flag the app as ready.
supabase.auth.getSession().then(({ data }) => {
  syncSession(data.session?.user ?? null)
  useAuthStore.setState({ hasHydrated: true })
})

// Keep the store in step with logins, logouts and token refreshes.
supabase.auth.onAuthStateChange((_event, session) => {
  syncSession(session?.user ?? null)
})
