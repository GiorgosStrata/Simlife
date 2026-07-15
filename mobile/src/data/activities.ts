import type { Effects } from '../types'

/**
 * Things you actively choose to do each year. Each activity can be
 * done once per year (gated by usedActions in the store). Costs are
 * in fixed dollars. A few have special outcomes handled in the store.
 */
export interface Activity {
  id: string
  emoji: string
  name: string
  description: string
  minAge: number
  /** Upfront cost in dollars; 0 for free activities. */
  cost: number
  /** Deterministic stat effects (money in `effects` is applied on top of `cost`). */
  effects: Effects
  /** Special handling in the store, e.g. random money for the casino. */
  special?: 'casino' | 'surgery'
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'gym',
    emoji: '🏋️',
    name: 'Hit the gym',
    description: 'A year of workouts. Sweat now, thank yourself later.',
    minAge: 14,
    cost: 300,
    effects: { health: 8, looks: 5, happiness: 2 },
  },
  {
    id: 'run',
    emoji: '🏃',
    name: 'Go for runs',
    description: 'Free, fresh air, the occasional rain. Good for the heart.',
    minAge: 8,
    cost: 0,
    effects: { health: 6, happiness: 2 },
  },
  {
    id: 'meditate',
    emoji: '🧘',
    name: 'Meditate',
    description: 'Breathe in. Breathe out. Ignore your to-do list.',
    minAge: 10,
    cost: 0,
    effects: { happiness: 6, health: 1 },
  },
  {
    id: 'library',
    emoji: '📚',
    name: 'Read at the library',
    description: 'Bury yourself in books for a year. Knowledge is free here.',
    minAge: 6,
    cost: 0,
    effects: { smarts: 6 },
  },
  {
    id: 'hobby',
    emoji: '🎨',
    name: 'Take up a hobby',
    description: 'Painting, pottery, or amateur astronomy — your call.',
    minAge: 8,
    cost: 120,
    effects: { happiness: 6, smarts: 3 },
  },
  {
    id: 'spa',
    emoji: '💆',
    name: 'Spa day',
    description: 'Cucumber slices, hot stones, questionable herbal tea.',
    minAge: 16,
    cost: 200,
    effects: { happiness: 7, looks: 4, health: 2 },
  },
  {
    id: 'makeover',
    emoji: '💇',
    name: 'Get a makeover',
    description: 'New hair, new wardrobe, new you (mostly the hair).',
    minAge: 12,
    cost: 400,
    effects: { looks: 9, happiness: 3 },
  },
  {
    id: 'doctor',
    emoji: '🩺',
    name: 'See a doctor',
    description: 'A full check-up. Catch the small stuff before it grows.',
    minAge: 6,
    cost: 250,
    effects: { health: 10 },
  },
  {
    id: 'vacation',
    emoji: '🏖️',
    name: 'Take a vacation',
    description: 'A week somewhere warm with terrible Wi-Fi. Perfect.',
    minAge: 16,
    cost: 1500,
    effects: { happiness: 14, health: 4 },
  },
  {
    id: 'volunteer',
    emoji: '🙏',
    name: 'Volunteer',
    description: 'Give your time to a good cause. It gives back.',
    minAge: 12,
    cost: 0,
    effects: { happiness: 8, smarts: 1 },
  },
  {
    id: 'nightclub',
    emoji: '🕺',
    name: 'Go clubbing',
    description: 'A night of questionable music and worse decisions.',
    minAge: 18,
    cost: 150,
    effects: { happiness: 9, health: -3, looks: 1 },
  },
  {
    id: 'casino',
    emoji: '🎰',
    name: 'Hit the casino',
    description: 'The house always wins. But maybe not tonight?',
    minAge: 18,
    cost: 0,
    effects: {},
    special: 'casino',
  },
  {
    id: 'surgery',
    emoji: '💉',
    name: 'Plastic surgery',
    description: 'A dramatic glow-up — with a small chance of complications.',
    minAge: 18,
    cost: 8000,
    effects: {},
    special: 'surgery',
  },
]
