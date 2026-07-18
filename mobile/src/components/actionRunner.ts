import { playSfx, type SfxName } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'

/**
 * Build the BitLife-style action runner for a submenu. Returns a factory that
 * wraps a once-per-year action: it plays the action's sound, and if the action
 * actually did something (added a life-log entry), it pops a confirmation
 * bubble with that outcome text and closes the submenu — returning you to the
 * main screen. No-ops (already done this year, not enough money) neither toast
 * nor close, so the menu stays put.
 */
export function confirmAction(onClose: () => void) {
  // Pass sfx: null for actions that already play their own sound, so it
  // doesn't echo.
  return (run: () => void, sfx: SfxName | null = 'click') =>
    () => {
      const store = useGameStore.getState()
      const before = store.log.length
      if (sfx) playSfx(sfx)
      run()
      const after = useGameStore.getState()
      if (after.log.length > before) {
        after.showToast(after.log[after.log.length - 1].text)
        onClose()
      }
    }
}
