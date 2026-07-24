/** The five core 0-100 attributes of a character. */
export interface Stats {
  health: number
  happiness: number
  smarts: number
  looks: number
  /**
   * How wound-up you are, 0 (calm) to 100 (burnt out). A busy life — work,
   * study, a packed schedule, a big family, money trouble — drives it up;
   * rest, downtime and relaxation bring it down. Sustained high stress saps
   * your mood and health (and can bring on high blood pressure), while a
   * chronically low mood can tip into depression.
   */
  stress: number
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

/** App areas an event choice can jump straight into. */
export type DeepLink = 'investing' | 'health' | 'shop' | 'jobs' | 'social'

/** Life-situation flags an event can require before it's allowed to fire. */
export type EventFlag =
  | 'hasKids'
  | 'hasPartner'
  | 'single'
  | 'married'
  | 'hasJob'
  | 'noJob'
  | 'hasPet'
  | 'inSchool'

export interface EventChoice {
  label: string
  /** Line written to the life log after picking this choice. */
  outcome: string
  effects: Effects
  /** Open this app area right after the event resolves ("Invest" → Vestr). */
  opens?: DeepLink
  /** Actually take in the animal — a free pet of this species ("Cat", "Dog"…). */
  grantsPet?: string
  /** Actually take up this ongoing activity (an id from data/activities). */
  startsActivity?: string
  /** Actually make a new friend — a real NPC added to your social circle. */
  grantsFriend?: boolean
  /** Achievement id(s) this choice unlocks (e.g. trying drugs, winning the lottery). */
  unlocks?: string | string[]
  /** Optional game action triggered on top of the stat effects. */
  action?:
    | 'enrollUniversity'
    | 'parentsDivorce'
    | 'makeEnemy'
    | 'reconcile'
    | 'playLottery'
    /** Start dating a new person (e.g. asking someone out at a dance). */
    | 'startDating'
  /** Bond change applied to the person this event involves (see GameEvent.personId). */
  bond?: number
  /** Optional sound to play on this outcome (overrides the auto sting). */
  sfx?: import('./audio/sfx').SfxName
}

export interface GameEvent {
  id: string
  /** Big illustration emoji shown on the event card. */
  emoji: string
  /** Headline shown on the event card, e.g. "A Stray Dog". */
  title: string
  /** The situation presented to the player. */
  description: string
  /** Inclusive age range in which this event can fire. */
  minAge: number
  maxAge: number
  /** Life-situation flags that must ALL hold for this event to fire. */
  requires?: EventFlag[]
  choices: EventChoice[]
  /** For relationship events: the id of the person involved (bond target). */
  personId?: string
}

export interface LogEntry {
  id: number
  age: number
  year: number
  text: string
  kind: 'birthday' | 'event' | 'info' | 'death' | 'career' | 'relationship' | 'money'
}

export type Gender = 'male' | 'female'

/** Someone in the character's life. */
export type PersonRole =
  | 'mother'
  | 'father'
  | 'sibling'
  | 'partner'
  | 'child'
  | 'friend'
  | 'classmate'
  | 'teacher'
  | 'coworker'
  | 'boss'
  | 'enemy'
  /** A former partner you split up with. */
  | 'ex'
  /** Someone from a one-night stand you can still reach out to. */
  | 'fling'

export interface Person {
  /**
   * Unique id. Family and partner use their role as the id (one of
   * each); friends get generated ids like "friend-1".
   */
  id: string
  name: string
  role: PersonRole
  gender: Gender
  age: number
  alive: boolean
  /** Bond strength 0-100; drifts down slowly each year. */
  relationship: number
  /** The career this NPC holds in adulthood (shown as their occupation). */
  career?: string
  /** A hobby this NPC enjoys, for flavour. */
  hobby?: string
  /**
   * A parent's or partner's own accumulated savings, grown each year from
   * their career and trimmed by the children they support. Inherited by the
   * player when they die. Seeded lazily the first time it's needed.
   */
  wealth?: number
}

export type PartnerStatus = 'dating' | 'engaged' | 'married'

/** An illness the character currently has (see data/illnesses.ts). */
export interface ActiveCondition {
  /** Illness catalogue id. */
  id: string
  /** How many years they've had it, for progression and flavour. */
  years: number
}

/** A pet the character has adopted. */
export interface Pet {
  id: string
  /** Catalogue id (see data/pets.ts). */
  optionId: string
  name: string
  emoji: string
  breed: string
  age: number
  alive: boolean
  /** The pet's own 0-100 happiness (drops without care; vet restores). */
  happiness: number
  /** Bond with the owner, 0-100. */
  bond: number
}

/** A past playable character in your bloodline (for the family tree). */
export interface Ancestor {
  name: string
  gender: Gender
  bornYear: number
  diedYear: number
  ageAtDeath: number
  /** 1 = the founder, climbing with each generation. */
  generation: number
}

/** Live state for a pro sports career (basketball/football). */
export interface SportState {
  /** Team id (see data/leagues.ts). */
  teamId: string
  /** 0-100 skill rating; grows with training, peaks then declines with age. */
  skill: number
  /** Championships won. */
  titles: number
  /** MVP awards. */
  mvps: number
  /** Last season's record. */
  wins: number
  losses: number
}

/** Social media apps on the character's phone. */
export type SocialApp = 'rizzgram' | 'flicktok' | 'youtube' | 'onlystans'

export type ActivityCategory = 'sport' | 'mind' | 'hobby'

/**
 * An ongoing pursuit. You pick one per category and keep doing it every
 * year (auto) until you switch or stop. It boosts a stat yearly and
 * quietly costs money each year from age 18 (the "hidden" cost).
 */
export interface OngoingActivity {
  id: string
  category: ActivityCategory
  emoji: string
  name: string
  description: string
  minAge: number
  /** Stat changes applied every year while active. */
  yearly: Effects
  /** Hidden yearly cost (country-scaled), charged from age 18. */
  cost: number
  /** Timed pursuits (e.g. a language) complete after this many years. */
  durationYears?: number
}

/** A one-time crime. You either get away with it or get caught. */
export interface CrimeAction {
  id: string
  emoji: string
  name: string
  description: string
  minAge: number
  /** 0-1 chance of getting caught. */
  catchChance: number
  /** Typical payout on success (randomized around this; 0 = no payout). */
  reward: number
  /** Stat changes if you get away with it. */
  success: Effects
  /** Stat/money changes if you get caught (the arrest penalty). */
  caught: Effects
  /** Maximum prison sentence (years) if convicted. */
  maxSentence: number
  /**
   * Physical goods a successful job can net you — a stolen car you can drive
   * or sell, or valuables (phones, jewelry, handbags) you can pawn. Added
   * straight to your belongings.
   */
  loot?: { kind: 'car' | 'valuables'; chance: number }
  /** True for crimes that let you pick a specific victim (murder). */
  pickTarget?: boolean
}

/** Live state while the character is incarcerated. */
export interface PrisonState {
  /** The crime that put you here. */
  crime: string
  /** Total years sentenced. */
  sentence: number
  /** Years still to serve. */
  yearsLeft: number
  /** 0-100 good-behaviour meter; high behaviour helps you make parole. */
  behavior: number
}

/** A pursuit the character is currently doing. */
export interface ActivePursuit {
  id: string
  years: number
  /** For timed pursuits, the thing being learned (e.g. "Spanish"). */
  label?: string
}

/** One multiple-choice interview question. Kept obvious on purpose. */
export interface JobQuestion {
  q: string
  options: string[]
  /** Index into options. */
  answer: number
}

/** A country: flag + salary multiplier from real GNI-per-capita data. */
export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "US". */
  code: string
  name: string
  flag: string
  /** Salary scale relative to US-level base salaries. */
  multiplier: number
}

/** A university major. Admission needs the grades (minSmarts). */
export interface Major {
  id: string
  name: string
  emoji: string
  minSmarts: number
}

export interface Job {
  id: string
  title: string
  emoji: string
  /** Paid into money automatically every Age Up. */
  salary: number
  minAge: number
  minSmarts: number
  /** Some image-driven lines of work also demand looks. */
  minLooks?: number
  /** Needs a university degree in any major. */
  requiresDegree?: boolean
  /** Needs a degree in this specific major (implies requiresDegree). */
  requiredMajor?: string
  /**
   * Promotion ladder from entry (index 0) to top. If present, the
   * shown title and salary climb tiers over the years on the job.
   */
  tiers?: string[]
  /** One of these is asked, at random, when applying. */
  questions: JobQuestion[]
  /**
   * Fame careers (athlete, singer, actor). These skip the normal job
   * board and interview — you try out, and a stat roll decides if you
   * make it.
   */
  special?: boolean
  /** Stat the tryout is judged on (special jobs only). */
  auditionStat?: StatKey
  /** Stat level where you have a fair shot at the tryout. */
  auditionMin?: number
}
