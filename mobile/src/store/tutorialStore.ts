import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Tracks whether the player has seen the first-time tutorial. Device-wide (not
 * per-life), so the intro shows exactly once and never nags a returning player.
 */
interface TutorialState {
  seen: boolean
  hasHydrated: boolean
  markSeen: () => void
  /** Lets the player replay the intro from Settings. */
  reset: () => void
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      seen: false,
      hasHydrated: false,
      markSeen: () => set({ seen: true }),
      reset: () => set({ seen: false }),
    }),
    {
      name: 'gitlife-tutorial',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useTutorialStore.setState({ hasHydrated: true })
      },
    },
  ),
)
