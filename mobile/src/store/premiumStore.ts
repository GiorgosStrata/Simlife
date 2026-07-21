import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Premium entitlement. On this build "buying" premium flips a local flag so the
 * whole feature set is playable and testable. For the app-store releases this
 * is where a real in-app purchase goes: verify the receipt (StoreKit / Play
 * Billing, e.g. via RevenueCat) and set `premium` from the entitlement, with
 * `restorePurchase` calling the store's restore flow. See docs/PREMIUM.md.
 */

/** Price shown in the paywall (native builds read the real localized price). */
export const PREMIUM_PRICE = '€10'

/** How many saved lives each tier can keep. */
export const FREE_SAVE_SLOTS = 3
export const PREMIUM_SAVE_SLOTS = 10

/** Bloodline generations a free player can reach before needing premium. */
export const FREE_MAX_GENERATION = 3

interface PremiumState {
  premium: boolean
  hasHydrated: boolean
  /** Complete the (mock) purchase — unlocks everything premium. */
  purchase: () => void
  /** Restore a prior purchase (no-op locally; wired to the store on native). */
  restorePurchase: () => void
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      premium: false,
      hasHydrated: false,
      purchase: () => set({ premium: true }),
      restorePurchase: () => {
        // Native: query the store for an active entitlement and set `premium`.
      },
    }),
    {
      name: 'simlife-premium',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        usePremiumStore.setState({ hasHydrated: true })
      },
    },
  ),
)

export const saveSlotLimit = (premium: boolean) => (premium ? PREMIUM_SAVE_SLOTS : FREE_SAVE_SLOTS)
