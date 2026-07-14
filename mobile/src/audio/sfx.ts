import { createAudioPlayer, type AudioPlayer } from 'expo-audio'
import { useGameStore } from '../store/gameStore'

/**
 * Tiny synthesized sound effects (see assets/sfx). Players are created
 * lazily and reused. Volume comes from the persisted settings; 0 mutes.
 */

const SOURCES = {
  /** Button taps: Age Up, picking a choice. */
  click: require('../../assets/sfx/click.wav'),
  /** A modal popping up (events, interviews). */
  pop: require('../../assets/sfx/pop.wav'),
  /** Good news: hired, graduated, engaged, married. */
  success: require('../../assets/sfx/success.wav'),
  /** Bad news: flunked interview, rejection, breakup. */
  fail: require('../../assets/sfx/fail.wav'),
  /** Rest in peace. */
  death: require('../../assets/sfx/death.wav'),
} as const

export type SfxName = keyof typeof SOURCES

const players: Partial<Record<SfxName, AudioPlayer>> = {}

export function playSfx(name: SfxName): void {
  try {
    const volume = useGameStore.getState().sfxVolume
    if (volume <= 0) return
    let player = players[name]
    if (!player) {
      player = createAudioPlayer(SOURCES[name])
      players[name] = player
    }
    player.volume = volume
    player.seekTo(0)
    player.play()
  } catch {
    // Audio must never crash the game (e.g. web autoplay restrictions).
  }
}
