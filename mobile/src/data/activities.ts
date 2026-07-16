import type { CrimeAction, OngoingActivity } from '../types'

/**
 * Ongoing pursuits (sport / mind / hobby). You take one up per category
 * and keep doing it every year until you switch or stop — no need to
 * re-pick each year. Each boosts a stat yearly and has a hidden yearly
 * cost (country-scaled) charged from age 18. Crimes are separate,
 * one-time actions with a chance of getting caught.
 */

export const LANGUAGE_YEARS = 5

export const ONGOING_ACTIVITIES: OngoingActivity[] = [
  // ----- Sport (all boost health) -----
  {
    id: 'gym',
    category: 'sport',
    emoji: '🏋️',
    name: 'Hit the gym',
    description: 'Lift weights and build strength. Health and looks up.',
    minAge: 12,
    yearly: { health: 6, looks: 3 },
    cost: 600,
  },
  {
    id: 'basketball',
    category: 'sport',
    emoji: '🏀',
    name: 'Play basketball',
    description: 'Join pickup games at the court. Health and happiness up.',
    minAge: 8,
    yearly: { health: 5, happiness: 3 },
    cost: 150,
  },
  {
    id: 'soccer',
    category: 'sport',
    emoji: '⚽',
    name: 'Play soccer',
    description: 'Run the pitch every week. Great for the heart.',
    minAge: 6,
    yearly: { health: 5, happiness: 3 },
    cost: 150,
  },
  {
    id: 'running',
    category: 'sport',
    emoji: '🏃',
    name: 'Go running',
    description: 'Free, simple, and brutal on the lungs at first.',
    minAge: 8,
    yearly: { health: 6 },
    cost: 40,
  },

  // ----- Mind -----
  {
    id: 'read-books',
    category: 'mind',
    emoji: '📚',
    name: 'Read books',
    description: 'Work through a stack of books each year. Smarts up.',
    minAge: 6,
    yearly: { smarts: 4 },
    cost: 120,
  },
  {
    id: 'learn-language',
    category: 'mind',
    emoji: '🗣️',
    name: 'Learn a language',
    description: `Study a new language. Takes ${LANGUAGE_YEARS} years, then you're fluent.`,
    minAge: 8,
    yearly: { smarts: 2 },
    cost: 300,
    durationYears: LANGUAGE_YEARS,
  },
  {
    id: 'meditation',
    category: 'mind',
    emoji: '🧘',
    name: 'Meditate',
    description: 'A calm mind, one breath at a time. Happiness up.',
    minAge: 10,
    yearly: { happiness: 4, health: 1 },
    cost: 0,
  },
  {
    id: 'chess',
    category: 'mind',
    emoji: '♟️',
    name: 'Play chess',
    description: 'Sharpen your strategy at the club. Smarts up.',
    minAge: 8,
    yearly: { smarts: 3, happiness: 2 },
    cost: 60,
  },

  // ----- Hobbies (varied stats) -----
  {
    id: 'painting',
    category: 'hobby',
    emoji: '🎨',
    name: 'Painting',
    description: 'Express yourself on canvas. Happiness and looks up.',
    minAge: 8,
    yearly: { happiness: 4, looks: 2 },
    cost: 200,
  },
  {
    id: 'guitar',
    category: 'hobby',
    emoji: '🎸',
    name: 'Play guitar',
    description: 'Learn songs and jam. Happiness up.',
    minAge: 10,
    yearly: { happiness: 5 },
    cost: 180,
  },
  {
    id: 'cooking',
    category: 'hobby',
    emoji: '🍳',
    name: 'Cooking',
    description: 'Master the kitchen. Happiness and a bit of health up.',
    minAge: 10,
    yearly: { happiness: 3, health: 2 },
    cost: 220,
  },
  {
    id: 'gardening',
    category: 'hobby',
    emoji: '🌷',
    name: 'Gardening',
    description: 'Grow your own little paradise. Calming and healthy.',
    minAge: 12,
    yearly: { happiness: 3, health: 2 },
    cost: 160,
  },
]

/** Languages picked at random when you start learning one. */
export const LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Mandarin',
  'Korean', 'Arabic', 'Portuguese', 'Russian', 'Greek', 'Dutch',
]

export const CRIMES: CrimeAction[] = [
  {
    id: 'pickpocket',
    emoji: '🖐️',
    name: 'Pickpocket',
    description: 'Lift a wallet from a distracted stranger. Small risk, small reward.',
    minAge: 10,
    catchChance: 0.25,
    reward: 300,
    success: { happiness: 2 },
    caught: { money: -500, happiness: -12, health: -2 },
  },
  {
    id: 'robbery',
    emoji: '🔫',
    name: 'Rob a store',
    description: 'Hold up the corner shop. More cash, more heat.',
    minAge: 14,
    catchChance: 0.4,
    reward: 2500,
    success: { happiness: 4 },
    caught: { money: -3000, happiness: -25, health: -8 },
  },
  {
    id: 'scam',
    emoji: '💻',
    name: 'Run a scam',
    description: 'Con people out of their savings online. Lucrative, if you cover your tracks.',
    minAge: 16,
    catchChance: 0.35,
    reward: 5000,
    success: { smarts: 2, happiness: 3 },
    caught: { money: -6000, happiness: -20, smarts: 1 },
  },
  {
    id: 'gta',
    emoji: '🚗',
    name: 'Steal a car',
    description: 'Hotwire a nice ride and sell it to a chop shop. Grand theft auto.',
    minAge: 15,
    catchChance: 0.45,
    reward: 6000,
    success: { happiness: 5 },
    caught: { money: -8000, happiness: -25, health: -6 },
  },
  {
    id: 'murder',
    emoji: '🔪',
    name: 'Commit murder',
    description: 'The darkest deed. No going back — and a very good chance you get caught.',
    minAge: 16,
    catchChance: 0.6,
    reward: 0,
    success: { happiness: -12, health: -3 },
    caught: { money: -25000, happiness: -50, health: -25 },
  },
]

export function getActivity(id: string | null): OngoingActivity | undefined {
  return id ? ONGOING_ACTIVITIES.find((a) => a.id === id) : undefined
}

export function getCrime(id: string): CrimeAction | undefined {
  return CRIMES.find((c) => c.id === id)
}
