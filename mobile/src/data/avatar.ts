import type { Gender } from '../types'
import { faceSvg } from './faceAvatar'

/**
 * Avatars use the open-source DiceBear "avataaars" style (the friendly
 * cartoon faces used all over the web). We render them deterministically
 * from a seed for NPCs, or from an explicit config the player picks at
 * character creation. Hair styles are split into masculine/feminine pools
 * (plus facial hair for men) so gender reads clearly at a glance.
 */

/** Skin tones, light → dark (6-hex, no leading #). */
export const SKIN_TONES = ['ffdbb4', 'edb98a', 'fd9841', 'd08b5b', 'ae5d29', '694d3d']

/** Hair colours: naturals first, then a few fun dye colours. */
export const HAIR_COLORS = [
  '2c1b18', '4a312c', '724133', 'a55728', 'b58143', 'd6b370', 'e8e1e1', 'b7b7b7', // natural
  'c93305', 'e0457b', '506af4', '2ea44f', // fun
]
const NATURAL_HAIR = HAIR_COLORS.slice(0, 8)

/** Soft pastel backgrounds baked into the SVG. */
export const BG_COLORS = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c5f6d6']

/** Short/masculine hair tops. */
export const MALE_TOPS = [
  'shortFlat', 'shortRound', 'shortCurly', 'shortWaved', 'sides', 'theCaesar',
  'theCaesarAndSidePart', 'frizzle', 'shaggy', 'shaggyMullet', 'dreads01', 'dreads02',
]
/** Long/feminine hair tops. */
export const FEMALE_TOPS = [
  'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand', 'longButNotTooLong',
  'miaWallace', 'straight01', 'straight02', 'straightAndStrand', 'bigHair', 'shavedSides',
]

/** Eyebrow shapes (DiceBear avataaars ids) — recoloured to match hair below. */
export const EYEBROWS = [
  'defaultNatural', 'flatNatural', 'raisedExcitedNatural', 'upDownNatural', 'default',
  'raisedExcited', 'angryNatural', 'frownNatural', 'sadConcernedNatural', 'unibrowNatural',
]

