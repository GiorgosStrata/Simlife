import type { GameEvent } from '../types'
import { UNIVERSITY_YEARS } from '../store/constants'

/**
 * Scripted events fired by the engine at fixed moments,
 * not drawn from the random pool.
 */

/** Fires once in childhood when the parents split up. */
export const DIVORCE_EVENT: GameEvent = {
  id: 'special-divorce',
  emoji: '💔',
  title: 'Your Parents Are Divorcing',
  description:
    'Your parents sat you down at the kitchen table with those serious faces. They’re splitting up. Nothing will be quite the same.',
  minAge: 5,
  maxAge: 16,
  choices: [
    {
      label: 'Stay strong',
      outcome: 'You held it together for the family. It hardened you a little.',
      effects: { happiness: -8, smarts: 2 },
      action: 'parentsDivorce',
    },
    {
      label: 'Take it hard',
      outcome: 'You took it badly. The house felt colder for a long time.',
      effects: { happiness: -15, health: -3 },
      action: 'parentsDivorce',
    },
    {
      label: 'Blame yourself',
      outcome: 'You quietly wondered if it was your fault. It wasn’t, but the thought lingered.',
      effects: { happiness: -12, smarts: -2 },
      action: 'parentsDivorce',
    },
  ],
}

/** Shown the year the character graduates high school (age 18). */
export const GRADUATION_EVENT: GameEvent = {
  id: 'special-graduation',
  emoji: '🎓',
  title: 'Graduation Day 🎓',
  description:
    `You just graduated from high school! Time to decide what comes next. University takes ${UNIVERSITY_YEARS} years (tuition depends on your country) — you'll pick a major, and the good programs want good grades. A degree unlocks the best careers.`,
  minAge: 18,
  maxAge: 18,
  choices: [
    {
      label: '🎓 Apply to university',
      outcome: 'You decided to apply to university. Time to pick a major.',
      effects: {},
      action: 'enrollUniversity',
    },
    {
      label: '💼 Get a job instead',
      outcome: 'You decided to jump straight into the workforce. The Career tab awaits.',
      effects: { money: 0 },
    },
    {
      label: '🏖️ Take a gap year',
      outcome: 'You took a year to breathe, travel cheap, and figure things out.',
      effects: { happiness: 8 },
    },
  ],
}
