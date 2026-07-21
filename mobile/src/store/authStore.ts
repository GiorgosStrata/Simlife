import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * A lightweight, on-device account system so players sign up / log in before
 * playing. This is a client-only store (accounts live in local storage on this
 * device) — enough for a real sign-up/login flow and to gate the game. When we
 * wire a real backend, swap the signUp/logIn bodies for API calls; the rest of
 * the app only cares about `currentEmail`.
 *
 * NOTE: passwords are stored as a lightweight hash on-device only. Do not treat
 * this as secure auth — a production release should authenticate against a
 * server (see docs/ADS_AND_AUTH.md).
 */

interface Account {
  name: string
  email: string
  /** Lightweight hash of the password (not secure — client-side only). */
  hash: string
  createdAt: number
}

interface AuthResult {
  ok: boolean
  error?: string
}

interface AuthState {
  users: Record<string, Account>
  currentEmail: string | null
  hasHydrated: boolean
  signUp: (name: string, email: string, password: string) => AuthResult
  logIn: (email: string, password: string) => AuthResult
  logOut: () => void
}

/** FNV-1a string hash → hex. Deterministic, tiny; NOT cryptographically secure. */
function hashPassword(password: string): string {
  let h = 2166136261
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // Fold in the length so trivial collisions are less likely.
  h ^= password.length
  return (h >>> 0).toString(16)
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: {},
      currentEmail: null,
      hasHydrated: false,

      signUp: (name, email, password) => {
        const e = normalizeEmail(email)
        if (!name.trim()) return { ok: false, error: 'Please enter your name.' }
        if (!EMAIL_RE.test(e)) return { ok: false, error: 'Enter a valid email address.' }
        if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
        if (get().users[e]) return { ok: false, error: 'An account with that email already exists.' }
        const account: Account = { name: name.trim(), email: e, hash: hashPassword(password), createdAt: Date.now() }
        set({ users: { ...get().users, [e]: account }, currentEmail: e })
        return { ok: true }
      },

      logIn: (email, password) => {
        const e = normalizeEmail(email)
        const account = get().users[e]
        if (!account) return { ok: false, error: 'No account found for that email.' }
        if (account.hash !== hashPassword(password)) return { ok: false, error: 'Incorrect password.' }
        set({ currentEmail: e })
        return { ok: true }
      },

      logOut: () => set({ currentEmail: null }),
    }),
    {
      name: 'simlife-auth',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true })
      },
    },
  ),
)
