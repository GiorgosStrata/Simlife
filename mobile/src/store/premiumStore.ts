import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useAuthStore } from './authStore'

/**
 * Premium entitlement. On this build "buying" premium flips a local flag so the
 * whole feature set is playable and testable. For the app-store releases this
 * is where a real in-app purchase goes: verify the receipt (StoreKit / Play
 * Billing, e.g. via RevenueCat) and set the entitlement, with `restorePurchase`
 * calling the store's restore flow. See docs/PREMIUM.md.
 *
 * Premium is tied to a real account: `purchased` is the (device-local) mock
 * entitlement, but the effective `premium` the app reads is only true when the
 * player is also signed in. Guests can play, but never carry Premium — the
 * entitlement should follow the account, not the device.
 */

/** Price shown in the paywall (native builds read the real localized price). */
export const PREMIUM_PRICE = '€10'

/** How many saved lives each tier can keep. */
export const FREE_SAVE_SLOTS = 3
export const PREMIUM_SAVE_SLOTS = 10

/** Bloodline generations a free player can reach before needing premium. */
export const FREE_MAX_GENERATION = 3

interface PremiumState {
  /** Raw mock entitlement, persisted on the device. */
  purchased: boolean
  /** Effective premium the app reads: entitled AND signed in. */
  premium: boolean
  hasHydrated: boolean
  /** Complete the (mock) purchase — unlocks everything premium. */
  purchase: () => void
  /** Restore a prior purchase (no-op locally; wired to the store on native). */
  restorePurchase: () => void
}

/** Recompute effective premium from the entitlement + whether an account is signed in. */
function recompute() {
  const purchased = usePremiumStore.getState().purchased
  const hasAccount = useAuthStore.getState().currentEmail !== null
  const premium = purchased && hasAccount
  if (usePremiumStore.getState().premium !== premium) {
    usePremiumStore.setState({ premium })
  }
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      purchased: false,
      premium: false,
      hasHydrated: false,
      purchase: () => {
        set({ purchased: true })
        recompute()
      },
      restorePurchase: () => {
        // Native: query the store for an active entitlement and set `purchased`.
        recompute()
      },
    }),
    {
      name: 'simlife-premium',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // Only the raw entitlement is persisted; `premium` is always derived.
      partialize: ({ purchased }) => ({ purchased }),
      migrate: (state, version) => {
        // v1 stored the entitlement as `premium`; carry it over to `purchased`.
        const s = (state ?? {}) as { premium?: boolean; purchased?: boolean }
        return { purchased: Boolean(s.purchased ?? s.premium) }
      },
      onRehydrateStorage: () => () => {
        usePremiumStore.setState({ hasHydrated: true })
        recompute()
      },
    },
  ),
)

// Effective premium tracks the account: recompute whenever auth changes
// (login, logout, guest switch, session restore).
useAuthStore.subscribe(() => recompute())

export const saveSlotLimit = (premium: boolean) => (premium ? PREMIUM_SAVE_SLOTS : FREE_SAVE_SLOTS)
