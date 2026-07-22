import { createAvatar } from '@dicebear/core'
import { avataaars } from '@dicebear/collection'
import type { Gender } from '../types'

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

// Friendly-only expressions so nobody looks unsettling.
const EYES = ['default', 'happy', 'wink', 'squint', 'side']
const MOUTHS = ['smile', 'default', 'twinkle']
const CLOTHING = [
  'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck', 'hoodie', 'collarAndSweater',
  'blazerAndSweater', 'graphicShirt',
]

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

/** How hair colour shifts with age: greying at 40+, silver at 62+. */
function agedHair(hairColor: string, stage: AgeStage): string {
  if (stage === 'senior') return blendHex(hairColor, 'd8d8d8', 0.82) // silver
  if (stage === 'adult') return blendHex(hairColor, 'b7b7b7', 0.45) // salt & pepper
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

// DiceBear's exported option types don't surface the avataaars-specific
// keys (top, facialHair, …), so we build a plain object and cast once.
type AvataaarsOptions = Parameters<typeof createAvatar<typeof avataaars>>[1]

function build(opts: Record<string, unknown>): string {
  return createAvatar(avataaars, opts as AvataaarsOptions).toString()
}

/** Darken a 6-hex colour (no #) toward black by a factor — for brows/shadow. */
function darken(hex: string, factor = 0.68): string {
  const n = parseInt(hex, 16)
  if (Number.isNaN(n)) return '2a1e18'
  const r = Math.round(((n >> 16) & 255) * factor)
  const g = Math.round(((n >> 8) & 255) * factor)
  const b = Math.round((n & 255) * factor)
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Avataaars draws eyebrows as a fixed 60%-black shape, so they never match the
 * hair. We repaint them to a slightly-darkened hair colour after rendering.
 */
function recolorEyebrows(svg: string, hexNoHash: string): string {
  return svg.replace(/fill="#000" fill-opacity="\.6"/g, `fill="#${hexNoHash}" fill-opacity=".92"`)
}

/** Exact DiceBear options for the player's picked config, aged to `stage`. */
function configToOptions(c: AvatarConfig, stage: AgeStage, hair: string): Record<string, unknown> {
  const baby = stage === 'baby'
  // Facial hair only once it could grow in; babies/kids never wear glasses.
  const showBeard = !!c.facialHair && c.gender === 'male' && (stage === 'young' || stage === 'adult' || stage === 'senior')
  const showGlasses = !!c.glasses && !baby
  return {
    seed: 'player',
    top: [c.top],
    topProbability: baby ? 0 : 100, // babies are bald
    hairColor: [hair],
    skinColor: [c.skinColor],
    eyebrows: c.eyebrows ? [c.eyebrows] : EYEBROWS,
    facialHair: c.facialHair ? [c.facialHair] : [],
    facialHairProbability: showBeard ? 100 : 0,
    accessories: c.glasses ? [c.glasses] : [],
    accessoriesProbability: showGlasses ? 100 : 0,
    eyes: ['default'],
    mouth: ['smile'],
    clothing: CLOTHING,
    backgroundColor: BG_COLORS,
    backgroundType: ['solid'],
  }
}

/** Deterministic gendered options for an NPC from a stable seed. */
function seedToOptions(seed: string, gender: Gender, age: number): Record<string, unknown> {
  const male = gender === 'male'
  const stage = ageStage(age)
  const baby = stage === 'baby'
  // Hair colour pool ages: naturals when young, salt & pepper at 40+, silver at 62+.
  const hairColor =
    stage === 'senior'
      ? ['b7b7b7', 'e8e1e1', 'd8d8d8']
      : stage === 'adult'
        ? ['b7b7b7', 'a55728', '724133', 'b58143', 'd6b370']
        : NATURAL_HAIR
  return {
    seed,
    top: male ? MALE_TOPS : FEMALE_TOPS,
    topProbability: baby ? 0 : 100, // babies are bald
    hairColor,
    skinColor: SKIN_TONES,
    eyebrows: EYEBROWS,
    facialHair: FACIAL_HAIR.slice(1),
    facialHairProbability: male && (stage === 'young' || stage === 'adult' || stage === 'senior') ? 35 : 0,
    accessories: GLASSES.slice(1),
    accessoriesProbability: baby || stage === 'child' ? 0 : stage === 'senior' ? 24 : 12,
    eyes: EYES,
    mouth: MOUTHS,
    clothing: CLOTHING,
    backgroundColor: BG_COLORS,
    backgroundType: ['solid'],
  }
}

/** Build the avatar SVG string for a player config, aged to `age`. */
export function configAvatarSvg(config: AvatarConfig, age = 25): string {
  const stage = ageStage(age)
  const hair = agedHair(config.hairColor, stage)
  // Match brows to hair (a touch darker); old white brows are gone.
  return recolorEyebrows(build(configToOptions(config, stage, hair)), darken(hair))
}

/** Build the avatar SVG string for an NPC from a seed. */
export function seedAvatarSvg(seed: string, gender: Gender, age: number): string {
  const grey = age >= 62
  return recolorEyebrows(build(seedToOptions(seed, gender, age)), grey ? '8a8a8a' : '2a1e18')
}
