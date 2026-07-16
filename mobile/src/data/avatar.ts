import type { Gender } from '../types'

/**
 * Deterministic BitLife-style avatar generation. Every character gets a
 * stable flat-vector face (skin tone, hair style + colour, facial
 * features) derived from a seed string, so the same person always looks
 * the same. Rendering lives in components/Avatar.tsx.
 */

/** Fitzpatrick-ish skin tones, light → dark. */
export const SKIN_TONES = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5b3a1a']

/** Natural hair colours (index 5 = grey, used for older characters). */
export const HAIR_COLORS = ['#1b1512', '#3d2314', '#6f4e37', '#d8b26a', '#a5482b', '#9e9e9e']

/** Shirt colours for the little bust behind the head. */
export const SHIRT_COLORS = ['#0891b2', '#db2777', '#8b5cf6', '#047857', '#f59e0b', '#475569', '#e11d48']

/** Soft pastel backgrounds. */
export const BG_COLORS = ['#e0f2fe', '#fce7f3', '#ede9fe', '#dcfce7', '#fef3c7', '#f1f5f9', '#ffe4e6']

export type HairStyle =
  | 'bald'
  | 'buzz'
  | 'short'
  | 'sidePart'
  | 'curly'
  | 'medium'
  | 'bob'
  | 'long'
  | 'ponytail'
  | 'bun'

export type FacialHair = 'none' | 'stubble' | 'mustache' | 'beard'

/** A fully-resolved look, ready to render. */
export interface AvatarLook {
  female: boolean
  skin: string
  hair: string
  hairStyle: HairStyle
  shirt: string
  bg: string
  eyes: number
  mouth: number
  brows: number
  facialHair: FacialHair
  blush: boolean
}

// Weighted style pools (repeats bias the odds toward common looks).
// Kept deliberately gendered so faces read male/female at a glance:
// masculine caps for men, longer/tied styles for women.
const MALE_HAIR: HairStyle[] = [
  'buzz', 'buzz', 'short', 'short', 'short', 'sidePart', 'sidePart', 'curly', 'bald', 'buzz',
]
const FEMALE_HAIR: HairStyle[] = [
  'long', 'long', 'long', 'bob', 'bob', 'ponytail', 'ponytail', 'bun', 'medium', 'curly',
]
const MALE_FACIAL: FacialHair[] = [
  'none', 'none', 'none', 'none', 'none', 'stubble', 'stubble', 'mustache', 'beard', 'beard',
]

/** Small, stable string hash (FNV-1a variant) → unsigned 32-bit int. */
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Independent, deterministic pick from `arr` for a given seed + feature. */
function pick<T>(seed: string, feature: string, arr: T[]): T {
  return arr[hashStr(`${seed}:${feature}`) % arr.length]
}

/**
 * Build a stable look for a character. `age` greys the hair over time and
 * gives babies wispy/no hair; facial hair is male-only from age 16.
 */
export function avatarFor(seed: string, gender: Gender, age = 25): AvatarLook {
  const male = gender === 'male'

  let hairStyle: HairStyle
  if (age < 2) {
    hairStyle = hashStr(`${seed}:baby`) % 2 === 0 ? 'bald' : 'short'
  } else {
    hairStyle = pick(seed, 'hairStyle', male ? MALE_HAIR : FEMALE_HAIR)
  }

  // Hair greys with age (a little at 50, fully by 60).
  const naturalHair = pick(seed, 'hair', HAIR_COLORS.slice(0, 5))
  let hair = naturalHair
  if (age >= 60) hair = HAIR_COLORS[5]
  else if (age >= 50 && hashStr(`${seed}:grey`) % 2 === 0) hair = HAIR_COLORS[5]

  const facialHair: FacialHair =
    male && age >= 16 ? pick(seed, 'facial', MALE_FACIAL) : 'none'

  // Rosy cheeks on kids of either gender, and often on women.
  const blush = age < 6 || (!male && hashStr(`${seed}:blush`) % 3 === 0)

  return {
    female: !male,
    skin: pick(seed, 'skin', SKIN_TONES),
    hair,
    hairStyle,
    shirt: pick(seed, 'shirt', SHIRT_COLORS),
    bg: pick(seed, 'bg', BG_COLORS),
    eyes: hashStr(`${seed}:eyes`) % 3,
    mouth: hashStr(`${seed}:mouth`) % 3,
    brows: hashStr(`${seed}:brows`) % 2,
    facialHair,
    blush,
  }
}
