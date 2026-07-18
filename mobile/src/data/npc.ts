import type { Person } from '../types'

/**
 * Gives the people in your life their own lives: a career they hold as an
 * adult and a hobby they enjoy. Purely flavour — shown on their profile so
 * the world feels populated, BitLife style.
 */

export const NPC_CAREERS = [
  'Nurse', 'Teacher', 'Chef', 'Electrician', 'Accountant', 'Barista', 'Mechanic',
  'Shop Owner', 'Bus Driver', 'Doctor', 'Firefighter', 'Salesperson', 'Plumber',
  'Hairdresser', 'Photographer', 'Software Developer', 'Farmer', 'Waiter', 'Lawyer',
  'Dentist', 'Musician', 'Writer', 'Banker', 'Carpenter', 'Pilot', 'Police Officer',
  'Vet', 'Real Estate Agent', 'Bartender', 'Florist', 'Journalist', 'Architect',
  'Graphic Designer', 'Pharmacist', 'Personal Trainer', 'Flight Attendant',
]

export const NPC_HOBBIES = [
  'painting', 'hiking', 'gaming', 'cooking', 'gardening', 'playing guitar', 'reading',
  'running', 'fishing', 'photography', 'yoga', 'knitting', 'cycling', 'baking',
  'birdwatching', 'dancing', 'woodworking', 'chess', 'pottery', 'travelling',
  'rock climbing', 'surfing', 'collecting vinyl', 'volunteering',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** A random career + hobby to attach to a new NPC. */
export function makeNpcLife(): { career: string; hobby: string } {
  return { career: pick(NPC_CAREERS), hobby: pick(NPC_HOBBIES) }
}

/** Just a hobby (kids get one before they pick a career). */
export function randomHobby(): string {
  return pick(NPC_HOBBIES)
}

/** How an NPC's occupation reads for their current age. */
export function describeOccupation(person: Pick<Person, 'age' | 'career'>): string {
  const { age, career } = person
  if (age < 2) return '👶 Baby'
  if (age < 6) return '🧸 Toddler'
  if (age < 18) return '🎒 Student'
  if (age >= 65) return career ? `🌴 Retired ${career}` : '🌴 Retired'
  return career ? `💼 ${career}` : '💼 Working'
}
