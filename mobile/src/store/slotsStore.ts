import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * The roster of saved lives ("slots"). Each slot holds a full snapshot of a
 * game (see gameStore.exportSave). The active slot's snapshot is kept in sync
 * with the live game via `saves.ts`. How many slots you may keep depends on
 * premium (see premiumStore).
 */

export type GameSnapshot = Record<string, unknown>

interface SlotsState {
  /** Ordered slot ids. */
  slots: string[]
  /** Full game snapshot per slot id. */
  snapshots: Record<string, GameSnapshot>
  /** The slot currently loaded into the live game. */
  activeId: string | null
  nextId: number
  hasHydrated: boolean

  writeSnapshot: (id: string, snap: GameSnapshot) => void
  createSlot: (snap: GameSnapshot) => string
  setActive: (id: string) => void
  removeSlot: (id: string) => void
}

export const useSlotsStore = create<SlotsState>()(
  persist(
    (set, get) => ({
      slots: [],
      snapshots: {},
      activeId: null,
      nextId: 1,
      hasHydrated: false,

      writeSnapshot: (id, snap) => {
        if (!get().slots.includes(id)) return
        set({ snapshots: { ...get().snapshots, [id]: snap } })
      },

      createSlot: (snap) => {
        const s = get()
        const id = `slot-${s.nextId}`
        set({
          slots: [...s.slots, id],
          snapshots: { ...s.snapshots, [id]: snap },
          activeId: id,
          nextId: s.nextId + 1,
        })
        return id
      },

      setActive: (id) => {
        if (get().slots.includes(id)) set({ activeId: id })
      },

      removeSlot: (id) => {
        const s = get()
        if (id === s.activeId) return // never delete the active slot
        const snapshots = { ...s.snapshots }
        delete snapshots[id]
        set({ slots: s.slots.filter((x) => x !== id), snapshots })
      },
    }),
    {
      name: 'simlife-slots',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useSlotsStore.setState({ hasHydrated: true })
      },
    },
  ),
)

/** The bits of a snapshot the slot picker shows. */
export interface SlotMeta {
  name: string
  age: number
  generation: number
  alive: boolean
  year: number
  screen: string
  countryCode: string
}

export function slotMeta(snap: GameSnapshot | undefined): SlotMeta {
  return {
    name: (snap?.name as string) ?? 'New life',
    age: (snap?.age as number) ?? 0,
    generation: (snap?.generation as number) ?? 1,
    alive: (snap?.alive as boolean) ?? true,
    year: (snap?.year as number) ?? 0,
    screen: (snap?.screen as string) ?? 'creation',
    countryCode: (snap?.countryCode as string) ?? 'US',
  }
}
