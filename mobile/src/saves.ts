import { useGameStore } from './store/gameStore'
import { usePremiumStore, saveSlotLimit } from './store/premiumStore'
import { useSlotsStore } from './store/slotsStore'

/**
 * Save-slot orchestration: the glue between the live game (gameStore), the
 * saved-lives roster (slotsStore), and the premium entitlement (premiumStore).
 * Kept out of the stores so no store imports another's state at module load.
 */

/** Snapshot the live game into whichever slot is currently active. */
export function saveActiveSlot(): void {
  const slots = useSlotsStore.getState()
  if (!slots.activeId) return
  slots.writeSnapshot(slots.activeId, useGameStore.getState().exportSave())
}

/** On boot: make sure the live game is represented by an active slot. */
export function ensureSeeded(): void {
  const slots = useSlotsStore.getState()
  if (slots.slots.length === 0) {
    slots.createSlot(useGameStore.getState().exportSave())
    return
  }
  // Keep the active slot's snapshot fresh with the just-loaded live game.
  saveActiveSlot()
}

/** How many more lives this player can save right now. */
export function slotLimit(): number {
  return saveSlotLimit(usePremiumStore.getState().premium)
}
export function canAddSlot(): boolean {
  return useSlotsStore.getState().slots.length < slotLimit()
}

/** Switch the live game to another saved life (saving the current one first). */
export function switchToSlot(id: string): void {
  const slots = useSlotsStore.getState()
  if (id === slots.activeId) return
  const snap = slots.snapshots[id]
  if (!snap) return
  saveActiveSlot()
  useGameStore.getState().importSave(snap)
  slots.setActive(id)
}

/** Start a brand-new life in a fresh slot (respecting the save-slot cap). */
export function addNewLifeSlot(): boolean {
  if (!canAddSlot()) return false
  saveActiveSlot()
  useGameStore.getState().startNewLife()
  useSlotsStore.getState().createSlot(useGameStore.getState().exportSave())
  return true
}

/** Delete a saved life (never the active one). */
export function deleteSlot(id: string): void {
  useSlotsStore.getState().removeSlot(id)
}
