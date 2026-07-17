import type { GameEvent } from '../types'
import { scaleByCountry } from './countries'
import { UNIVERSITY_YEARS } from '../store/constants'

/**
 * Scripted events fired by the engine at fixed moments,
 * not drawn from the random pool.
 */

/**
 * Pops when someone close (or a pet) dies — plan/attend the funeral,
 * BitLife style. Costs are country-scaled; skipping stings a little.
 */
export function funeralEvent(name: string, isPet: boolean, countryCode: string): GameEvent {
  if (isPet) {
    const burial = scaleByCountry(500, countryCode)
    return {
      id: 'special-funeral',
      emoji: '🐾',
      title: `Goodbye, ${name}`,
      description: `${name} has passed away. How would you like to say farewell to your beloved companion?`,
      minAge: 0,
      maxAge: 120,
      choices: [
        {
          label: `Pet memorial & burial ($${burial.toLocaleString()})`,
          outcome: `You gave ${name} a proper little send-off. Rest easy, friend.`,
          effects: { money: -burial, happiness: 6 },
          sfx: 'death',
        },
        {
          label: 'Bury them in the backyard',
          outcome: `You buried ${name} in the garden and marked the spot with a stone.`,
          effects: { happiness: 2 },
        },
        {
          label: 'Say a quiet goodbye',
          outcome: `You said your goodbyes to ${name}. It hurt more than you expected.`,
          effects: { happiness: -1 },
        },
      ],
    }
  }

  const lavish = scaleByCountry(6000, countryCode)
  const modest = scaleByCountry(1800, countryCode)
  return {
    id: 'special-funeral',
    emoji: '⚰️',
    title: `Farewell to ${name}`,
    description: `${name} has passed away. As next of kin, it falls to you to arrange the funeral.`,
    minAge: 0,
    maxAge: 120,
    choices: [
      {
        label: `Lavish funeral ($${lavish.toLocaleString()})`,
        outcome: `You gave ${name} a beautiful send-off. Everyone said it honoured them well.`,
        effects: { money: -lavish, happiness: 9 },
        sfx: 'death',
      },
      {
        label: `Modest service ($${modest.toLocaleString()})`,
        outcome: `You held a simple, heartfelt service for ${name}.`,
        effects: { money: -modest, happiness: 5 },
        sfx: 'death',
      },
      {
        label: 'Just attend the funeral',
        outcome: `You attended ${name}'s funeral and said your goodbyes.`,
        effects: { happiness: 1 },
      },
      {
        label: 'Skip it',
        outcome: `You didn't go to ${name}'s funeral. The guilt lingered.`,
        effects: { happiness: -6 },
      },
    ],
  }
}

/** Pops when a language pursuit reaches fluency. */
export function languageCompleteEvent(label: string): GameEvent {
  return {
    id: 'special-language',
    emoji: '🎉',
    title: `Fluent in ${label}!`,
    description: `After five years of study, you are now fluent in ${label}. Your mind feels sharper for it.`,
    minAge: 0,
    maxAge: 120,
    choices: [
      {
        label: 'Excellent!',
        outcome: `You became fluent in ${label}. 🎉`,
        effects: { smarts: 12, happiness: 8 },
      },
    ],
  }
}

/** Shown when the character is convicted and sent to prison. */
export function arrestEvent(crimeName: string, sentence: number): GameEvent {
  return {
    id: 'special-arrest',
    emoji: '👮',
    title: 'Busted!',
    description: `You were caught, arrested, and hauled before a judge for ${crimeName.toLowerCase()}. The gavel comes down: ${sentence} year${sentence === 1 ? '' : 's'} in prison.`,
    minAge: 0,
    maxAge: 120,
    choices: [
      {
        label: 'Accept your fate',
        outcome: `You were sentenced to ${sentence} year${sentence === 1 ? '' : 's'} behind bars.`,
        effects: { happiness: -15 },
        sfx: 'police',
      },
    ],
  }
}

/** Shown the year the character is released from prison. */
export const RELEASE_EVENT: GameEvent = {
  id: 'special-release',
  emoji: '🕊️',
  title: 'A Free Person',
  description:
    'The gates open and you walk out into the sunlight, a free person at last. The world has moved on without you — time to rebuild.',
  minAge: 0,
  maxAge: 120,
  choices: [
    {
      label: 'Breathe the fresh air',
      outcome: 'You were released from prison. A fresh start, with a record that follows you.',
      effects: { happiness: 12 },
    },
  ],
}

/** Random events that only fire while incarcerated. */
export const PRISON_EVENTS: GameEvent[] = [
  {
    id: 'special-prison-fight',
    emoji: '🥊',
    title: 'Yard Trouble',
    description: 'A hulking inmate shoves you in the yard and the whole block goes quiet, waiting to see what you do.',
    minAge: 0,
    maxAge: 120,
    choices: [
      { label: 'Fight back', outcome: 'You fought back and earned some respect — and a black eye.', effects: { health: -8, happiness: 3 }, sfx: 'punch' },
      { label: 'Back down', outcome: 'You backed down. Safer, but the whole block noticed.', effects: { happiness: -5 } },
    ],
  },
  {
    id: 'special-prison-gang',
    emoji: '🩸',
    title: 'A Gang Comes Calling',
    description: 'One of the prison gangs offers you "protection" — for a price and your loyalty.',
    minAge: 0,
    maxAge: 120,
    choices: [
      { label: 'Join up', outcome: 'You joined the gang. Safety in numbers, but they own you now.', effects: { happiness: 2, health: 2 } },
      { label: 'Go it alone', outcome: 'You turned them down and watched your back all year.', effects: { happiness: -4, smarts: 1 } },
    ],
  },
  {
    id: 'special-prison-contraband',
    emoji: '📦',
    title: 'Contraband',
    description: 'A guard offers to smuggle in a phone so you can contact the outside world.',
    minAge: 0,
    maxAge: 120,
    choices: [
      { label: 'Take the risk', outcome: 'You got the phone and felt connected again — until the next cell search.', effects: { happiness: 5, money: -300 } },
      { label: 'Not worth it', outcome: 'You passed. Keeping your nose clean felt like the smart play.', effects: { smarts: 1 } },
    ],
  },
  {
    id: 'special-prison-library',
    emoji: '📚',
    title: 'The Prison Library',
    description: 'You have a lot of time on your hands. The prison library is quiet and mostly empty.',
    minAge: 0,
    maxAge: 120,
    choices: [
      { label: 'Read everything', outcome: 'You read every book you could find. Prison made you sharper.', effects: { smarts: 6, happiness: 2 } },
      { label: 'Nap instead', outcome: 'You mostly napped. The days blurred together.', effects: { happiness: 1, health: 1 } },
    ],
  },
]

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
