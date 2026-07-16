import { createAudioPlayer, type AudioPlayer } from 'expo-audio'
import { useGameStore } from '../store/gameStore'

/**
 * Tiny synthesized sound effects (see assets/sfx). Players are created
 * lazily and reused. Volume comes from the persisted settings; 0 mutes.
 */

const SOURCES = {
  /** Button taps: Age Up, list rows. */
  click: require('../../assets/sfx/click.wav'),
  /** A modal popping up (events, interviews, sheets). */
  pop: require('../../assets/sfx/pop.wav'),
  /** Swipes and light transitions (Cinder, opening the phone). */
  whoosh: require('../../assets/sfx/whoosh.wav'),
  /** Good news: hired, accepted, engaged. */
  success: require('../../assets/sfx/success.wav'),
  /** Money coming in: sale, pocket money, monetizing, payout. */
  cash: require('../../assets/sfx/cash.wav'),
  /** A promotion or an approved raise. */
  levelup: require('../../assets/sfx/levelup.wav'),
  /** Graduating school or university. */
  graduate: require('../../assets/sfx/graduate.wav'),
  /** Matching with someone on the dating app / finding love. */
  match: require('../../assets/sfx/match.wav'),
  /** Getting married. */
  wedding: require('../../assets/sfx/wedding.wav'),
  /** A new life begins. */
  baby: require('../../assets/sfx/baby.wav'),
  /** Bad news: flunked interview, rejection. */
  fail: require('../../assets/sfx/fail.wav'),
  /** Taking damage: a bully, a mugging, an illness. */
  hurt: require('../../assets/sfx/hurt.wav'),
  /** Throwing a hit / an insult. */
  punch: require('../../assets/sfx/punch.wav'),
  /** Pulling off (or attempting) a crime. */
  crime: require('../../assets/sfx/crime.wav'),
  /** Getting caught. */
  police: require('../../assets/sfx/police.wav'),
  /** A breakup or divorce. */
  heartbreak: require('../../assets/sfx/heartbreak.wav'),
  /** Working out / taking up a sport. */
  gym: require('../../assets/sfx/gym.wav'),
  /** Buying a car. */
  honk: require('../../assets/sfx/honk.wav'),
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
    // play() can reject asynchronously on web before the first user gesture;
    // swallow that so it never bubbles up as an unhandled rejection.
    const maybePromise = player.play() as unknown as Promise<void> | void
    if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
      ;(maybePromise as Promise<void>).catch(() => {})
    }
  } catch {
    // Audio must never crash the game (e.g. web autoplay restrictions).
  }
}
