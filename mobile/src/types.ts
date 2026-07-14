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
  kind: 'birthday' | 'event' | 'info' | 'death'
}