/** '' = clean-shaven; the rest are DiceBear facial-hair ids (men). */
export const FACIAL_HAIR = ['', 'beardLight', 'beardMedium', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum']
/** '' = no glasses; the rest are DiceBear accessory ids. */
export const GLASSES = ['', 'round', 'prescription01', 'prescription02', 'wayfarers', 'sunglasses']

/** The player's chosen look (edited on the creation screen). */
export interface AvatarConfig {
  gender: Gender
  skinColor: string
  hairColor: string
  top: string
  /** DiceBear eyebrow shape id (see EYEBROWS). */
  eyebrows: string
  /** '' = none */
  facialHair: string
  /** '' = none */
  glasses: string
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Life stages that visibly change the avatar. */
export type AgeStage = 'baby' | 'child' | 'teen' | 'young' | 'adult' | 'senior'

/** Map an age to its look stage: <3, 3–11, 12–19, 19–40, 40–62, 62+. */
export function ageStage(age: number): AgeStage {
  if (age < 3) return 'baby'
  if (age <= 11) return 'child'
  if (age <= 18) return 'teen'
  if (age < 40) return 'young'
  if (age < 62) return 'adult'
  return 'senior'
}

/** Blend a 6-hex colour toward a target hex by t (0..1). */
function blendHex(hex: string, target: string, t: number): string {
  const a = parseInt(hex, 16)
  const b = parseInt(target, 16)
  if (Number.isNaN(a) || Number.isNaN(b)) return hex
  const mix = (sh: number) => {
    const ca = (a >> sh) & 255
    const cb = (b >> sh) & 255
    return Math.round(ca + (cb - ca) * t)
  }
  const r = mix(16)
  const g = mix(8)
  const bl = mix(0)
  return ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)
}

/**
 * How hair colour shifts with age. We blend hard toward a neutral grey so the
 * change is obvious for *every* base colour (blonde greys just as clearly as
 * black): a hint of grey in the 30s, salt-and-pepper at 40, and near-white
 * silver by the 60s.
 */
function agedHair(hairColor: string, stage: AgeStage, age: number): string {
  if (stage === 'senior') {
    // 62 → clearly grey, ramping to full silver by the late 70s.
    const t = Math.min(0.9, 0.7 + (age - 62) * 0.02)
    return blendHex(hairColor, 'e4e4e4', t)
  }
  if (stage === 'adult') {
    // 40 → light peppering, 55 → heavy salt-and-pepper.
    const t = Math.min(0.62, 0.28 + (age - 40) * 0.02)
    return blendHex(hairColor, '9a9a9a', t)
  }
  if (stage === 'young' && age >= 35) {
    // A few greys start creeping in mid-30s.
    return blendHex(hairColor, '9a9a9a', 0.16)
  }
  return hairColor
}

/** A fresh random look for a gender (used to seed the creation screen). */
export function randomAvatarConfig(gender: Gender): AvatarConfig {
  const male = gender === 'male'
  return {
    gender,
    skinColor: pickRandom(SKIN_TONES),
    hairColor: pickRandom(NATURAL_HAIR),
    top: pickRandom(male ? MALE_TOPS : FEMALE_TOPS),
    eyebrows: pickRandom(EYEBROWS),
    facialHair: male && Math.random() < 0.35 ? pickRandom(FACIAL_HAIR.slice(1)) : '',
    glasses: Math.random() < 0.18 ? pickRandom(GLASSES.slice(1)) : '',
  }
}

/** Keep a config valid after a gender switch (fix hair/beard). */
export function retargetGender(config: AvatarConfig, gender: Gender): AvatarConfig {
  const male = gender === 'male'
  const validTops = male ? MALE_TOPS : FEMALE_TOPS
  return {
    ...config,
    gender,
    top: validTops.includes(config.top) ? config.top : validTops[0],
    facialHair: male ? config.facialHair : '',
  }
}

/** Hairstyles that read as long/voluminous in the flat portrait. */
const LONG_TOPS = new Set([
  'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand', 'longButNotTooLong',
  'miaWallace', 'straight01', 'straight02', 'straightAndStrand', 'bigHair', 'shaggy',
  'shaggyMullet', 'dreads01', 'dreads02',
])

/** A soft shirt palette; a character keeps the same shirt as they age. */
const SHIRTS = ['6d8cf0', '5bb59b', 'e08a5b', 'b06fd6', '5b90c9', 'd98aa8', '7b7fd6', '5aa06a']

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** The player's portrait, drawn for their current life stage. */
export function configAvatarSvg(config: AvatarConfig, age = 25): string {
  const stage = ageStage(age)
  return faceSvg({
    skin: config.skinColor,
    hair: agedHair(config.hairColor, stage, age),
    shirt: SHIRTS[hashStr(config.skinColor + config.hairColor) % SHIRTS.length],
    gender: config.gender,
    stage,
    hairLong: LONG_TOPS.has(config.top),
    glasses: !!config.glasses,
    beard: !!config.facialHair,
  })
}

/** An NPC's portrait, derived deterministically from their seed + age. */
export function seedAvatarSvg(seed: string, gender: Gender, age: number): string {
  const h = hashStr(seed)
  const stage = ageStage(age)
  const baseHair = NATURAL_HAIR[(h >> 3) % NATURAL_HAIR.length]
  return faceSvg({
    skin: SKIN_TONES[h % SKIN_TONES.length],
    hair: agedHair(baseHair, stage, age),
    shirt: SHIRTS[(h >> 6) % SHIRTS.length],
    gender,
    stage,
    hairLong: gender === 'female' ? (h >> 9) % 5 !== 0 : (h >> 9) % 6 === 0,
    glasses: (h >> 12) % 5 === 0 && stage !== 'baby' && stage !== 'child',
    beard: gender === 'male' && (h >> 14) % 3 === 0,
  })
}
