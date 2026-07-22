import type { Gender } from '../types'
import type { AgeStage } from './avatar'

/**
 * A hand-rolled flat-vector portrait that visibly changes with life stage —
 * toddler, child, teen, adult, middle-aged, old — the way DiceBear can't. It
 * honours the player's skin tone, hair colour, hair length and gender, and
 * layers on age cues: a big round toddler head and rosy cheeks, a leaner teen,
 * greying + wrinkles at middle age, and a balding/silver/wrinkled elder.
 */

export interface FaceOpts {
  skin: string // 6-hex, no #
  hair: string // 6-hex, no # (already aged/greyed by the caller)
  shirt: string // 6-hex, no #
  gender: Gender
  stage: AgeStage
  hairLong: boolean
  glasses: boolean
  beard: boolean
}

function darken(hex: string, f = 0.72): string {
  const n = parseInt(hex, 16)
  if (Number.isNaN(n)) return '2a1e18'
  const r = Math.round(((n >> 16) & 255) * f)
  const g = Math.round(((n >> 8) & 255) * f)
  const b = Math.round((n & 255) * f)
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

interface StageDef {
  cy: number
  rx: number
  ry: number
  eye: number
  eyeDX: number
  browY: number
  mouthY: number
  mouthW: number
  cheek: number
  bodyY: number
  wrinkles: 0 | 1 | 2
  recede: number // 0 none, 1 slight, 2 heavy (front hairline pulled back)
}

const STAGES: Record<AgeStage, StageDef> = {
  //        cy   rx    ry   eye  eyeDX browY mouthY mouthW cheek bodyY wr  recede
  baby: { cy: 47, rx: 31, ry: 30, eye: 5.4, eyeDX: 11.5, browY: 39, mouthY: 60, mouthW: 8, cheek: 7, bodyY: 88, wrinkles: 0, recede: 0 },
  child: { cy: 46, rx: 28.5, ry: 28.5, eye: 4.5, eyeDX: 10.5, browY: 38, mouthY: 60, mouthW: 9, cheek: 5, bodyY: 88, wrinkles: 0, recede: 0 },
  teen: { cy: 45, rx: 26, ry: 30, eye: 3.9, eyeDX: 9.5, browY: 37, mouthY: 61, mouthW: 8, cheek: 0, bodyY: 89, wrinkles: 0, recede: 0 },
  young: { cy: 45, rx: 26, ry: 31, eye: 3.7, eyeDX: 9.5, browY: 37, mouthY: 62, mouthW: 8, cheek: 0, bodyY: 89, wrinkles: 0, recede: 0 },
  adult: { cy: 45, rx: 26, ry: 31, eye: 3.6, eyeDX: 9.5, browY: 37, mouthY: 62, mouthW: 8, cheek: 0, bodyY: 89, wrinkles: 1, recede: 1 },
  senior: { cy: 45, rx: 25, ry: 31, eye: 3.3, eyeDX: 9.2, browY: 37, mouthY: 62, mouthW: 7, cheek: 0, bodyY: 89, wrinkles: 2, recede: 2 },
}

const R = (n: number) => Math.round(n * 100) / 100

export function faceSvg(o: FaceOpts): string {
  const s = STAGES[o.stage]
  const skin = `#${o.skin}`
  const skinShade = `#${darken(o.skin, 0.9)}`
  const hair = `#${o.hair}`
  const brow = `#${darken(o.hair, 0.82)}`
  const line = `#${darken(o.skin, 0.78)}` // wrinkles / soft features
  const cx = 50
  const cy = s.cy
  const eyeY = cy - 1

  const parts: string[] = []

  // Background disc.
  parts.push(`<rect width="100" height="100" fill="#dbeaff"/>`)

  // Shoulders / shirt.
  parts.push(
    `<path d="M${R(cx - 34)},100 C${R(cx - 30)},${s.bodyY} ${R(cx - 16)},${s.bodyY - 4} ${cx},${s.bodyY - 4} C${R(cx + 16)},${s.bodyY - 4} ${R(cx + 30)},${s.bodyY} ${R(cx + 34)},100 Z" fill="#${o.shirt}"/>`,
  )
  // Neck.
  parts.push(`<rect x="${R(cx - 6)}" y="${R(cy + s.ry - 8)}" width="12" height="14" rx="5" fill="${skinShade}"/>`)

  // Ears.
  const earY = cy + 1
  parts.push(`<ellipse cx="${R(cx - s.rx + 1)}" cy="${earY}" rx="4" ry="5.5" fill="${skin}"/>`)
  parts.push(`<ellipse cx="${R(cx + s.rx - 1)}" cy="${earY}" rx="4" ry="5.5" fill="${skin}"/>`)

  // Head.
  parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${s.rx}" ry="${s.ry}" fill="${skin}"/>`)

  // Long hair sits behind the face (draw side panels first).
  if (o.hairLong && o.stage !== 'baby') {
    const topY = cy - s.ry + (s.recede >= 2 ? 8 : 4)
    parts.push(
      `<path d="M${R(cx - s.rx - 1)},${R(cy + s.ry * 0.5)} C${R(cx - s.rx - 3)},${topY} ${R(cx - s.rx * 0.4)},${R(topY - 6)} ${cx},${R(topY - 6)} C${R(cx + s.rx * 0.4)},${R(topY - 6)} ${R(cx + s.rx + 3)},${topY} ${R(cx + s.rx + 1)},${R(cy + s.ry * 0.5)} L${R(cx + s.rx - 2)},${R(cy + s.ry * 0.55)} C${R(cx + s.rx - 2)},${R(cy - 2)} ${R(cx + s.rx - 4)},${R(cy - s.ry * 0.5)} ${cx},${R(cy - s.ry * 0.6)} C${R(cx - s.rx + 4)},${R(cy - s.ry * 0.5)} ${R(cx - s.rx + 2)},${R(cy - 2)} ${R(cx - s.rx + 2)},${R(cy + s.ry * 0.55)} Z" fill="${hair}"/>`,
    )
  }

  // Cheeks (toddler / child).
  if (s.cheek > 0) {
    parts.push(`<circle cx="${R(cx - s.eyeDX - 2)}" cy="${R(cy + 5)}" r="${s.cheek}" fill="#ff8f9c" opacity="0.45"/>`)
    parts.push(`<circle cx="${R(cx + s.eyeDX + 2)}" cy="${R(cy + 5)}" r="${s.cheek}" fill="#ff8f9c" opacity="0.45"/>`)
  }

  // Eyes (white + pupil + highlight).
  const eye = (ex: number) => {
    const w = s.eye * 1.05
    return (
      `<ellipse cx="${R(ex)}" cy="${eyeY}" rx="${R(w)}" ry="${R(s.eye)}" fill="#ffffff"/>` +
      `<circle cx="${R(ex)}" cy="${R(eyeY + 0.5)}" r="${R(s.eye * 0.62)}" fill="#3b3026"/>` +
      `<circle cx="${R(ex + s.eye * 0.25)}" cy="${R(eyeY - s.eye * 0.2)}" r="${R(s.eye * 0.2)}" fill="#ffffff"/>`
    )
  }
  parts.push(eye(cx - s.eyeDX))
  parts.push(eye(cx + s.eyeDX))

  // Eyebrows.
  const brc = (bx: number, dir: number) =>
    `<path d="M${R(bx - 4)},${R(s.browY + 1)} Q${R(bx)},${R(s.browY - 1.6)} ${R(bx + 4)},${R(s.browY + 1)}" stroke="${brow}" stroke-width="${o.stage === 'baby' ? 1.4 : 2}" fill="none" stroke-linecap="round" transform="scale(${dir},1) translate(${dir < 0 ? -100 : 0},0)"/>`
  parts.push(brc(cx - s.eyeDX, 1))
  parts.push(brc(cx + s.eyeDX, 1))

  // Nose.
  parts.push(`<path d="M${R(cx)},${R(eyeY + 4)} q1.6,3 -1.4,3.6" stroke="${line}" stroke-width="1.3" fill="none" stroke-linecap="round"/>`)

  // Mouth (a friendly smile).
  parts.push(
    `<path d="M${R(cx - s.mouthW)},${s.mouthY} Q${cx},${R(s.mouthY + 4.5)} ${R(cx + s.mouthW)},${s.mouthY}" stroke="#a34a52" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  )

  // Beard (men, adult+).
  if (o.beard && o.gender === 'male' && (o.stage === 'young' || o.stage === 'adult' || o.stage === 'senior')) {
    parts.push(
      `<path d="M${R(cx - s.rx + 3)},${R(cy + 2)} C${R(cx - s.rx + 2)},${R(cy + s.ry - 2)} ${cx},${R(cy + s.ry + 3)} ${cx},${R(cy + s.ry + 3)} C${cx},${R(cy + s.ry + 3)} ${R(cx + s.rx - 2)},${R(cy + s.ry - 2)} ${R(cx + s.rx - 3)},${R(cy + 2)} C${R(cx + s.rx - 8)},${R(cy + 10)} ${R(cx - s.rx + 8)},${R(cy + 10)} ${R(cx - s.rx + 3)},${R(cy + 2)} Z" fill="${hair}"/>`,
    )
    // Moustache above the lip.
    parts.push(`<path d="M${R(cx - 6)},${R(s.mouthY - 2)} Q${cx},${R(s.mouthY)} ${R(cx + 6)},${R(s.mouthY - 2)}" stroke="${hair}" stroke-width="3" fill="none" stroke-linecap="round"/>`)
  }

  // Hair on top. Baby = wispy tuft; recede pulls the hairline back.
  const topY = cy - s.ry
  if (o.stage === 'baby') {
    parts.push(`<path d="M${R(cx - 6)},${R(topY + 6)} q6,-9 12,0" stroke="${hair}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`)
    parts.push(`<circle cx="${cx}" cy="${R(topY + 3)}" r="2.4" fill="${hair}"/>`)
  } else if (s.recede >= 2) {
    // Elder: mostly bald on top, hair on the sides/back only.
    parts.push(
      `<path d="M${R(cx - s.rx + 1)},${R(cy + 3)} C${R(cx - s.rx - 1)},${R(cy - s.ry * 0.4)} ${R(cx - s.rx * 0.5)},${R(cy - s.ry * 0.55)} ${R(cx - s.rx * 0.2)},${R(cy - s.ry * 0.5)} L${R(cx - s.rx * 0.2)},${R(cy - s.ry * 0.28)} C${R(cx - s.rx * 0.5)},${R(cy - s.ry * 0.34)} ${R(cx - s.rx + 3)},${R(cy - 2)} ${R(cx - s.rx + 3)},${R(cy + 3)} Z" fill="${hair}"/>`,
    )
    parts.push(
      `<path d="M${R(cx + s.rx - 1)},${R(cy + 3)} C${R(cx + s.rx + 1)},${R(cy - s.ry * 0.4)} ${R(cx + s.rx * 0.5)},${R(cy - s.ry * 0.55)} ${R(cx + s.rx * 0.2)},${R(cy - s.ry * 0.5)} L${R(cx + s.rx * 0.2)},${R(cy - s.ry * 0.28)} C${R(cx + s.rx * 0.5)},${R(cy - s.ry * 0.34)} ${R(cx + s.rx - 3)},${R(cy - 2)} ${R(cx + s.rx - 3)},${R(cy + 3)} Z" fill="${hair}"/>`,
    )
  } else {
    // Short/normal hair cap. Middle-aged men get a slightly receded M-hairline.
    const front = s.recede === 1 && o.gender === 'male' ? 4 : 0
    parts.push(
      `<path d="M${R(cx - s.rx - 1)},${R(cy + 2)} C${R(cx - s.rx - 2)},${R(topY + 4)} ${R(cx - s.rx * 0.5)},${R(topY - 3)} ${cx},${R(topY - 3 + front)} C${R(cx + s.rx * 0.5)},${R(topY - 3)} ${R(cx + s.rx + 2)},${R(topY + 4)} ${R(cx + s.rx + 1)},${R(cy + 2)} C${R(cx + s.rx - 4)},${R(cy - s.ry * 0.42)} ${R(cx + s.rx * 0.4)},${R(cy - s.ry * 0.62 + front)} ${cx},${R(cy - s.ry * 0.6 + front)} C${R(cx - s.rx * 0.4)},${R(cy - s.ry * 0.62 + front)} ${R(cx - s.rx + 4)},${R(cy - s.ry * 0.42)} ${R(cx - s.rx - 1)},${R(cy + 2)} Z" fill="${hair}"/>`,
    )
  }

  // Wrinkles.
  if (s.wrinkles >= 1) {
    // Nasolabial (smile) lines.
    parts.push(`<path d="M${R(cx - s.eyeDX + 2)},${R(cy + 7)} q-2,4 0,7" stroke="${line}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>`)
    parts.push(`<path d="M${R(cx + s.eyeDX - 2)},${R(cy + 7)} q2,4 0,7" stroke="${line}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>`)
  }
  if (s.wrinkles >= 2) {
    // Forehead lines + crow's feet + under-eye.
    parts.push(`<path d="M${R(cx - 8)},${R(topY + s.ry * 0.55)} q8,-2 16,0" stroke="${line}" stroke-width="0.9" fill="none" opacity="0.5"/>`)
    parts.push(`<path d="M${R(cx - 8)},${R(topY + s.ry * 0.55 + 3)} q8,-2 16,0" stroke="${line}" stroke-width="0.9" fill="none" opacity="0.4"/>`)
    parts.push(`<path d="M${R(cx - s.eyeDX - s.eye - 1)},${R(eyeY - 1)} l-3,-1.5 M${R(cx - s.eyeDX - s.eye - 1)},${R(eyeY + 1)} l-3,0" stroke="${line}" stroke-width="0.8" opacity="0.5"/>`)
    parts.push(`<path d="M${R(cx + s.eyeDX + s.eye + 1)},${R(eyeY - 1)} l3,-1.5 M${R(cx + s.eyeDX + s.eye + 1)},${R(eyeY + 1)} l3,0" stroke="${line}" stroke-width="0.8" opacity="0.5"/>`)
  }

  // Glasses.
  if (o.glasses && o.stage !== 'baby') {
    const gy = eyeY
    const lr = s.eye + 2.4
    parts.push(
      `<rect x="${R(cx - s.eyeDX - lr)}" y="${R(gy - lr)}" width="${R(lr * 2)}" height="${R(lr * 2)}" rx="3" fill="none" stroke="#2f3542" stroke-width="1.6"/>`,
    )
    parts.push(
      `<rect x="${R(cx + s.eyeDX - lr)}" y="${R(gy - lr)}" width="${R(lr * 2)}" height="${R(lr * 2)}" rx="3" fill="none" stroke="#2f3542" stroke-width="1.6"/>`,
    )
    parts.push(`<line x1="${R(cx - s.eyeDX + lr)}" y1="${gy}" x2="${R(cx + s.eyeDX - lr)}" y2="${gy}" stroke="#2f3542" stroke-width="1.6"/>`)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">${parts.join('')}</svg>`
}
