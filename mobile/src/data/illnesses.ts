import type { Stats } from '../types'

/**
 * Illnesses the character can catch. Three flavours:
 *  - `minor`   short-term bugs (colds, flu) that mostly clear on their own;
 *  - `std`     caught from hookups, they linger until treated;
 *  - `serious` cancers and chronic disease — dangerous, sometimes terminal,
 *              but often beatable if you seek treatment.
 */
export type IllnessKind = 'minor' | 'std' | 'serious'

export interface Illness {
  id: string
  name: string
  emoji: string
  kind: IllnessKind
  desc: string
  /** Yearly toll while you have it (negative deltas). */
  yearly: Partial<Pick<Stats, 'health' | 'happiness' | 'looks'>>
  /** Chance per year it clears up on its own (0 = never without treatment). */
  selfHeal: number
  /** US-base treatment cost (country-scaled) and the chance treatment cures it. */
  treatCost: number
  treatCure: number
  /** Chance per year it proves fatal while untreated (0 = not deadly). */
  fatalPerYear: number
  /** Youngest age it can strike. */
  minAge?: number
  /** Restrict to one sex where it only applies to one. */
  sex?: 'male' | 'female'
}

export const ILLNESSES: Illness[] = [
  // ----- Common, short-term bugs (mostly a mood/comfort hit, not lasting harm) -----
  { id: 'cold', name: 'Common Cold', emoji: '🤧', kind: 'minor', desc: 'Sniffles, a stuffy nose and a scratchy throat.', yearly: { happiness: -3 }, selfHeal: 0.88, treatCost: 60, treatCure: 0.9, fatalPerYear: 0 },
  { id: 'flu', name: 'The Flu', emoji: '🤒', kind: 'minor', desc: 'Fever, chills and aches that flatten you for a week.', yearly: { health: -1, happiness: -4 }, selfHeal: 0.82, treatCost: 120, treatCure: 0.9, fatalPerYear: 0 },
  { id: 'stomach-bug', name: 'Stomach Bug', emoji: '🤢', kind: 'minor', desc: 'A miserable few days near the bathroom.', yearly: { happiness: -4 }, selfHeal: 0.88, treatCost: 90, treatCure: 0.9, fatalPerYear: 0 },
  { id: 'bronchitis', name: 'Bronchitis', emoji: '😷', kind: 'minor', desc: 'A deep, lingering chest cough.', yearly: { health: -2, happiness: -3 }, selfHeal: 0.62, treatCost: 220, treatCure: 0.9, fatalPerYear: 0 },
  { id: 'mono', name: 'Mono', emoji: '😪', kind: 'minor', desc: 'The "kissing disease" — bone-deep exhaustion.', yearly: { health: -1, happiness: -4 }, selfHeal: 0.72, treatCost: 180, treatCure: 0.85, fatalPerYear: 0, minAge: 12 },
  { id: 'migraines', name: 'Chronic Migraines', emoji: '🤕', kind: 'minor', desc: 'Blinding headaches that come and go.', yearly: { happiness: -6 }, selfHeal: 0.4, treatCost: 260, treatCure: 0.7, fatalPerYear: 0 },

  // ----- STDs (from hookups) — linger until treated -----
  { id: 'chlamydia', name: 'Chlamydia', emoji: '🦠', kind: 'std', desc: 'Common and, thankfully, curable with antibiotics.', yearly: { health: -1, happiness: -5 }, selfHeal: 0.05, treatCost: 300, treatCure: 0.92, fatalPerYear: 0, minAge: 16 },
  { id: 'gonorrhea', name: 'Gonorrhea', emoji: '🦠', kind: 'std', desc: 'A bacterial infection — antibiotics clear it up.', yearly: { health: -1, happiness: -5 }, selfHeal: 0.03, treatCost: 350, treatCure: 0.9, fatalPerYear: 0, minAge: 16 },
  { id: 'syphilis', name: 'Syphilis', emoji: '🦠', kind: 'std', desc: 'Curable early — genuinely dangerous if ignored.', yearly: { health: -3, happiness: -6 }, selfHeal: 0, treatCost: 600, treatCure: 0.85, fatalPerYear: 0.015, minAge: 16 },
  { id: 'herpes', name: 'Herpes', emoji: '🦠', kind: 'std', desc: 'Manageable, but it never truly goes away.', yearly: { happiness: -5, looks: -1 }, selfHeal: 0, treatCost: 400, treatCure: 0.2, fatalPerYear: 0, minAge: 16 },
  { id: 'hiv', name: 'HIV', emoji: '🎗️', kind: 'std', desc: 'Serious, but treatable and livable with modern medicine.', yearly: { health: -3, happiness: -7 }, selfHeal: 0, treatCost: 6000, treatCure: 0.15, fatalPerYear: 0.02, minAge: 16 },

  // ----- Serious / terminal — deadly (fatal each year), often beatable if treated -----
  { id: 'skin-cancer', name: 'Skin Cancer', emoji: '🎗️', kind: 'serious', desc: 'Caught early, it is often very beatable.', yearly: { health: -4, happiness: -8 }, selfHeal: 0.04, treatCost: 12000, treatCure: 0.65, fatalPerYear: 0.11, minAge: 25 },
  { id: 'breast-cancer', name: 'Breast Cancer', emoji: '🎗️', kind: 'serious', desc: 'Treatment is grueling, but frequently works.', yearly: { health: -5, happiness: -9 }, selfHeal: 0.03, treatCost: 22000, treatCure: 0.6, fatalPerYear: 0.14, minAge: 30, sex: 'female' },
  { id: 'prostate-cancer', name: 'Prostate Cancer', emoji: '🎗️', kind: 'serious', desc: 'Slow-moving and, with treatment, survivable.', yearly: { health: -3, happiness: -7 }, selfHeal: 0.04, treatCost: 20000, treatCure: 0.65, fatalPerYear: 0.09, minAge: 45, sex: 'male' },
  { id: 'lung-cancer', name: 'Lung Cancer', emoji: '🎗️', kind: 'serious', desc: 'Aggressive and hard to beat.', yearly: { health: -7, happiness: -10 }, selfHeal: 0.02, treatCost: 30000, treatCure: 0.42, fatalPerYear: 0.22, minAge: 35 },
  { id: 'leukemia', name: 'Leukemia', emoji: '🎗️', kind: 'serious', desc: 'Blood cancer — it can strike at any age.', yearly: { health: -6, happiness: -9 }, selfHeal: 0.04, treatCost: 35000, treatCure: 0.52, fatalPerYear: 0.18, minAge: 8 },
  { id: 'heart-disease', name: 'Heart Disease', emoji: '❤️‍🩹', kind: 'serious', desc: 'Manageable with care, deadly without it.', yearly: { health: -4, happiness: -6 }, selfHeal: 0.03, treatCost: 18000, treatCure: 0.5, fatalPerYear: 0.1, minAge: 40 },
  { id: 'diabetes', name: 'Type 2 Diabetes', emoji: '🩸', kind: 'serious', desc: 'A chronic condition — managed, rarely cured.', yearly: { health: -2, happiness: -4 }, selfHeal: 0, treatCost: 4000, treatCure: 0.2, fatalPerYear: 0.02, minAge: 30 },
]

export function getIllness(id: string): Illness | undefined {
  return ILLNESSES.find((i) => i.id === id)
}

/** A random illness of the given kind the character is eligible to catch. */
export function pickIllness(
  kind: IllnessKind,
  age: number,
  sex?: 'male' | 'female',
): Illness | null {
  const pool = ILLNESSES.filter(
    (i) => i.kind === kind && age >= (i.minAge ?? 0) && (!i.sex || i.sex === sex),
  )
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
}
