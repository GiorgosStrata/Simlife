import type { GameEvent } from '../types'
import { TUITION_PER_YEAR, UNIVERSITY_MIN_SMARTS, UNIVERSITY_YEARS } from '../store/constants'

/**
 * Scripted events fired by the engine at fixed moments,
 * not drawn from the random pool.
 */

/** Shown the year the character graduates high school (age 18). */
export const GRADUATION_EVENT: GameEvent = {
  id: 'special-graduation',
  title: 'Graduation Day 🎓',
  description:
    `You just graduated from high school! Time to decide what comes next. University takes ${UNIVERSITY_YEARS} years and costs $${TUITION_PER_YEAR.toLocaleString()}/year (needs ${UNIVERSITY_MIN_SMARTS} smarts), but unlocks the best careers.`,
  minAge: 18,
  maxAge: 18,
  choices: [
    {
      label: 'Apply to university',
      outcome: 'You sent off your university application.',
      effects: {},
      action: 'enrollUniversity',
    },
    {
      label: 'Get a job instead',
      outcome: 'You decided to jump straight into the workforce. The Career tab awaits.',
      effects: { money: 0 },
    },
    {
      label: 'Take a gap year',
      outcome: 'You took a year to breathe, travel cheap, and figure things out.',
      effects: { happiness: 8 },
    },
  ],
}
