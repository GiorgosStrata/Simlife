import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Close this sheet whenever an action requests the whole modal stack to
 * unwind (closeModals bumps modalNonce). Nested sheets each register this, so
 * any confirmed action returns the player all the way to the main screen.
 */
export function useCloseOnAction(onClose: () => void) {
  const nonce = useGameStore((s) => s.modalNonce)
  const start = useRef(nonce)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    if (nonce !== start.current) onCloseRef.current()
  }, [nonce])
}
