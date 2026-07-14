/** The four core 0-100 attributes of a character. */
export interface Stats {
  health: number
  happiness: number
  smarts: number
  looks: number
}

export type StatKey = keyof Stats

/**
 * Stat changes applied by an event choice. All fields optional —
 * omitted stats are left untouched. Money is tracked separately
 * from the 0-100 stats and may be any positive or negative amount.
 */
export interface Effects extends Partial<Stats> {
  money?: number
}

export interface EventChoice {
  label: string
  /** Line written to the life log after picking this choice. */
  outcome: string
  effects: Effects
  /** Optional game action triggered on top of the stat effects. */
  action?: 'enrollUniversity'
}

export interface GameEvent {
  id: string
  /** Headline shown on the event card, e.g. "A Stray Dog". */
  title: string
  /** The situation presented to the player. */
  description: string
  /** Inclusive age range in which this event can fire. */
  minAge: number
  maxAge: number
  choices: EventChoice[]
}

export interface LogEntry {
  id: number
  age: number
  year: number
  text: string
  kind: 'birthday' | 'event' | 'info' | 'death' | 'career' | 'relationship'
}

/** Someone in the character's life. */
export type PersonRole = 'mother' | 'father' | 'sibling' | 'partner' | 'friend'

export interface Person {
  /**
   * Unique id. Family and partner use their role as the id (one of
   * each); friends get generated ids like "friend-1".
   */
  id: string
  name: string
  role: PersonRole
  age: number
  alive: boolean
  /** Bond strength 0-100; drifts down slowly each year. */
  relationship: number
}

export type PartnerStatus = 'dating' | 'engaged' | 'married'

/** One multiple-choice interview question. Kept obvious on purpose. */
export interface JobQuestion {
  q: string
  options: string[]
  /** Index into options. */
  answer: number
}

export interface Job {
  id: string
  title: string
  emoji: string
  /** Paid into money automatically every Age Up. */
  salary: number
  minAge: number
  minSmarts: number
  requiresDegree: boolean
  /** One of these is asked, at random, when applying. */
  questions: JobQuestion[]
}
