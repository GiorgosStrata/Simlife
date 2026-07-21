import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { playSfx } from '../audio/sfx'
import type { ThemeName } from '../theme'
import { randomAvatarConfig, type AvatarConfig } from '../data/avatar'
import type {
  ActiveCondition,
  Ancestor,
  ActivePursuit,
  ActivityCategory,
  DeepLink,
  EventFlag,
  GameEvent,
  Gender,
  Job,
  LogEntry,
  PartnerStatus,
  Person,
  PersonRole,
  Pet,
  PrisonState,
  SocialApp,
  SportState,
  Stats,
} from '../types'
import { PET_NAMES, getPetOption, randomPetOfSpecies } from '../data/pets'
import { makeNpcLife, randomHobby } from '../data/npc'
import { LEAGUES, getTeam, jobSport, leaguesForSport, teamName } from '../data/leagues'
import { LANGUAGES, getActivity, getCrime } from '../data/activities'
import { getAsset, homeRent, resaleValue } from '../data/assets'
import { phonesForYear } from '../data/phones'
import { getIllness, pickIllness } from '../data/illnesses'
import {
  INVESTMENTS,
  getInvestment,
  initialInvestPrices,
  stepInvestmentPrice,
} from '../data/investments'
import { rollHomeListings, type HomeListing, type OwnedHome } from '../data/homes'
import { COUNTRIES, countrySalary, getCountry, scaleByCountry } from '../data/countries'
import {
  DEBT_INTEREST,
  EXPENSES_START_AGE,
  YEARS_PER_PROMOTION,
  assetUpkeep,
  friendCost,
  incomeTax,
  livingCost,
  partnerCost,
  tierMultiplier,
  tuitionPerYear,
} from '../data/economy'
import { EVENTS, SCHOOL_ONLY_EVENTS, SINGLE_ONLY_EVENTS } from '../data/events'
import { JOBS } from '../data/jobs'
import { getMajor } from '../data/majors'
import { randomFirstName, randomGender, randomLastName } from '../data/names'
import { schoolNameFor, schoolStageFor, teacherName, type SchoolStage } from '../data/schools'
import {
  DIVORCE_EVENT,
  GRADUATION_EVENT,
  PRISON_EVENTS,
  RELEASE_EVENT,
  arrestEvent,
  funeralEvent,
  languageCompleteEvent,
} from '../data/specialEvents'
import { REL_EVENT_ROLES, buildRelationshipEvent } from '../data/relationshipEvents'
import {
  DATE_COST,
  GIFT_COST,
  MAX_FRIENDS,
  PROPOSAL_MIN_RELATIONSHIP,
  TUITION_PER_YEAR,
  UNIVERSITY_MIN_SMARTS,
  UNIVERSITY_YEARS,
  WEDDING_COST,
} from './constants'

export {
  DATE_COST,
  GIFT_COST,
  MAX_FRIENDS,
  PROPOSAL_MIN_RELATIONSHIP,
  TUITION_PER_YEAR,
  UNIVERSITY_MIN_SMARTS,
  UNIVERSITY_YEARS,
  WEDDING_COST,
}

const START_YEAR_BASE = 2026
const MAX_AGE = 100

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

/**
 * Health, mood, smarts and looks grow naturally only up to here; the last
 * five points are reserved for enhancement (cosmetic surgery and the like).
 * Enforced centrally in the store's set wrapper.
 */
const NATURAL_STAT_CAP = 95

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function clampRelationship(value: number): number {
  return Math.max(0, Math.min(100, value))
}

/** Short relationship word like "mother" or "girlfriend", for logs and events. */
export function relationLabel(
  role: PersonRole,
  gender: Gender,
  partnerStatus?: PartnerStatus | null,
): string {
  const male = gender === 'male'
  switch (role) {
    case 'mother':
      return 'mother'
    case 'father':
      return 'father'
    case 'sibling':
      return male ? 'brother' : 'sister'
    case 'child':
      return male ? 'son' : 'daughter'
    case 'partner':
      if (partnerStatus === 'married') return male ? 'husband' : 'wife'
      if (partnerStatus === 'engaged') return male ? 'fiancé' : 'fiancée'
      return male ? 'boyfriend' : 'girlfriend'
    case 'friend':
      return 'friend'
    case 'classmate':
      return 'classmate'
    case 'teacher':
      return 'teacher'
    case 'coworker':
      return 'coworker'
    case 'boss':
      return 'boss'
    case 'enemy':
      return 'enemy'
    case 'ex':
      return male ? 'ex-boyfriend' : 'ex-girlfriend'
    case 'fling':
      return 'fling'
  }
}

function rollStats(): Stats {
  // Each starting stat is capped at 80, and the four together total 240-280,
  // so nobody starts min-maxed but everyone is reasonably rounded.
  let health = 0
  let happiness = 0
  let smarts = 0
  let looks = 0
  do {
    health = randomInt(48, 80)
    happiness = randomInt(48, 80)
    smarts = randomInt(48, 80)
    looks = randomInt(48, 80)
  } while (health + happiness + smarts + looks < 240 || health + happiness + smarts + looks > 280)
  return { health, happiness, smarts, looks, stress: randomInt(8, 22) } // children start calm
}

/** Parents (and maybe an older sibling) with country-appropriate names. */
function makeFamily(countryCode: string, familyLastName: string): Person[] {
  const family: Person[] = [
    {
      id: 'mother',
      role: 'mother',
      gender: 'female',
      name: `${randomFirstName(countryCode, 'female')} ${familyLastName}`,
      age: randomInt(20, 38),
      alive: true,
      relationship: randomInt(70, 95),
      ...makeNpcLife(),
    },
    {
      id: 'father',
      role: 'father',
      gender: 'male',
      name: `${randomFirstName(countryCode, 'male')} ${familyLastName}`,
      age: randomInt(22, 42),
      alive: true,
      relationship: randomInt(70, 95),
      ...makeNpcLife(),
    },
  ]
  if (Math.random() < 0.6) {
    const gender = randomGender()
    family.push({
      id: 'sibling',
      role: 'sibling',
      gender,
      name: `${randomFirstName(countryCode, gender)} ${familyLastName}`,
      age: randomInt(1, 6),
      alive: true,
      relationship: randomInt(60, 90),
      ...makeNpcLife(),
    })
  }
  return family
}

export function getJob(jobId: string | null): Job | null {
  return jobId ? (JOBS.find((j) => j.id === jobId) ?? null) : null
}

/** Best-matching real job for an NPC's flavour career (e.g. "Doctor"). */
function jobForCareer(career: string | undefined): Job | null {
  if (!career) return null
  const c = career.toLowerCase()
  return (
    JOBS.find((j) => !j.special && j.title.toLowerCase() === c) ??
    JOBS.find((j) => !j.special && j.title.toLowerCase().includes(c)) ??
    null
  )
}

/**
 * How much a working-age adult NPC salts away in a year. Just like the player,
 * they earn from their career and spend more the more children they support —
 * so a childless doctor builds a real fortune while a barista with a big family
 * barely saves. Under-22s and retirees (68+) add nothing.
 */
function npcAnnualSaving(
  career: string | undefined,
  age: number,
  kids: number,
  code: string | null,
): number {
  if (age < 22 || age >= 68) return 0
  const salary = scaleByCountry(jobForCareer(career)?.salary ?? 32000, code)
  const saved = salary * 0.12 - kids * salary * 0.03
  return Math.max(0, Math.round(saved))
}

/**
 * A nest egg to start an NPC on the first year we look — roughly a partial
 * career's worth of the above, so someone we meet in middle age already has
 * something put by rather than starting from zero.
 */
function seedNpcWealth(
  career: string | undefined,
  age: number,
  kids: number,
  code: string | null,
): number {
  const yearsWorked = Math.max(0, Math.min(age, 65) - 24)
  const perYear = npcAnnualSaving(career, Math.min(age, 60), kids, code)
  return Math.round(perYear * yearsWorked * 0.7)
}

/** How many jobs are hiring in any given year. */
const OPENINGS_PER_YEAR = 9
/** With a degree, this many openings match your major (when available). */
const MAJOR_MATCHED_OPENINGS = 3

/**
 * A fresh random batch of job openings — not everything is hiring.
 * A graduate's major guarantees some matching listings, so the degree
 * you earned actually shows up in the job market.
 */
function rollJobOpenings(major: string | null, hasDegree: boolean): string[] {
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)
  const picked: string[] = []
  if (hasDegree && major) {
    const matching = shuffle(JOBS.filter((j) => j.requiredMajor === major))
    picked.push(...matching.slice(0, MAJOR_MATCHED_OPENINGS).map((j) => j.id))
  }
  // Fame careers (special jobs) never show on the normal board.
  const rest = shuffle(JOBS.filter((j) => !j.special && !picked.includes(j.id)))
  picked.push(...rest.slice(0, OPENINGS_PER_YEAR - picked.length).map((j) => j.id))
  return picked
}

/** Base country-adjusted yearly salary for a job (tier 0, no raises). */
export function jobSalary(job: Job, countryCode: string | null): number {
  return countrySalary(job.salary, countryCode)
}

/** Full take-home salary: country + promotion tier + accumulated raises. */
export function annualSalary(
  job: Job,
  tier: number,
  raisePercent: number,
  countryCode: string | null,
): number {
  return Math.round(
    countrySalary(job.salary, countryCode) * tierMultiplier(tier) * (1 + raisePercent / 100),
  )
}

/** Job title at the character's current promotion tier. */
export function jobTitle(job: Job, tier: number): string {
  return job.tiers?.[tier] ?? job.title
}

/**
 * Why the character can't take this job yet, or null if eligible.
 * Holding the required degree waives the age requirement entirely —
 * a fresh Medicine grad can be a Doctor without waiting for 26.
 */
export function jobBlocker(
  job: Job,
  who: {
    age: number
    smarts: number
    looks?: number
    hasDegree: boolean
    major: string | null
    criminalRecord?: boolean
  },
): string | null {
  // Licensed professions won't hire anyone with a criminal record.
  if (who.criminalRecord && job.requiredMajor) return 'clean record required'
  if (job.requiredMajor && who.major !== job.requiredMajor)
    return `${getMajor(job.requiredMajor)?.name ?? job.requiredMajor} degree required`
  if (job.requiresDegree && !who.hasDegree) return 'university degree required'
  // Degree jobs skip the age gate (you've already earned the degree);
  // everyone else must be old enough.
  const needsDegree = !!job.requiredMajor || !!job.requiresDegree
  if (!needsDegree && who.age < job.minAge) return `age ${job.minAge}+`
  if (who.smarts < job.minSmarts) return `${job.minSmarts} smarts required`
  // Adult-entertainment jobs are strictly 18+, degree or not.
  if (job.minAge >= 18 && job.minLooks && who.age < 18) return 'age 18+'
  if (job.minLooks && (who.looks ?? 0) < job.minLooks) return `${job.minLooks} looks required`
  return null
}

/** True while the character is in mandatory schooling. */
export function isInSchool(age: number): boolean {
  return age >= 6 && age < 18
}

const CLASSMATE_COUNT = 12
const TEACHER_COUNT = 4
const COWORKER_COUNT = 8
export const MAX_RAISE_PERCENT = 50
export const MOVIE_COST = 20
export const LUNCH_COST = 15
export const GETAWAY_COST = 300

/** The two social platforms you can post to once you own a phone. */
export const SOCIAL_APPS: Record<SocialApp, { name: string; emoji: string; kind: string }> = {
  rizzgram: { name: 'Rizzgram', emoji: '📸', kind: 'photos' },
  flicktok: { name: 'FlickTok', emoji: '🎵', kind: 'short videos' },
  youtube: { name: 'Streamly', emoji: '▶️', kind: 'videos' },
  onlystans: { name: 'OnlyStans', emoji: '💎', kind: 'exclusive content' },
}

/** OnlyStans monetizes from far fewer followers — subscriptions pay early. */
export const ONLYSTANS_MIN_SUBS = 1000

/** Followers needed before a platform will pay you. */
export const MONETIZE_MIN_FOLLOWERS = 10000

/** A fresh classroom for a school stage: classmates + teachers. */
function rollSchoolPeople(
  countryCode: string,
  stage: SchoolStage,
  playerAge: number,
  idStart: number,
): Person[] {
  const people: Person[] = []
  let id = idStart
  for (let i = 0; i < CLASSMATE_COUNT; i++) {
    const gender = randomGender()
    people.push({
      id: `classmate-${id++}`,
      role: 'classmate',
      gender,
      name: `${randomFirstName(countryCode, gender)} ${randomLastName(countryCode)}`,
      age: Math.max(5, playerAge + (Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? -1 : 1)),
      alive: true,
      relationship: 20 + Math.floor(Math.random() * 31),
      ...makeNpcLife(),
    })
  }
  for (let i = 0; i < TEACHER_COUNT; i++) {
    const gender = randomGender()
    people.push({
      id: `teacher-${id++}`,
      role: 'teacher',
      gender,
      name:
        stage === 'university'
          ? `Prof. ${randomLastName(countryCode)}`
          : teacherName(countryCode, gender),
      age: 28 + Math.floor(Math.random() * 33),
      alive: true,
      relationship: 30 + Math.floor(Math.random() * 31),
      career: stage === 'university' ? 'Professor' : 'Teacher',
      hobby: randomHobby(),
    })
  }
  return people
}

/** A fresh workplace crew for a new job: coworkers + a boss. */
function rollWorkplacePeople(countryCode: string, playerAge: number, idStart: number): Person[] {
  const people: Person[] = []
  let id = idStart
  for (let i = 0; i < COWORKER_COUNT; i++) {
    const gender = randomGender()
    people.push({
      id: `coworker-${id++}`,
      role: 'coworker',
      gender,
      name: `${randomFirstName(countryCode, gender)} ${randomLastName(countryCode)}`,
      age: Math.max(18, playerAge + randomInt(-8, 15)),
      alive: true,
      relationship: 25 + Math.floor(Math.random() * 31),
      ...makeNpcLife(),
    })
  }
  const gender = randomGender()
  people.push({
    id: `boss-${id++}`,
    role: 'boss',
    gender,
    name: `${randomFirstName(countryCode, gender)} ${randomLastName(countryCode)}`,
    age: randomInt(35, 62),
    alive: true,
    relationship: 25 + Math.floor(Math.random() * 26),
    career: 'Manager',
    hobby: randomHobby(),
  })
  return people
}

/** Everyone tied to a workplace, dropped on job changes. */
function withoutWorkPeople(relationships: Person[]): Person[] {
  return relationships.filter((p) => p.role !== 'coworker' && p.role !== 'boss')
}

interface GameState {
  /** 'creation' shows the character creation screen; 'life' is the game. */
  screen: 'creation' | 'life'
  name: string
  /** The player's chosen avatar look (DiceBear avataaars config). */
  avatarConfig: AvatarConfig
  /** ISO2 country code; scales every salary (see data/countries.ts). */
  countryCode: string
  alive: boolean
  age: number
  year: number
  stats: Stats
  money: number
  /** Illnesses the character currently has (colds, STDs, cancers…). */
  conditions: ActiveCondition[]
  /** Current unit price of each investable asset (see data/investments.ts). */
  investPrices: Record<string, number>
  /** The player's holdings: units owned and total cash invested, per asset. */
  investments: Record<string, { units: number; invested: number }>
  log: LogEntry[]
  currentEvent: GameEvent | null
  /** Transient confirmation bubble shown after a user action; not persisted. */
  toast: { text: string } | null
  /** Bumped to ask every open action sheet to close (back to main). Not persisted. */
  modalNonce: number
  /** An app area an event choice asked to open ("Invest" → Vestr). Not persisted. */
  deepLink: DeepLink | null
  /** Events already shown this life, so the pool doesn't repeat early. */
  usedEventIds: string[]
  nextLogId: number
  /** True once the persisted save has been loaded from AsyncStorage. */
  hasHydrated: boolean
  /** Once-per-year action keys, cleared on every Age Up. */
  usedActions: string[]
  /**
   * Conversational texts already sent this life, keyed `${personId}:${msgId}`.
   * Unlike usedActions this is NOT cleared yearly — once you've said something
   * to someone, that exact line is off the menu for good.
   */
  usedTexts: string[]

  // Settings (survive new lives)
  sfxVolume: number
  theme: ThemeName

  // Career
  jobId: string | null
  /** Current promotion tier within the job (0 = entry). */
  jobTier: number
  /** Years spent in the current job, drives promotions. */
  yearsInJob: number
  /** Accumulated raises as a percentage of base salary (0-50). */
  raisePercent: number
  /** Yearly pension paid out once you've retired (0 = not retired). */
  pension: number
  /** Pro sports career state (set when you join a basketball/football team). */
  sport: SportState | null
  hasDegree: boolean
  inUniversity: boolean
  uniYearsLeft: number
  /** The university major (see majors.ts); set when accepted. */
  major: string | null
  /** Current school's name, e.g. "Palm Street High School". */
  schoolName: string | null
  /** Hidden athletic talent (0-100): drives sports tryouts & pro-league odds. */
  athletics: number
  /** School sports team you're on while in school (sport name), or null. */
  schoolSport: string | null
  /** Job ids hiring this year; rerolled every Age Up. */
  jobOpenings: string[]
  /** True while the major-picker is open (from the grad popup or Career tab). */
  applyingToUniversity: boolean

  // Relationships
  relationships: Person[]
  partnerStatus: PartnerStatus | null
  nextFriendId: number
  /** True once the character's parents have divorced (fires at most once). */
  parentsDivorced: boolean

  // Lineage (generational play)
  /** Past playable characters in your bloodline, oldest first. */
  ancestors: Ancestor[]
  /** 1 for the founder, +1 each time you continue as your child. */
  generation: number

  // Belongings (cars, phones, luxury — not houses)
  ownedAssetIds: string[]
  /** Houses you own; one is your residence, the rest are rented out. */
  homes: OwnedHome[]
  /** This year's rotating market of randomly-named houses for sale. */
  homeListings: HomeListing[]
  /** The home (in `homes`) you live in. Others are rented out for income. */
  residenceId: string | null

  // Pets
  pets: Pet[]
  nextPetId: number

  // Phone: social media follower counts per app.
  followers: Record<SocialApp, number>

  // Activities: one ongoing pursuit per category; crime is one-off.
  pursuits: Record<ActivityCategory, ActivePursuit | null>
  criminalRecord: boolean
  /** Times the character has been arrested. */
  timesArrested: number
  /** Set while incarcerated; null when free. */
  prison: PrisonState | null

  setSfxVolume: (volume: number) => void
  setTheme: (theme: ThemeName) => void

  gender: Gender

  rerollStats: () => void
  startLife: (
    firstName: string,
    lastName: string,
    countryCode: string,
    gender: Gender,
    avatarConfig: AvatarConfig,
  ) => void
  ageUp: () => void
  chooseOption: (choiceIndex: number) => void
  startNewLife: () => void

  // Transient confirmation bubble
  showToast: (text: string) => void
  dismissToast: () => void
  /** Close all open action sheets, returning to the main screen. */
  closeModals: () => void
  /** Dismiss an event-choice deep link once its screen has been closed. */
  clearDeepLink: () => void

  // School (once per year each)
  studyHarder: () => void

  // School sports
  tryoutSchoolTeam: (sport: string) => void
  trainWithTeam: () => void
  quitSchoolTeam: () => void

  // Person interactions (once per person per year)
  compliment: (personId: string) => void
  insult: (personId: string) => void
  makePeace: (personId: string) => void
  askForAdvice: (personId: string) => void
  prankSibling: (personId: string) => void
  watchMovie: (personId: string) => void
  studyTogether: (personId: string) => void
  grabLunch: (personId: string) => void
  weekendGetaway: () => void
  askTeacherHelp: (personId: string) => void
  /** Turn an acquaintance (classmate, coworker, boss, teacher) into a friend. */
  befriend: (personId: string) => void
  /** Ask an acquaintance out; on success they become your dating partner. */
  askOut: (personId: string) => void

  // Workplace
  workHarder: () => void
  askForRaise: () => void

  // Activities & belongings
  startPursuit: (activityId: string) => void
  stopPursuit: (category: ActivityCategory) => void
  commitCrime: (crimeId: string) => void

  // Mind & Body (once per year each) — medical / self-care only, so it
  // doesn't overlap the ongoing gym/meditation pursuits in Activities.
  seeDoctor: () => void
  seeDentist: () => void
  seeTherapist: () => void
  plasticSurgery: () => void
  spaDay: () => void

  /** Put cash into an investment (buys as many units as the cash affords). */
  buyInvestment: (id: string, cash: number) => void
  /** Sell a fraction (0–1) of a holding back to cash. */
  sellInvestment: (id: string, fraction: number) => void

  /** A casual hookup from the Prowl app — a fun night, with a little risk. */
  oneNightStand: () => void

  /** Hook up again with an existing fling or ex (once a year each). */
  hookUp: (personId: string) => void

  /**
   * Send a contact a text from the Messages app. The reply is worked out in
   * the UI; this applies its bond/mood nudge (and any money or phone a parent
   * hands over). Only your first text to each person each year counts, so you
   * can't farm bond or allowance by spamming.
   */
  sendText: (
    personId: string,
    payload: {
      bond: number
      happiness: number
      money?: number
      grantsPhone?: boolean
      /** The message id sent, and whether it's consumed for the rest of this life. */
      messageId?: string
      consumable?: boolean
    },
  ) => void

  /** Pay to treat an active illness — may cure it (see data/illnesses.ts). */
  treatIllness: (id: string) => void

  // Prison
  attemptEscape: () => void
  prisonBehave: () => void
  prisonWorkout: () => void
  bribeGuard: () => void
  buyAsset: (assetId: string) => void
  sellAsset: (assetId: string) => void

  // Houses
  buyHome: (listingId: string) => void
  sellHome: (homeId: string) => void
  /** Choose which owned home to live in (the rest are rented out). */
  setResidence: (homeId: string) => void

  // Pets
  adoptPet: (optionId: string) => void
  playWithPet: (petId: string) => void
  feedPet: (petId: string) => void
  walkPet: (petId: string) => void
  vetPet: (petId: string) => void
  teachTrick: (petId: string) => void
  rehomePet: (petId: string) => void

  // Career
  applyForJob: (jobId: string) => void
  failInterview: (jobId: string) => void
  tryoutForSpecialJob: (jobId: string) => void
  quitJob: () => void
  /** Retire from work and start drawing a pension + a nest-egg lump sum. */
  retire: () => void

  // Pro sports (leagues)
  trainAthlete: () => void
  askPlayingTime: () => void
  requestTrade: () => void
  openUniversityApplication: () => void
  cancelUniversityApplication: () => void
  applyToUniversity: (majorId: string) => void

  // Relationships
  spendTime: (personId: string) => void
  giveGift: (personId: string) => void
  askForMoney: (personId: string) => void
  /** A child asks a parent to buy them a phone (needs a decent bond). */
  askForPhone: (personId: string) => void
  goOnDate: () => void
  makeFriend: () => void
  beginRelationship: (name: string, gender: Gender, age: number) => void
  tryForBaby: () => void

  // Lineage
  continueAsChild: (childId: string) => void

  // Phone apps
  socialPost: (app: SocialApp) => void
  monetizeSocial: (app: SocialApp) => void
  propose: () => void
  marry: () => void
  breakUp: () => void
}

function newLifeState() {
  const countryCode = pick(COUNTRIES).code
  const gender = randomGender()
  return {
    screen: 'creation' as const,
    name: `${randomFirstName(countryCode, gender)} ${randomLastName(countryCode)}`,
    gender,
    avatarConfig: randomAvatarConfig(gender),
    countryCode,
    alive: true,
    age: 0,
    year: START_YEAR_BASE,
    stats: rollStats(),
    money: 0,
    conditions: [] as ActiveCondition[],
    investPrices: initialInvestPrices(),
    investments: {} as Record<string, { units: number; invested: number }>,
    currentEvent: null,
    toast: null as { text: string } | null,
    usedEventIds: [] as string[],
    nextLogId: 1,
    log: [] as LogEntry[],
    usedActions: [] as string[],
    usedTexts: [] as string[],
    jobId: null,
    jobTier: 0,
    yearsInJob: 0,
    raisePercent: 0,
    pension: 0,
    sport: null as SportState | null,
    hasDegree: false,
    inUniversity: false,
    uniYearsLeft: 0,
    major: null,
    schoolName: null,
    athletics: randomInt(20, 55),
    schoolSport: null as string | null,
    jobOpenings: rollJobOpenings(null, false),
    applyingToUniversity: false,
    // Family is generated in startLife, once country and name are final.
    relationships: [] as Person[],
    partnerStatus: null as PartnerStatus | null,
    nextFriendId: 1,
    parentsDivorced: false,
    ancestors: [] as Ancestor[],
    generation: 1,
    ownedAssetIds: [] as string[],
    homes: [] as OwnedHome[],
    homeListings: rollHomeListings(countryCode),
    residenceId: null as string | null,
    pets: [] as Pet[],
    nextPetId: 1,
    followers: { rizzgram: 0, flicktok: 0, youtube: 0, onlystans: 0 } as Record<SocialApp, number>,
    pursuits: { sport: null, mind: null, hobby: null } as Record<
      ActivityCategory,
      ActivePursuit | null
    >,
    criminalRecord: false,
    timesArrested: 0,
    prison: null as PrisonState | null,
  }
}

/**
 * Pick a random eligible event that hasn't fired yet this life. A generic
 * event never repeats within a single life — once the fresh pool for this
 * age is used up, there's simply no random event that year.
 */
function drawEvent(
  age: number,
  usedIds: string[],
  inSchool: boolean,
  flags: Record<EventFlag, boolean>,
): GameEvent | null {
  const fresh = EVENTS.filter(
    (e) =>
      age >= e.minAge &&
      age <= e.maxAge &&
      !usedIds.includes(e.id) &&
      (inSchool || !SCHOOL_ONLY_EVENTS.has(e.id)) &&
      (!flags.hasPartner || !SINGLE_ONLY_EVENTS.has(e.id)) &&
      // Every required life-situation flag must hold (no baby events if childless).
      (!e.requires || e.requires.every((r) => flags[r])),
  )
  return fresh.length > 0 ? pick(fresh) : null
}

/**
 * Natural death of old age. Health decides *when* frailty sets in: a fit
 * elder simply isn't in the danger zone yet, while a sickly one gets there
 * decades early. A 75-year-old with 88 health has a frailty age near 83, so
 * they will not quietly die — only a catastrophe (below) can take them.
 * Once past the frailty age, risk climbs steeply year over year.
 */
function oldAgeDeathRoll(age: number, health: number): boolean {
  const frailtyAge = 58 + health * 0.28 // health 88 → ~83, health 20 → ~64
  if (age < frailtyAge) return false
  const over = age - frailtyAge
  return Math.random() < 0.02 + over * over * 0.006
}

/**
 * A rare, sudden catastrophe — heart attack, stroke, aneurysm — that can
 * fell even the healthy. Very unlikely when young and fit; the odds ramp up
 * with age and are multiplied by poor health. Returns the cause of death, or
 * null. This is the *only* way a healthy elder dies before their frailty age.
 */
function catastropheRoll(age: number, health: number): string | null {
  if (age < 35) return null
  const ageFactor = (age - 35) * 0.0003 // ~2% a year by age 100
  const healthFactor = 0.35 + ((100 - health) / 100) * 1.8 // 0.35–2.15
  if (Math.random() >= ageFactor * healthFactor) return null
  return pick([
    'a sudden heart attack',
    'a stroke',
    'a brain aneurysm',
    'a heart attack in their sleep',
    'sudden cardiac arrest',
  ])
}

/**
 * Apply a stat gain with diminishing returns: the higher a stat already sits,
 * the less each point of effort moves it, so maxing anything is a lifelong
 * grind rather than a few good years. Losses always apply in full.
 */
function gainStat(current: number, delta: number): number {
  if (delta <= 0) return clampStat(current + delta)
  // Diminishing returns near the top, but gentle enough that steady effort
  // (reading, chess, school) can carry a bright kid from ~75 into the high 80s
  // and ~90 over a life — while a perfect 100 stays very hard to reach.
  const factor = Math.pow(1 - current / 100, 0.9) // ~1 near 0, ~0 near 100
  return clampStat(current + delta * factor)
}

/**
 * What a purchase costs the player. Under-18s pay nothing — their parents
 * foot the bill — so children never spend their own money on anything.
 */
function outOfPocket(age: number, cost: number): number {
  return age < 18 ? 0 : cost
}

/** Current market value of a set of investment holdings. */
function portfolioValue(
  holdings: Record<string, { units: number; invested: number }>,
  prices: Record<string, number>,
): number {
  let total = 0
  for (const [id, h] of Object.entries(holdings)) {
    const price = prices[id] ?? getInvestment(id)?.start ?? 0
    total += h.units * price
  }
  return total
}

/** Family members face their own mortality past 72. */
function familyDeathRoll(age: number): boolean {
  return age > 72 && Math.random() < (age - 72) * 0.02
}

type SeasonLine = Pick<LogEntry, 'text' | 'kind'>

/**
 * Simulate one pro season: skill drifts with age, a win/loss record is
 * drawn, and championships, MVPs and injuries roll out with bonuses. Pure
 * — returns the new sport state and deltas for ageUp to apply.
 */
function simulateSeason(
  sport: SportState,
  age: number,
  health: number,
  countryCode: string,
): {
  sport: SportState
  healthDelta: number
  moneyDelta: number
  lines: SeasonLine[]
  sound: 'graduate' | 'levelup' | 'hurt' | null
} {
  const info = getTeam(sport.teamId)
  const league = info?.league ?? LEAGUES[0]
  const teamLabel = info?.team.name ?? 'your team'

  // Athletes peak in their late 20s, then decline.
  let skill = sport.skill
  if (age <= 29) skill += randomInt(0, 2)
  else if (age <= 32) skill += randomInt(-1, 1)
  else skill -= randomInt(1, 3)
  skill = clampStat(skill)

  const winRate = Math.max(
    0.15,
    Math.min(0.85, 0.3 + (skill - 50) / 120 + (Math.random() - 0.5) * 0.2),
  )
  const wins = Math.round(league.games * winRate)
  const losses = league.games - wins

  const lines: SeasonLine[] = []
  const perGame =
    league.sport === 'basketball'
      ? `${Math.round(skill / 3.5)} pts/game`
      : `${Math.round(skill / 6)} goals`
  lines.push({ text: `Season with the ${teamLabel}: ${wins}–${losses}, ${perGame}.`, kind: 'career' })

  let titles = sport.titles
  let mvps = sport.mvps
  let moneyDelta = 0
  let healthDelta = 0
  let sound: 'graduate' | 'levelup' | 'hurt' | null = null

  // Championship — the better your record, the better your shot.
  if (Math.random() < Math.max(0, winRate - 0.55) * 0.9) {
    titles += 1
    const bonus = scaleByCountry(250000, countryCode)
    moneyDelta += bonus
    lines.push({
      text: `🏆 You won the championship with the ${teamLabel}! Bonus $${bonus.toLocaleString()}.`,
      kind: 'money',
    })
    sound = 'graduate'
  }

  // MVP — for the standout stars.
  if (skill >= 82 && Math.random() < 0.18) {
    mvps += 1
    const bonus = scaleByCountry(120000, countryCode)
    moneyDelta += bonus
    lines.push({
      text: `🌟 You were named league MVP! Bonus $${bonus.toLocaleString()}.`,
      kind: 'money',
    })
    if (!sound) sound = 'levelup'
  }

  // Injuries — more likely if you're run down (and rougher in football).
  const injuryChance = 0.08 + (100 - health) / 400 + (league.sport === 'football' ? 0.03 : 0)
  if (Math.random() < injuryChance) {
    const hit = randomInt(5, 15)
    healthDelta -= hit
    lines.push({ text: `🤕 You picked up an injury this season (-${hit} health).`, kind: 'event' })
    if (!sound) sound = 'hurt'
  }

  return {
    sport: { ...sport, skill, wins, losses, titles, mvps },
    healthDelta,
    moneyDelta,
    lines,
    sound,
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (baseSet, get) => {
      // Every store update passes through here, enforcing two world rules:
      //  - children never spend their own money (an under-18's balance can't
      //    drop — their parents cover everything);
      //  - the four core stats grow naturally only up to NATURAL_STAT_CAP.
      //    Gains stop there; only enhancement that bypasses this wrapper
      //    (cosmetic surgery uses baseSet) can push a stat above the cap,
      //    and a stat already above it holds its value but can't climb.
      const set: typeof baseSet = ((partial: unknown, replace?: boolean) =>
        (baseSet as (p: unknown, r?: boolean) => void)((state: GameState) => {
          const computed =
            typeof partial === 'function'
              ? (partial as (s: GameState) => Partial<GameState>)(state)
              : (partial as Partial<GameState>)
          if (!computed) return computed
          let next = computed as Partial<GameState>
          if (typeof next.money === 'number') {
            const age = typeof next.age === 'number' ? next.age : state.age
            if (age < 18 && next.money < state.money) {
              next = { ...next, money: state.money }
            }
          }
          if (next.stats) {
            const prev = state.stats
            const ns = { ...next.stats }
            let changed = false
            for (const k of ['health', 'happiness', 'smarts', 'looks'] as const) {
              const limit = Math.max(NATURAL_STAT_CAP, prev[k])
              if (ns[k] > prev[k] && ns[k] > limit) {
                ns[k] = limit
                changed = true
              }
            }
            if (changed) next = { ...next, stats: ns }
          }
          return next
        }, replace)) as typeof baseSet

      /** Append log entries stamped with the current age/year. */
      const addLog = (entries: Array<Pick<LogEntry, 'text' | 'kind'>>) => {
        const s = get()
        let logId = s.nextLogId
        const stamped = entries.map((e) => ({
          ...e,
          id: logId++,
          age: s.age,
          year: s.year,
        }))
        set({ log: [...s.log, ...stamped], nextLogId: logId })
      }

      const updatePerson = (personId: string, change: Partial<Person>) => {
        set({
          relationships: get().relationships.map((p) =>
            p.id === personId ? { ...p, ...change } : p,
          ),
        })
      }

      const updatePet = (petId: string, change: Partial<Pet>) => {
        set({
          pets: get().pets.map((p) => (p.id === petId ? { ...p, ...change } : p)),
        })
      }

      /** Consume a once-per-year action slot; false if already used. */
      const useYearlyAction = (key: string): boolean => {
        const s = get()
        if (s.usedActions.includes(key)) return false
        set({ usedActions: [...s.usedActions, key] })
        return true
      }

      /** New friend near the player's age, usually the same gender. */
      const rollNewFriend = (ageOffset: number): Person => {
        const s = get()
        const gender =
          Math.random() < 0.7 ? s.gender : s.gender === 'male' ? 'female' : 'male'
        return {
          id: `friend-${s.nextFriendId}`,
          role: 'friend',
          gender,
          name: `${randomFirstName(s.countryCode, gender)} ${randomLastName(s.countryCode)}`,
          age: Math.max(5, s.age + ageOffset),
          alive: true,
          relationship: randomInt(45, 75),
          ...makeNpcLife(),
        }
      }

      const canApplyToUniversity = () => {
        const s = get()
        return s.alive && s.screen === 'life' && s.age >= 18 && !s.hasDegree && !s.inUniversity
      }

      return {
        ...newLifeState(),
        hasHydrated: false,
        sfxVolume: 1,
        theme: 'dark' as ThemeName,
        modalNonce: 0,
        deepLink: null as DeepLink | null,

        setSfxVolume: (volume: number) => {
          set({ sfxVolume: Math.max(0, Math.min(1, volume)) })
        },

        setTheme: (theme: ThemeName) => {
          set({ theme })
        },

        rerollStats: () => {
          if (get().screen !== 'creation') return
          set({ stats: rollStats() })
        },

        startLife: (
          firstName: string,
          lastName: string,
          countryCode: string,
          gender: Gender,
          avatarConfig: AvatarConfig,
        ) => {
          const s = get()
          if (s.screen !== 'creation') return
          const country = getCountry(countryCode) ?? pick(COUNTRIES)
          const typed = `${firstName.trim()} ${lastName.trim()}`.trim()
          const name =
            typed ||
            `${randomFirstName(country.code, gender)} ${randomLastName(country.code)}`
          const familyLastName = name.split(' ').slice(-1)[0] ?? ''
          set({
            name,
            gender,
            avatarConfig,
            countryCode: country.code,
            screen: 'life',
            relationships: makeFamily(country.code, familyLastName),
            log: [
              {
                id: 0,
                age: 0,
                year: s.year,
                text: `You were born in ${country.flag} ${country.name}! Say hello to ${name}.`,
                kind: 'info',
              },
            ],
            nextLogId: 1,
          })
          playSfx('baby')
        },

        ageUp: () => {
          const s = get()
          if (s.screen !== 'life' || !s.alive || s.currentEvent) return

          const age = s.age + 1
          const year = s.year + 1
          let logId = s.nextLogId
          const entries: LogEntry[] = [
            { id: logId++, age, year, text: `You turned ${age}.`, kind: 'birthday' },
          ]
          const stats = { ...s.stats }
          let money = s.money
          let athletics = s.athletics
          let schoolSport = s.schoolSport

          // Gentle wear and tear in later life.
          if (age > 50) {
            stats.health = clampStat(stats.health - randomInt(0, 2))
          }

          // Serve a year of any prison sentence. Released when it runs out.
          const imprisoned = !!s.prison
          let prison = s.prison
          let releasedThisYear = false
          if (prison) {
            prison = { ...prison, yearsLeft: prison.yearsLeft - 1 }
            if (prison.yearsLeft <= 0) {
              prison = null
              releasedThisYear = true
              entries.push({ id: logId++, age, year, text: 'You were released from prison. 🕊️', kind: 'career' })
            }
          }

          // Salary lands every year you hold a job (country + tier + raises).
          const job = getJob(s.jobId)
          let jobTier = s.jobTier
          let yearsInJob = s.yearsInJob
          let jobIdNext = s.jobId
          let raiseNext = s.raisePercent
          let athleteRetired = false
          let grossIncome = 0
          if (job) {
            yearsInJob += 1
            // Promotion every few years, up the job's ladder.
            const maxTier = (job.tiers?.length ?? 1) - 1
            if (jobTier < maxTier && yearsInJob % YEARS_PER_PROMOTION === 0) {
              jobTier += 1
              entries.push({
                id: logId++,
                age,
                year,
                text: `You were promoted to ${jobTitle(job, jobTier)} ${job.emoji}!`,
                kind: 'career',
              })
              playSfx('levelup')
            }
            grossIncome = annualSalary(job, jobTier, s.raisePercent, s.countryCode)
            money += grossIncome
          }

          // Retirement pension lands every year once you've stopped working.
          let pension = s.pension
          let pensionIncome = 0
          if (!job && pension > 0) {
            pensionIncome = pension
            money += pensionIncome
          }

          // Pro sports season: record, championships, MVPs, injuries, bonuses.
          let sport = s.sport
          if (job && sport && jobSport(job.id)) {
            const res = simulateSeason(sport, age, stats.health, s.countryCode)
            sport = res.sport
            stats.health = clampStat(stats.health + res.healthDelta)
            money += res.moneyDelta
            for (const l of res.lines) entries.push({ id: logId++, age, year, ...l })
            if (res.sound) playSfx(res.sound)

            // Athletes have short careers: age (or a collapse in form) forces
            // retirement. Trophies boost the pension; a nest egg is paid out.
            if (age >= 36 || sport.skill < 35) {
              const finalSalary = annualSalary(job, jobTier, s.raisePercent, s.countryCode)
              const trophies = sport.titles + sport.mvps
              pension = Math.round(finalSalary * Math.min(0.55, 0.2 + trophies * 0.05))
              const fund = Math.round(finalSalary * Math.max(1, yearsInJob) * 0.06)
              money += fund
              entries.push({
                id: logId++,
                age,
                year,
                text: `At ${age} your playing days are over — you retire from the ${teamName(sport.teamId)} with ${sport.titles} title${sport.titles === 1 ? '' : 's'}. Nest egg $${fund.toLocaleString()}, pension $${pension.toLocaleString()}/yr. 🏅`,
                kind: 'career',
              })
              playSfx('graduate')
              jobIdNext = null
              jobTier = 0
              raiseNext = 0
              sport = null
              athleteRetired = true
            }
          }

          // Mandatory retirement: regular workers are retired by 70.
          if (job && !jobSport(job.id) && age >= 70 && jobIdNext !== null) {
            const finalSalary = annualSalary(job, jobTier, s.raisePercent, s.countryCode)
            const years = Math.max(1, yearsInJob)
            pension = Math.round(finalSalary * Math.min(0.6, 0.15 + years * 0.012))
            const fund = Math.round(finalSalary * years * 0.05)
            money += fund
            entries.push({
              id: logId++,
              age,
              year,
              text: `At ${age}, you reached retirement age and hung up your boots. Nest egg $${fund.toLocaleString()}, pension $${pension.toLocaleString()}/yr. 🌴`,
              kind: 'career',
            })
            playSfx('graduate')
            jobIdNext = null
            jobTier = 0
            raiseNext = 0
            athleteRetired = true
          }

          // University: country-scaled tuition drains yearly until graduation.
          let { hasDegree, inUniversity, uniYearsLeft } = s
          let expenses = 0
          if (inUniversity) {
            const tuition = tuitionPerYear(s.countryCode)
            money -= tuition
            expenses += tuition
            uniYearsLeft -= 1
            if (uniYearsLeft <= 0) {
              inUniversity = false
              hasDegree = true
              stats.smarts = gainStat(stats.smarts, 10)
              const majorName = getMajor(s.major)?.name ?? 'your field'
              entries.push({
                id: logId++,
                age,
                year,
                text: `You graduated from university with a degree in ${majorName}! 🎓`,
                kind: 'career',
              })
              playSfx('graduate')
            }
          }

          // School milestones (flavor only; enrollment is automatic).
          // School stage transitions: new school name, new classroom.
          const prevStage = schoolStageFor(s.age, s.inUniversity)
          const newStage = schoolStageFor(age, inUniversity)
          let schoolName = s.schoolName
          let newSchoolPeople: Person[] = []
          let nextFriendId = s.nextFriendId
          const stageChanged = newStage !== prevStage
          if (stageChanged) {
            if (newStage && newStage !== 'university') {
              schoolName = schoolNameFor(s.countryCode, newStage)
              newSchoolPeople = rollSchoolPeople(s.countryCode, newStage, age, nextFriendId)
              nextFriendId += newSchoolPeople.length
              entries.push({
                id: logId++,
                age,
                year,
                text: `You started at ${schoolName}! 🎒`,
                kind: 'career',
              })
            } else if (!newStage) {
              schoolName = null
              if (prevStage === 'high') {
                entries.push({
                  id: logId++,
                  age,
                  year,
                  text: 'You graduated from high school. 🎉',
                  kind: 'career',
                })
                playSfx('graduate')
              }
            }
          }

          // The people in your life age too — and drift if neglected.
          // A death among close relations queues a funeral popup.
          const CLOSE: Person['role'][] = ['mother', 'father', 'sibling', 'partner', 'child', 'friend']
          let funeralFor: { name: string; isPet: boolean; role?: string } | null = null
          let partnerStatus = s.partnerStatus
          // How many children each inheritable relative supports: parents raise
          // the player plus any siblings; a partner shares the player's kids.
          const parentKids = 1 + s.relationships.filter((p) => p.role === 'sibling').length
          const childCount = s.relationships.filter((p) => p.role === 'child' && p.alive).length
          const agedRelationships = s.relationships.map((p) => {
            if (!p.alive) return p
            const pAge = p.age + 1
            const inheritRole =
              p.role === 'mother' || p.role === 'father' || p.role === 'partner'
            const kids = p.role === 'partner' ? childCount : inheritRole ? parentKids : 0
            // Grow the relative's own savings from their career this year.
            const priorWealth = inheritRole
              ? (p.wealth ?? seedNpcWealth(p.career, pAge, kids, s.countryCode))
              : p.wealth
            const grownWealth = inheritRole
              ? Math.max(0, (priorWealth ?? 0) + npcAnnualSaving(p.career, pAge, kids, s.countryCode))
              : p.wealth
            if (familyDeathRoll(pAge)) {
              const label = relationLabel(p.role, p.gender, s.partnerStatus)
              entries.push({
                id: logId++,
                age,
                year,
                text: `${p.name} (${label}) passed away at age ${pAge}. 💔`,
                kind: 'death',
              })
              stats.happiness = clampStat(stats.happiness - 15)
              if (p.role === 'partner') partnerStatus = null
              if (!funeralFor && CLOSE.includes(p.role))
                funeralFor = { name: p.name, isPet: false, role: label }
              // Inherit a parent's or spouse's own nest egg — what they saved
              // over a lifetime of their career, so it varies with their job
              // and how many kids they raised. Even the poorest leave a little
              // behind, so you always inherit something when they pass.
              if (inheritRole) {
                const floor = scaleByCountry(8000, s.countryCode)
                const inheritance = Math.max(floor, Math.round(grownWealth ?? 0))
                money += inheritance
                entries.push({
                  id: logId++,
                  age,
                  year,
                  text: `You inherited $${inheritance.toLocaleString()} from ${p.name}. 💰`,
                  kind: 'money',
                })
              }
              // Free up the "partner" slot when a spouse dies (re-id them so
              // they stay in your history) — so you can love again.
              return {
                ...p,
                id: p.role === 'partner' ? `late-partner-${year}` : p.id,
                age: pAge,
                alive: false,
              }
            }
            return {
              ...p,
              age: pAge,
              relationship: clampRelationship(p.relationship - randomInt(0, 3)),
              ...(inheritRole ? { wealth: grownWealth } : {}),
            }
          })
          // Old classmates and teachers move on when the stage changes.
          const relationshipsBase = [
            ...(stageChanged
              ? agedRelationships.filter((p) => p.role !== 'classmate' && p.role !== 'teacher')
              : agedRelationships),
            ...newSchoolPeople,
          ]
          const relationships = athleteRetired
            ? withoutWorkPeople(relationshipsBase)
            : relationshipsBase

          // Every house that isn't your residence is rented out for income.
          const rentIncome = s.homes.reduce(
            (sum, h) => (h.id !== s.residenceId ? sum + homeRent(h.price) : sum),
            0,
          )
          money += rentIncome

          // ----- Income tax: the main brake on getting rich quick -----
          const tax = incomeTax(grossIncome, s.countryCode)
          if (tax > 0) {
            money -= tax
            expenses += tax
          }
          const netIncome = grossIncome - tax + pensionIncome + rentIncome
          // Pension & rent show up as income on the year's balance sheet.
          grossIncome += pensionIncome + rentIncome

          // ----- Yearly cost of living (this is why you keep less than salary) -----
          // Personal expenses kick in once you're on your own — but not while
          // the state is housing (and feeding) you in prison.
          // Household = you + partner + kids living at home (drives housing).
          const familySize =
            1 +
            relationships.filter((p) => p.id === 'partner' && p.alive).length +
            relationships.filter((p) => p.role === 'child' && p.alive).length
          const residence = s.homes.find((h) => h.id === s.residenceId) ?? null
          const ownsResidence = !!residence

          if (age >= EXPENSES_START_AGE && !imprisoned) {
            // Cost of living scales with your *earned* income (salary + pension)
            // only — passive rental income is investment profit, not a reason to
            // inflate your lifestyle, so it doesn't drive your spending up. This
            // is why a rental keeps most of its rent as real profit.
            let living = livingCost(netIncome - rentIncome, s.countryCode)
            // Renting is the default (baked in). Owning the home you live in
            // means no rent — just the home's upkeep (charged below), so it's
            // cheaper. Bigger families would pay more rent, so they save more.
            if (ownsResidence) {
              const rentSaved =
                scaleByCountry(8000, s.countryCode) + familySize * scaleByCountry(1500, s.countryCode)
              living = Math.max(scaleByCountry(6000, s.countryCode), living - rentSaved)
            }
            money -= living
            expenses += living
            // Every friend costs a little to keep up with.
            const livingFriends = relationships.filter((p) => p.role === 'friend' && p.alive).length
            const friends = livingFriends * friendCost(s.countryCode)
            money -= friends
            expenses += friends
            // A relationship costs more the more serious it gets.
            if (partnerStatus) {
              const love = partnerCost(s.countryCode, partnerStatus)
              money -= love
              expenses += love
            }
          }
          // Cars and luxuries need upkeep every year.
          for (const id of s.ownedAssetIds) {
            const asset = getAsset(id)
            if (asset) {
              const upkeep = assetUpkeep(asset.price, asset.category)
              money -= upkeep
              expenses += upkeep
            }
          }
          // Houses too — bigger/pricier homes cost proportionally more.
          for (const h of s.homes) {
            const upkeep = assetUpkeep(h.price, 'home')
            money -= upkeep
            expenses += upkeep
          }
          // A home that comfortably fits — or is bigger than — the family lifts
          // everyone's mood; a cramped one grates. (Big homes already cost more
          // upkeep above.) Renters get no boost either way.
          if (ownsResidence && residence.size && age >= EXPENSES_START_AGE) {
            const surplus = residence.size - familySize
            const dh = surplus >= 1 ? Math.min(3, surplus) : surplus < 0 ? -2 : 1
            stats.happiness = clampStat(stats.happiness + dh)
          }

          // ----- Pets: age, upkeep, drift, and old-age mortality -----
          const pets: Pet[] = []
          for (const pet of s.pets) {
            if (!pet.alive) continue
            const opt = getPetOption(pet.optionId)
            const petAge = pet.age + 1
            const maxAge = opt?.maxAge ?? 12
            // Upkeep every year (country-scaled).
            if (opt) {
              const upkeep = scaleByCountry(opt.upkeep, s.countryCode)
              money -= upkeep
              expenses += upkeep
            }
            // Old-age mortality.
            const risk = petAge >= maxAge ? 0.4 : petAge > maxAge * 0.75 ? 0.08 : 0.01
            if (Math.random() < risk) {
              entries.push({
                id: logId++,
                age,
                year,
                text: `${pet.name} the ${pet.breed} passed away at ${petAge}. 💔`,
                kind: 'death',
              })
              stats.happiness = clampStat(stats.happiness - 8)
              if (!funeralFor) funeralFor = { name: pet.name, isPet: true }
              continue // drops from the list
            }
            pets.push({
              ...pet,
              age: petAge,
              happiness: clampStat(pet.happiness - randomInt(0, 4)),
              bond: clampRelationship(pet.bond - randomInt(0, 2)),
            })
          }

          // ----- Ongoing pursuits: apply their yearly effects + hidden cost -----
          const pursuits: Record<ActivityCategory, ActivePursuit | null> = { ...s.pursuits }
          let pursuitPopEvent: GameEvent | null = null
          for (const category of ['sport', 'mind', 'hobby'] as ActivityCategory[]) {
            const active = pursuits[category]
            if (!active) continue
            const activity = getActivity(active.id)
            if (!activity) {
              pursuits[category] = null
              continue
            }
            // Yearly stat boost.
            const { money: _m, ...deltas } = activity.yearly
            for (const key of Object.keys(deltas) as (keyof Stats)[]) {
              stats[key] = gainStat(stats[key], deltas[key] ?? 0)
            }
            // Sports pursuits quietly build athletic talent.
            if (category === 'sport') athletics = gainStat(athletics, randomInt(1, 3))
            // Hidden yearly cost, country-scaled, from age 18.
            if (age >= EXPENSES_START_AGE && activity.cost > 0) {
              const cost = scaleByCountry(activity.cost, s.countryCode)
              money -= cost
              expenses += cost
            }
            const years = active.years + 1
            // Timed pursuit (language) completes and pops a notification.
            if (activity.durationYears && years >= activity.durationYears) {
              pursuits[category] = null
              if (!pursuitPopEvent) {
                pursuitPopEvent = languageCompleteEvent(active.label ?? 'a new language')
              }
            } else {
              pursuits[category] = { ...active, years }
            }
          }

          // Leaving school (or dropping into university) ends your school team.
          if (schoolSport && !isInSchool(age)) {
            entries.push({
              id: logId++,
              age,
              year,
              text: `Your days on the school ${schoolSport.toLowerCase()} team came to an end. 🏅`,
              kind: 'career',
            })
            schoolSport = null
          }

          // ----- Stress: settles toward how loaded your life is -----
          // A calm baseline, pushed up by work, study, a packed schedule, a
          // big family, money trouble and illness; meditation pulls it down.
          // Stress drifts toward this target, so it builds and eases gradually
          // (relaxing at the spa gives an extra one-off drop on top).
          const activePursuitCount = Object.values(pursuits).filter(Boolean).length
          let stressLoad = 15
          if (job) stressLoad += 12 + jobTier * 6 // work and responsibility
          if (inUniversity) stressLoad += 15
          else if (isInSchool(age) && age >= 11) stressLoad += 10 // exams, from ~middle school
          stressLoad += activePursuitCount * 8 // a packed schedule
          if (familySize > 1) stressLoad += (familySize - 1) * 6 // people depending on you
          if (money < 0) stressLoad += 12 // money trouble
          if (prison) stressLoad += 20
          if ((s.conditions ?? []).some((c) => getIllness(c.id)?.kind === 'serious')) stressLoad += 12
          if (pursuits.mind?.id === 'meditation') stressLoad -= 15 // a calming practice
          const stressTarget = clampStat(stressLoad)
          stats.stress = clampStat(stats.stress + (stressTarget - stats.stress) * 0.4 + randomInt(-3, 3))
          // High stress saps your mood and, sustained, your health; a calm life
          // is quietly restorative.
          if (stats.stress >= 80) {
            stats.happiness = clampStat(stats.happiness - 4)
            stats.health = clampStat(stats.health - 2)
          } else if (stats.stress >= 60) {
            stats.happiness = clampStat(stats.happiness - 2)
          } else if (stats.stress <= 25) {
            stats.happiness = clampStat(stats.happiness + 1)
          }

          // ----- Markets move every year -----
          const investPrices: Record<string, number> = {}
          for (const inv of INVESTMENTS) {
            investPrices[inv.id] = stepInvestmentPrice(inv, s.investPrices[inv.id] ?? inv.start)
          }

          // Children never owe money — their parents cover everything.
          if (age < 18 && money < 0) money = 0
          // Debt grows a little each year you stay in the red.
          if (money < 0) {
            money = Math.round(money * (1 + DEBT_INTEREST))
          }
          // A quick yearly balance sheet once you're earning/spending.
          if (age >= EXPENSES_START_AGE && (grossIncome > 0 || expenses > 0)) {
            const net = grossIncome - expenses
            entries.push({
              id: logId++,
              age,
              year,
              text: `Finances: earned $${grossIncome.toLocaleString()}, spent $${expenses.toLocaleString()} — net ${net >= 0 ? '+' : '-'}$${Math.abs(net).toLocaleString()}.`,
              kind: 'money',
            })
          }

          // ----- Illness: run current conditions, then maybe catch something -----
          let illnessDeathCause: string | null = null
          const conditions: ActiveCondition[] = []
          for (const c of s.conditions ?? []) {
            const ill = getIllness(c.id)
            if (!ill) continue
            // The yearly toll on body and mood.
            stats.health = clampStat(stats.health + (ill.yearly.health ?? 0))
            stats.happiness = clampStat(stats.happiness + (ill.yearly.happiness ?? 0))
            if (ill.yearly.looks) stats.looks = clampStat(stats.looks + (ill.yearly.looks ?? 0))
            // A terminal illness can prove fatal.
            if (ill.fatalPerYear > 0 && !illnessDeathCause && Math.random() < ill.fatalPerYear) {
              illnessDeathCause = ill.name
            }
            // Some things clear up on their own; others linger until treated.
            if (Math.random() < ill.selfHeal) {
              entries.push({
                id: logId++,
                age,
                year,
                text: `You got over your ${ill.name.toLowerCase()}. 😌`,
                kind: 'event',
              })
            } else {
              conditions.push({ ...c, years: c.years + 1 })
            }
          }
          // Catch a common bug — likelier when run-down. (Not a pile-up: capped.)
          if (age >= 1 && conditions.length < 3 && Math.random() < 0.11 + (100 - stats.health) / 100 * 0.09) {
            const ill = pickIllness('minor', age)
            if (ill && !conditions.some((c) => c.id === ill.id)) {
              conditions.push({ id: ill.id, years: 0 })
              entries.push({
                id: logId++,
                age,
                year,
                text: `You came down with ${ill.name.toLowerCase()}. ${ill.emoji}`,
                kind: 'event',
              })
            }
          }
          // A serious diagnosis — rare, rising with age and poor health, and
          // more likely if high blood pressure is straining your heart.
          const hasHypertension = conditions.some((c) => c.id === 'hypertension')
          const seriousChance =
            Math.max(0, (age - 35) * 0.0006) +
            ((100 - stats.health) / 100) * 0.006 +
            (hasHypertension ? 0.012 : 0)
          if (age >= 5 && !conditions.some((c) => getIllness(c.id)?.kind === 'serious') && Math.random() < seriousChance) {
            const ill = pickIllness('serious', age, s.gender)
            if (ill) {
              conditions.push({ id: ill.id, years: 0 })
              entries.push({
                id: logId++,
                age,
                year,
                text: `You've been diagnosed with ${ill.name}. ${ill.emoji} See a doctor — treatment can help.`,
                kind: 'event',
              })
            }
          }
          // Chronic high stress can bring on high blood pressure.
          if (stats.stress >= 80 && !hasHypertension && age >= 25 && Math.random() < 0.14) {
            conditions.push({ id: 'hypertension', years: 0 })
            entries.push({
              id: logId++,
              age,
              year,
              text: `Years of stress have caught up with you: high blood pressure. 🫀 Ease off and see a doctor.`,
              kind: 'event',
            })
          }
          // A sustained low mood can tip into depression.
          if (stats.happiness <= 18 && !conditions.some((c) => c.id === 'depression') && Math.random() < 0.16) {
            conditions.push({ id: 'depression', years: 0 })
            entries.push({
              id: logId++,
              age,
              year,
              text: `You've been struggling with depression. 🌧️ Talking to someone can help.`,
              kind: 'event',
            })
          }

          const naturalDeath = oldAgeDeathRoll(age, stats.health)
          const catastrophe = naturalDeath ? null : catastropheRoll(age, stats.health)
          const illnessDeath = !naturalDeath && !catastrophe ? illnessDeathCause : null
          if (
            stats.health <= 0 ||
            naturalDeath ||
            catastrophe ||
            illnessDeath ||
            age >= MAX_AGE
          ) {
            // Cash out any investments — they become part of the estate.
            const holdingsValue = Math.round(portfolioValue(s.investments, investPrices))
            if (holdingsValue > 0) money += holdingsValue
            const deathText =
              illnessDeath && stats.health > 0
                ? `${s.name} lost their battle with ${illnessDeath} at age ${age}. 🎗️`
                : stats.health <= 0
                  ? `${s.name}'s health finally gave out at age ${age}.`
                  : catastrophe
                    ? `${s.name} died of ${catastrophe} at age ${age}. Gone in an instant.`
                    : `${s.name} passed away peacefully at age ${age}. What a life it was.`
            entries.push({
              id: logId++,
              age,
              year,
              text: deathText,
              kind: 'death',
            })
            set({
              age,
              year,
              stats,
              money,
              conditions,
              investPrices,
              investments: {},
              jobId: jobIdNext,
              jobTier,
              yearsInJob,
              raisePercent: raiseNext,
              pension,
              sport,
              hasDegree,
              inUniversity,
              uniYearsLeft,
              relationships,
              partnerStatus,
              schoolName,
              athletics,
              schoolSport,
              nextFriendId,
              pursuits,
              pets,
              prison,
              alive: false,
              currentEvent: null,
              usedActions: [],
              log: [...s.log, ...entries],
              nextLogId: logId,
            })
            return
          }

          // Scripted moments take priority over the random event pool.
          const parentsAlive =
            relationships.some((p) => p.role === 'mother' && p.alive) &&
            relationships.some((p) => p.role === 'father' && p.alive)
          const divorceRolls =
            age >= 5 && age <= 16 && !s.parentsDivorced && parentsAlive && Math.random() < 0.03
          // Life-situation flags: events can require these before they fire, so
          // (say) baby-at-the-park events never appear if you're childless.
          const hasPartnerFlag = relationships.some((p) => p.id === 'partner' && p.alive)
          const eventFlags: Record<EventFlag, boolean> = {
            hasKids: relationships.some((p) => p.role === 'child' && p.alive),
            hasPartner: hasPartnerFlag,
            single: !hasPartnerFlag,
            married: partnerStatus === 'married',
            hasJob: jobIdNext !== null,
            noJob: jobIdNext === null,
            hasPet: pets.some((p) => p.alive),
            inSchool: isInSchool(age) || inUniversity,
          }
          // A relationship event (involving a specific person) sometimes
          // fires instead of a generic one — and never the same scenario twice
          // with the same person in one life.
          const relCandidates = relationships.filter(
            (p) => p.alive && REL_EVENT_ROLES.includes(p.role),
          )
          const relEvent =
            relCandidates.length > 0 && Math.random() < 0.4
              ? buildRelationshipEvent(pick(relCandidates), age, s.usedEventIds)
              : null
          // Released this year → a release popup. Still inside → only prison
          // events fire (normal life is on hold). Otherwise the usual chain.
          const event = releasedThisYear
            ? RELEASE_EVENT
            : prison
              ? Math.random() < 0.35
                ? pick(PRISON_EVENTS)
                : null
              : age === 18 && !hasDegree && !inUniversity
                ? GRADUATION_EVENT
                : funeralFor
                  ? funeralEvent(funeralFor.name, funeralFor.isPet, s.countryCode, funeralFor.role)
                  : pursuitPopEvent
                    ? pursuitPopEvent
                    : divorceRolls
                      ? DIVORCE_EVENT
                      : relEvent
                        ? relEvent
                        : drawEvent(
                            age,
                            s.usedEventIds,
                            isInSchool(age) || inUniversity,
                            eventFlags,
                          )
          set({
            age,
            year,
            stats,
            money,
            conditions,
            investPrices,
            jobId: jobIdNext,
            jobTier,
            yearsInJob,
            raisePercent: raiseNext,
            pension,
            sport,
            hasDegree,
            inUniversity,
            uniYearsLeft,
            relationships,
            partnerStatus,
            schoolName,
            athletics,
            schoolSport,
            nextFriendId,
            pursuits,
            pets,
            prison,
            currentEvent: event,
            // Remember every event fired this life (generic, and each
            // relationship scenario keyed by person) so nothing repeats. The
            // "special-" scripted popups (funerals, prison, graduation…) are
            // the only ones allowed to recur.
            usedEventIds:
              event && !event.id.startsWith('special-')
                ? [...s.usedEventIds, event.id]
                : s.usedEventIds,
            usedActions: [],
            jobOpenings: rollJobOpenings(s.major, hasDegree),
            homeListings: rollHomeListings(s.countryCode),
            log: [...s.log, ...entries],
            nextLogId: logId,
          })
        },

        chooseOption: (choiceIndex: number) => {
          const s = get()
          const event = s.currentEvent
          if (!s.alive || !event) return
          const choice = event.choices[choiceIndex]
          if (!choice) return

          const { money: moneyDelta = 0, ...statDeltas } = choice.effects
          const stats = { ...s.stats }
          for (const key of Object.keys(statDeltas) as (keyof Stats)[]) {
            stats[key] = gainStat(stats[key], statDeltas[key] ?? 0)
          }
          // Events can push you into debt (money may go negative).
          const money = s.money + moneyDelta

          let logId = s.nextLogId
          const entries: LogEntry[] = [
            { id: logId++, age: s.age, year: s.year, text: choice.outcome, kind: 'event' },
          ]

          const died = stats.health <= 0
          if (died) {
            entries.push({
              id: logId++,
              age: s.age,
              year: s.year,
              text: `${s.name} died at age ${s.age}. Their health gave out.`,
              kind: 'death',
            })
          }

          set({
            stats,
            money,
            alive: !died,
            currentEvent: null,
            // Some choices jump straight into an app area ("Invest" → Vestr).
            deepLink: !died && choice.opens ? choice.opens : null,
            log: [...s.log, ...entries],
            nextLogId: logId,
          })

          // Give the outcome an appropriate sting (death handled by the modal).
          if (!died) {
            const hpDelta = statDeltas.health ?? 0
            if (choice.sfx) playSfx(choice.sfx)
            else if (hpDelta <= -6) playSfx('hurt')
            else if (moneyDelta >= 40) playSfx('cash')
          }

          if (!died && choice.action === 'enrollUniversity' && canApplyToUniversity()) {
            set({ applyingToUniversity: true })
          }
          // "Start jogging" / "Join the gym" — you actually take up the activity.
          if (!died && choice.startsActivity) {
            get().startPursuit(choice.startsActivity)
          }
          // "Let the cat in" / "Keep the dog" etc. — you actually get the pet.
          if (!died && choice.grantsPet) {
            const opt = randomPetOfSpecies(choice.grantsPet)
            if (opt) {
              const cur = get()
              const pet: Pet = {
                id: `pet-${cur.nextPetId}`,
                optionId: opt.id,
                name: pick(PET_NAMES),
                emoji: opt.emoji,
                breed: opt.breed,
                age: 0,
                alive: true,
                happiness: randomInt(75, 95),
                bond: randomInt(55, 75),
              }
              set({
                pets: [...cur.pets, pet],
                nextPetId: cur.nextPetId + 1,
                stats: { ...cur.stats, happiness: clampStat(cur.stats.happiness + opt.joy) },
              })
              addLog([{ text: `${pet.name} the ${opt.breed} ${opt.emoji} is yours now!`, kind: 'relationship' }])
            }
          }
          // "Sit with the new kid" / "Hit it off" — you actually make a friend.
          if (!died && choice.grantsFriend) {
            const cur = get()
            const friends = cur.relationships.filter((p) => p.role === 'friend' && p.alive)
            if (friends.length < MAX_FRIENDS) {
              const friend = rollNewFriend(randomInt(-3, 3))
              set({
                relationships: [...cur.relationships, friend],
                nextFriendId: cur.nextFriendId + 1,
              })
              addLog([{ text: `You made a new friend: ${friend.name}! 🤝`, kind: 'relationship' }])
            }
          }
          if (!died && choice.action === 'parentsDivorce') {
            set({
              parentsDivorced: true,
              relationships: get().relationships.map((p) =>
                p.role === 'mother' || p.role === 'father'
                  ? { ...p, relationship: clampRelationship(p.relationship - randomInt(10, 20)) }
                  : p,
              ),
            })
          }

          // Relationship events touch a specific person: bond delta + turning
          // them into an enemy or making peace.
          if (!died && event.personId) {
            const pid = event.personId
            if (choice.bond) {
              set({
                relationships: get().relationships.map((p) =>
                  p.id === pid
                    ? { ...p, relationship: clampRelationship(p.relationship + (choice.bond ?? 0)) }
                    : p,
                ),
              })
            }
            if (choice.action === 'makeEnemy') {
              const person = get().relationships.find((p) => p.id === pid)
              if (person) {
                updatePerson(pid, { role: 'enemy', relationship: clampRelationship(person.relationship) })
                addLog([{ text: `${person.name} is now your enemy. 😠`, kind: 'relationship' }])
              }
            }
            if (choice.action === 'reconcile') {
              const person = get().relationships.find((p) => p.id === pid)
              if (person && person.role === 'enemy') {
                updatePerson(pid, { role: 'friend', relationship: clampRelationship(person.relationship) })
                addLog([{ text: `You and ${person.name} buried the hatchet. 🕊️`, kind: 'relationship' }])
              }
            }
          }
        },

        // Use the raw setter: a brand-new character is age 0, and the child
        // money-guard would otherwise refuse to reset an inherited balance to 0.
        startNewLife: () => baseSet(newLifeState()),

        showToast: (text: string) => set({ toast: { text } }),
        dismissToast: () => set({ toast: null }),
        clearDeepLink: () => set({ deepLink: null }),
        closeModals: () => set((st) => ({ modalNonce: st.modalNonce + 1 })),

        // ----- School -----

        studyHarder: () => {
          const s = get()
          if (!s.alive || !(isInSchool(s.age) || s.inUniversity)) return
          if (!useYearlyAction('study')) return
          set({
            stats: {
              ...s.stats,
              smarts: gainStat(s.stats.smarts, randomInt(2, 5)),
              happiness: clampStat(s.stats.happiness - randomInt(0, 2)),
            },
          })
          addLog([{ text: 'You hit the books and studied extra hard this year.', kind: 'career' }])
        },

        // ----- School sports -----

        tryoutSchoolTeam: (sport: string) => {
          const s = get()
          if (!s.alive || !isInSchool(s.age) || s.schoolSport) return
          if (!useYearlyAction('school-tryout')) return
          // Natural talent decides it, with a floor and ceiling either way.
          const chance = Math.max(0.15, Math.min(0.92, s.athletics / 100 + 0.2))
          if (Math.random() < chance) {
            set({
              schoolSport: sport,
              athletics: gainStat(s.athletics, randomInt(3, 6)),
              stats: { ...s.stats, happiness: clampStat(s.stats.happiness + randomInt(3, 6)) },
            })
            playSfx('levelup')
            addLog([{ text: `You made the school ${sport.toLowerCase()} team! 🏅`, kind: 'career' }])
          } else {
            set({ stats: { ...s.stats, happiness: clampStat(s.stats.happiness - randomInt(1, 3)) } })
            playSfx('fail')
            addLog([{ text: `You tried out for the school ${sport.toLowerCase()} team but didn't make the cut.`, kind: 'career' }])
          }
        },

        trainWithTeam: () => {
          const s = get()
          if (!s.alive || !s.schoolSport) return
          if (!useYearlyAction('team-train')) return
          const gain = randomInt(2, 5)
          // A standout season sometimes catches a scout's eye.
          const standout = Math.random() < 0.2 + s.athletics / 300
          set({
            athletics: gainStat(s.athletics, standout ? gain + 3 : gain),
            stats: {
              ...s.stats,
              health: gainStat(s.stats.health, randomInt(1, 3)),
              happiness: clampStat(s.stats.happiness + randomInt(1, 3)),
            },
          })
          playSfx('gym')
          addLog([
            {
              text: standout
                ? `A standout season on the ${s.schoolSport.toLowerCase()} team — scouts are starting to notice you. 🌟`
                : `You trained hard with the ${s.schoolSport.toLowerCase()} team this year.`,
              kind: 'career',
            },
          ])
        },

        quitSchoolTeam: () => {
          const s = get()
          if (!s.schoolSport) return
          const sport = s.schoolSport
          set({ schoolSport: null })
          addLog([{ text: `You left the school ${sport.toLowerCase()} team.`, kind: 'career' }])
        },

        compliment: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (!useYearlyAction(`compliment-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(3, 7)),
          })
          addLog([
            { text: `You paid ${person.name} a genuine compliment. They beamed.`, kind: 'relationship' },
          ])
        },

        startPursuit: (activityId: string) => {
          const s = get()
          const activity = getActivity(activityId)
          if (!activity || !s.alive || s.age < activity.minAge) return
          const label = activity.durationYears ? pick(LANGUAGES) : undefined
          set({
            pursuits: { ...s.pursuits, [activity.category]: { id: activityId, years: 0, label } },
          })
          playSfx(activity.category === 'sport' ? 'gym' : 'success')
          addLog([
            {
              text: label
                ? `You started learning ${label}. ${activity.durationYears} years to fluency.`
                : `You took up ${activity.name.toLowerCase()}.`,
              kind: 'career',
            },
          ])
        },

        stopPursuit: (category: ActivityCategory) => {
          const s = get()
          const active = s.pursuits[category]
          if (!active) return
          const activity = getActivity(active.id)
          set({ pursuits: { ...s.pursuits, [category]: null } })
          addLog([{ text: `You gave up ${activity?.name.toLowerCase() ?? 'an activity'}.`, kind: 'career' }])
        },

        // ----- Mind & Body -----

        seeDoctor: () => {
          const s = get()
          if (!s.alive) return
          const cost = outOfPocket(s.age, scaleByCountry(150, s.countryCode))
          if (s.money < cost) return
          if (!useYearlyAction('doctor')) return
          const healthy = s.stats.health >= 85
          set({
            money: s.money - cost,
            stats: { ...s.stats, health: gainStat(s.stats.health, randomInt(healthy ? 1 : 5, healthy ? 3 : 10)) },
          })
          playSfx('success')
          addLog([
            {
              text: healthy
                ? 'The doctor gave you a clean bill of health. Keep it up.'
                : 'A checkup and some treatment left you feeling much better.',
              kind: 'event',
            },
          ])
        },

        seeDentist: () => {
          const s = get()
          if (!s.alive) return
          const cost = outOfPocket(s.age, scaleByCountry(120, s.countryCode))
          if (s.money < cost) return
          if (!useYearlyAction('dentist')) return
          set({
            money: s.money - cost,
            stats: {
              ...s.stats,
              looks: gainStat(s.stats.looks, randomInt(1, 3)),
              health: gainStat(s.stats.health, randomInt(0, 2)),
            },
          })
          playSfx('success')
          addLog([{ text: 'A trip to the dentist left you with a brighter smile. 🦷', kind: 'event' }])
        },

        seeTherapist: () => {
          const s = get()
          if (!s.alive) return
          const cost = outOfPocket(s.age, scaleByCountry(250, s.countryCode))
          if (s.money < cost) return
          if (!useYearlyAction('therapist')) return
          set({
            money: s.money - cost,
            stats: {
              ...s.stats,
              happiness: clampStat(s.stats.happiness + randomInt(8, 15)),
              stress: clampStat(s.stats.stress - randomInt(10, 18)),
            },
          })
          playSfx('success')
          addLog([{ text: 'Therapy helped you work through things. You feel lighter.', kind: 'event' }])
        },

        plasticSurgery: () => {
          const s = get()
          if (!s.alive || s.age < 18) return
          const cost = scaleByCountry(7000, s.countryCode)
          if (s.money < cost) return
          if (!useYearlyAction('surgery')) return
          const botched = Math.random() < 0.15
          if (botched) {
            set({
              money: s.money - cost,
              stats: {
                ...s.stats,
                looks: clampStat(s.stats.looks - randomInt(5, 12)),
                health: clampStat(s.stats.health - randomInt(3, 8)),
              },
            })
            playSfx('hurt')
            addLog([{ text: 'The surgery was botched. Not the look you paid for. 😬', kind: 'event' }])
            return
          }
          // Surgery is enhancement: it bypasses the natural stat cap (baseSet),
          // so it's the one way to push looks beyond NATURAL_STAT_CAP.
          baseSet({
            money: s.money - cost,
            stats: { ...s.stats, looks: clampStat(s.stats.looks + randomInt(8, 16)) },
          })
          playSfx('cash')
          addLog([{ text: 'You went under the knife and came out looking fabulous. ✨', kind: 'event' }])
        },

        spaDay: () => {
          const s = get()
          if (!s.alive) return
          const cost = outOfPocket(s.age, scaleByCountry(200, s.countryCode))
          if (s.money < cost) return
          if (!useYearlyAction('spa')) return
          set({
            money: s.money - cost,
            stats: {
              ...s.stats,
              happiness: clampStat(s.stats.happiness + randomInt(3, 7)),
              looks: gainStat(s.stats.looks, randomInt(1, 3)),
              stress: clampStat(s.stats.stress - randomInt(8, 16)),
            },
          })
          playSfx('cash')
          addLog([{ text: 'A day at the spa left you glowing and refreshed. 💆', kind: 'event' }])
        },

        buyInvestment: (id: string, cash: number) => {
          const s = get()
          const inv = getInvestment(id)
          if (!s.alive || s.age < 18 || !inv || cash <= 0 || s.money < cash) return
          const price = s.investPrices[id] ?? inv.start
          const units = cash / price
          const cur = s.investments[id] ?? { units: 0, invested: 0 }
          set({
            money: s.money - cash,
            investments: {
              ...s.investments,
              [id]: { units: cur.units + units, invested: cur.invested + cash },
            },
          })
          playSfx('cash')
          addLog([
            { text: `You invested $${Math.round(cash).toLocaleString()} in ${inv.name} (${inv.ticker}). 📈`, kind: 'money' },
          ])
        },

        sellInvestment: (id: string, fraction: number) => {
          const s = get()
          const inv = getInvestment(id)
          const holding = s.investments[id]
          if (!s.alive || !inv || !holding || holding.units <= 0) return
          const f = Math.max(0, Math.min(1, fraction))
          const unitsSold = holding.units * f
          const price = s.investPrices[id] ?? inv.start
          const proceeds = Math.round(unitsSold * price)
          const costSold = holding.invested * f
          const investments = { ...s.investments }
          const remaining = holding.units - unitsSold
          if (remaining < 1e-6) delete investments[id]
          else investments[id] = { units: remaining, invested: holding.invested - costSold }
          const gain = proceeds - Math.round(costSold)
          set({ money: s.money + proceeds, investments })
          playSfx('cash')
          addLog([
            {
              text: `You sold ${inv.name} (${inv.ticker}) for $${proceeds.toLocaleString()} — a ${gain >= 0 ? 'gain' : 'loss'} of $${Math.abs(gain).toLocaleString()}.`,
              kind: 'money',
            },
          ])
        },

        oneNightStand: () => {
          const s = get()
          if (!s.alive || s.age < 18 || s.prison) return
          if (!useYearlyAction('one-night-stand')) return
          const roll = Math.random()
          const stats = { ...s.stats }
          // Build a new fling you can reach out to later (capped, to avoid clutter).
          const flingCount = s.relationships.filter((p) => p.role === 'fling' && p.alive).length
          const makeFling = (): { person: Person; nextFriendId: number } | null => {
            if (flingCount >= 6) return null
            const g: Gender = s.gender === 'male' ? 'female' : 'male'
            const person: Person = {
              id: `fling-${s.nextFriendId}`,
              role: 'fling',
              gender: g,
              name: `${randomFirstName(s.countryCode, g)} ${randomLastName(s.countryCode)}`,
              age: Math.max(18, s.age + randomInt(-5, 5)),
              alive: true,
              relationship: randomInt(30, 55),
              ...makeNpcLife(),
            }
            return { person, nextFriendId: s.nextFriendId + 1 }
          }
          if (roll < 0.58) {
            // A good night out — you swap numbers.
            stats.happiness = clampStat(stats.happiness + randomInt(5, 9))
            const f = makeFling()
            set({
              stats,
              ...(f
                ? { relationships: [...s.relationships, f.person], nextFriendId: f.nextFriendId }
                : {}),
            })
            playSfx('success')
            addLog([
              {
                text: f
                  ? `You had a fun night with ${f.person.name} — and swapped numbers. 😏`
                  : 'You had a fun, no-strings night out. No regrets. 😏',
                kind: 'relationship',
              },
            ])
          } else if (roll < 0.8) {
            // Forgettable.
            stats.happiness = clampStat(stats.happiness - randomInt(1, 4))
            set({ stats })
            playSfx('click')
            addLog([{ text: 'The date fizzled — you snuck out before breakfast. 😬', kind: 'relationship' }])
          } else if (roll < 0.94) {
            // A health scare — you may catch an STD.
            const std = pickIllness('std', s.age)
            const already = std ? (s.conditions ?? []).some((c) => c.id === std.id) : true
            if (std && !already) {
              stats.happiness = clampStat(stats.happiness - randomInt(3, 6))
              set({ stats, conditions: [...(s.conditions ?? []), { id: std.id, years: 0 }] })
              playSfx('hurt')
              addLog([
                { text: `You caught ${std.name} from a hookup. ${std.emoji} Get it treated at the clinic.`, kind: 'event' },
              ])
            } else {
              stats.health = clampStat(stats.health - randomInt(3, 7))
              stats.happiness = clampStat(stats.happiness - randomInt(3, 7))
              set({ stats })
              playSfx('hurt')
              addLog([{ text: 'A rough morning after — you felt off for days. 🤒', kind: 'event' }])
            }
          } else {
            // They caught feelings — and they're not going anywhere.
            stats.happiness = clampStat(stats.happiness + randomInt(1, 4))
            const f = makeFling()
            if (f) f.person.relationship = randomInt(55, 75)
            set({
              stats,
              ...(f
                ? { relationships: [...s.relationships, f.person], nextFriendId: f.nextFriendId }
                : {}),
            })
            playSfx('pop')
            addLog([
              {
                text: f
                  ? `${f.person.name} texted "had a great time 🥰" the next morning. They're keen.`
                  : 'They texted "had a great time 🥰" the next morning. Awkward.',
                kind: 'relationship',
              },
            ])
          }
        },

        hookUp: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || s.age < 18) return
          if (person.role !== 'fling' && person.role !== 'ex') return
          if (!useYearlyAction(`hookup-${personId}`)) return
          const partner = s.relationships.find((p) => p.id === 'partner' && p.alive)

          let relationships = s.relationships.map((p) =>
            p.id === personId
              ? { ...p, relationship: clampRelationship(p.relationship + randomInt(4, 9)) }
              : p,
          )
          const stats = { ...s.stats, happiness: clampStat(s.stats.happiness + randomInt(3, 7)) }
          let conditions = s.conditions ?? []
          const logs: Array<Pick<LogEntry, 'text' | 'kind'>> = []
          let sfx: Parameters<typeof playSfx>[0] = 'success'

          // A small chance of an STD, same as any casual encounter.
          if (Math.random() < 0.12) {
            const std = pickIllness('std', s.age)
            if (std && !conditions.some((c) => c.id === std.id)) {
              conditions = [...conditions, { id: std.id, years: 0 }]
              logs.push({
                text: `You hooked up with ${person.name} — and caught ${std.name}. ${std.emoji}`,
                kind: 'event',
              })
              sfx = 'hurt'
            }
          }

          let nextFriendId = s.nextFriendId
          let partnerStatus = s.partnerStatus
          if (partner) {
            // This is cheating — there's a chance your partner finds out.
            if (Math.random() < 0.32) {
              sfx = 'heartbreak'
              const newRel = clampRelationship(partner.relationship - randomInt(30, 55))
              stats.happiness = clampStat(stats.happiness - randomInt(8, 15))
              const dumped = newRel < 25 && Math.random() < 0.6
              if (dumped) {
                const exId = `ex-${nextFriendId++}`
                relationships = relationships.map((p) =>
                  p.id === 'partner' ? { ...p, id: exId, role: 'ex', relationship: newRel } : p,
                )
                partnerStatus = null
                logs.push({
                  text: `${partner.name} caught you cheating with ${person.name} — and left you. 💔`,
                  kind: 'relationship',
                })
              } else {
                relationships = relationships.map((p) =>
                  p.id === 'partner' ? { ...p, relationship: newRel } : p,
                )
                logs.push({
                  text: `${partner.name} found out you cheated with ${person.name}. They're furious. 😡`,
                  kind: 'relationship',
                })
              }
            } else {
              stats.happiness = clampStat(stats.happiness - randomInt(0, 2)) // a twinge of guilt
              logs.push({
                text: `You secretly hooked up with ${person.name} behind ${partner.name}'s back. 😬`,
                kind: 'relationship',
              })
            }
          } else if (logs.length === 0) {
            logs.push({ text: `You hooked up with ${person.name} again. 😏`, kind: 'relationship' })
          }

          set({ relationships, stats, conditions, nextFriendId, partnerStatus })
          playSfx(sfx)
          addLog(logs)
        },

        sendText: (personId, payload) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          const isUtility = payload.consumable === false
          if (isUtility) {
            // Asking a parent for allowance is capped once per year, so it
            // can't be farmed for cash.
            if (!useYearlyAction(`text-util-${personId}`)) return
          } else {
            // Conversational lines: send as many different ones as you like,
            // but never the same line twice — it's spent for the rest of life.
            if (!payload.messageId || s.usedTexts.includes(`${personId}:${payload.messageId}`)) return
            set({ usedTexts: [...s.usedTexts, `${personId}:${payload.messageId}`] })
          }
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + payload.bond),
          })
          const cur = get()
          const patch: Partial<GameState> = {
            stats: { ...cur.stats, happiness: clampStat(cur.stats.happiness + payload.happiness) },
          }
          // A parent handing over allowance.
          if (payload.money) patch.money = cur.money + scaleByCountry(payload.money, cur.countryCode)
          // A parent buying you a phone — the cheapest current model, if you
          // don't already own one.
          if (payload.grantsPhone && !cur.ownedAssetIds.some((id) => getAsset(id)?.category === 'phone')) {
            const phones = phonesForYear(cur.year)
            const cheapest = phones[phones.length - 1]
            if (cheapest) {
              patch.ownedAssetIds = [...cur.ownedAssetIds, cheapest.id]
              addLog([{ text: `${person.name} bought you a ${cheapest.name}! 📱`, kind: 'relationship' }])
            }
          }
          set(patch)
        },

        treatIllness: (id: string) => {
          const s = get()
          if (!s.alive) return
          const cond = (s.conditions ?? []).find((c) => c.id === id)
          const ill = getIllness(id)
          if (!cond || !ill) return
          const cost = outOfPocket(s.age, scaleByCountry(ill.treatCost, s.countryCode))
          if (s.money < cost) return
          if (!useYearlyAction(`treat-${id}`)) return
          const cured = Math.random() < ill.treatCure
          if (cured) {
            set({
              money: s.money - cost,
              conditions: (s.conditions ?? []).filter((c) => c.id !== id),
              stats: {
                ...s.stats,
                health: gainStat(s.stats.health, ill.kind === 'serious' ? 12 : 5),
              },
            })
            playSfx('success')
            addLog([{ text: `You beat ${ill.name} — the treatment worked! 🎉`, kind: 'event' }])
          } else {
            set({
              money: s.money - cost,
              stats: { ...s.stats, health: gainStat(s.stats.health, 2) },
            })
            playSfx('hurt')
            addLog([
              { text: `You underwent treatment for ${ill.name}, but it hasn't cleared up. Keep fighting.`, kind: 'event' },
            ])
          }
        },

        commitCrime: (crimeId: string) => {
          const s = get()
          if (s.prison) return
          const crime = getCrime(crimeId)
          if (!crime || !s.alive || s.age < crime.minAge) return
          if (!useYearlyAction(`crime-${crimeId}`)) return

          const stats = { ...s.stats }
          let money = s.money
          const apply = (e: typeof crime.success) => {
            const { money: m = 0, ...statDeltas } = e
            for (const key of Object.keys(statDeltas) as (keyof Stats)[]) {
              stats[key] = gainStat(stats[key], statDeltas[key] ?? 0)
            }
            money += m
          }

          const caught = Math.random() < crime.catchChance
          if (caught) {
            apply(crime.caught)
            const timesArrested = s.timesArrested + 1
            // Trial: a smart defendant (esp. for petty crimes) can beat the rap.
            const petty = crime.maxSentence <= 2
            const acquitChance = petty
              ? Math.min(0.5, 0.25 + s.stats.smarts / 400)
              : Math.min(0.2, s.stats.smarts / 700)
            if (Math.random() < acquitChance) {
              set({ money, stats, criminalRecord: true, timesArrested })
              playSfx('police')
              addLog([
                { text: `You were caught trying to ${crime.name.toLowerCase()}, but a slick defense got you off with probation.`, kind: 'death' },
              ])
              return
            }
            // Convicted → prison. You lose your job and any sports career.
            const sentence = randomInt(Math.max(1, Math.round(crime.maxSentence / 3)), crime.maxSentence)
            set({
              money,
              stats,
              criminalRecord: true,
              timesArrested,
              prison: { crime: crime.name, sentence, yearsLeft: sentence, behavior: 50 },
              jobId: null,
              jobTier: 0,
              yearsInJob: 0,
              raisePercent: 0,
              sport: null,
              relationships: withoutWorkPeople(s.relationships),
              currentEvent: arrestEvent(crime.name, sentence),
            })
            playSfx('police')
            addLog([
              { text: `You were convicted of ${crime.name.toLowerCase()} and sentenced to ${sentence} year${sentence === 1 ? '' : 's'} in prison. 🚔`, kind: 'death' },
            ])
          } else {
            const payout = crime.reward > 0 ? randomInt(Math.round(crime.reward * 0.5), Math.round(crime.reward * 1.5)) : 0
            money += payout
            apply(crime.success)
            set({ money, stats })
            if (payout > 0) playSfx('cash')
            addLog([
              {
                text:
                  payout > 0
                    ? `You pulled off the ${crime.name.toLowerCase()} and got away with $${payout.toLocaleString()}. 😈`
                    : `You committed ${crime.name.toLowerCase()} and slipped away into the night.`,
                kind: 'event',
              },
            ])
          }
        },

        // ----- Prison -----

        attemptEscape: () => {
          const s = get()
          if (!s.alive || !s.prison) return
          if (!useYearlyAction('escape')) return
          const chance = 0.3 + s.stats.smarts / 600 + s.stats.health / 600
          if (Math.random() < chance) {
            set({
              prison: null,
              stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 8) },
            })
            playSfx('success')
            addLog([
              { text: 'You broke out of prison and vanished into the night! Freedom — for now. 🏃', kind: 'event' },
            ])
          } else {
            const extra = randomInt(2, 5)
            set({
              prison: {
                ...s.prison,
                yearsLeft: s.prison.yearsLeft + extra,
                sentence: s.prison.sentence + extra,
                behavior: clampStat(s.prison.behavior - 30),
              },
              stats: { ...s.stats, health: clampStat(s.stats.health - randomInt(5, 15)) },
            })
            playSfx('hurt')
            addLog([
              { text: `Your escape attempt failed. The guards were waiting, and tacked ${extra} years onto your sentence. 🚨`, kind: 'death' },
            ])
          }
        },

        prisonBehave: () => {
          const s = get()
          if (!s.alive || !s.prison) return
          if (!useYearlyAction('behave')) return
          const behavior = clampStat(s.prison.behavior + randomInt(8, 15))
          let yearsLeft = s.prison.yearsLeft
          let paroled = false
          if (behavior >= 75 && yearsLeft > 1 && Math.random() < 0.45) {
            yearsLeft -= 1
            paroled = true
          }
          set({
            prison: { ...s.prison, behavior, yearsLeft },
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 2) },
          })
          if (paroled) playSfx('success')
          addLog([
            {
              text: paroled
                ? 'Good behaviour earned you a year off your sentence. 🙏'
                : 'You kept your head down and stayed out of trouble this year.',
              kind: 'career',
            },
          ])
        },

        prisonWorkout: () => {
          const s = get()
          if (!s.alive || !s.prison) return
          if (!useYearlyAction('prison-workout')) return
          set({
            prison: { ...s.prison, behavior: clampStat(s.prison.behavior + 3) },
            stats: { ...s.stats, health: gainStat(s.stats.health, randomInt(3, 7)) },
          })
          playSfx('gym')
          addLog([{ text: 'You spent the year in the prison yard getting seriously swole. 💪', kind: 'career' }])
        },

        bribeGuard: () => {
          const s = get()
          if (!s.alive || !s.prison) return
          const cost = scaleByCountry(5000, s.countryCode)
          if (s.money < cost) return
          if (!useYearlyAction('bribe')) return
          if (Math.random() < 0.6) {
            const off = randomInt(1, Math.min(3, s.prison.yearsLeft))
            set({
              money: s.money - cost,
              prison: { ...s.prison, yearsLeft: Math.max(0, s.prison.yearsLeft - off) },
            })
            playSfx('cash')
            addLog([
              { text: `You slipped a guard $${cost.toLocaleString()} and shaved ${off} year${off === 1 ? '' : 's'} off your sentence. 🤫`, kind: 'career' },
            ])
          } else {
            set({ money: s.money - cost })
            playSfx('fail')
            addLog([
              { text: 'You tried to bribe a guard — they took the cash and wrote you up anyway.', kind: 'career' },
            ])
          }
        },

        buyAsset: (assetId: string) => {
          const s = get()
          const asset = getAsset(assetId)
          if (!asset || !s.alive || s.money < asset.price) return
          if (s.ownedAssetIds.includes(assetId)) return
          set({
            money: s.money - asset.price,
            ownedAssetIds: [...s.ownedAssetIds, assetId],
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + asset.joy) },
          })
          playSfx(asset.category === 'car' ? 'honk' : 'cash')
          addLog([
            { text: `You bought a ${asset.name} ${asset.emoji} for $${asset.price.toLocaleString()}!`, kind: 'event' },
          ])
        },

        sellAsset: (assetId: string) => {
          const s = get()
          const asset = getAsset(assetId)
          if (!asset || !s.alive || !s.ownedAssetIds.includes(assetId)) return
          const value = resaleValue(asset)
          set({
            money: s.money + value,
            ownedAssetIds: s.ownedAssetIds.filter((id) => id !== assetId),
          })
          playSfx('cash')
          addLog([
            { text: `You sold your ${asset.name} for $${value.toLocaleString()}.`, kind: 'event' },
          ])
        },

        // ----- Houses -----

        buyHome: (listingId: string) => {
          const s = get()
          const listing = s.homeListings.find((l) => l.id === listingId)
          if (!listing || !s.alive || s.money < listing.price) return
          // Your first home is where you live; extra homes get rented out.
          const becomesResidence = !s.residenceId
          const owned: OwnedHome = { ...listing, boughtYear: s.year }
          set({
            money: s.money - listing.price,
            homes: [...s.homes, owned],
            homeListings: s.homeListings.filter((l) => l.id !== listingId),
            residenceId: becomesResidence ? listing.id : s.residenceId,
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 10) },
          })
          playSfx('cash')
          addLog([
            {
              text: becomesResidence
                ? `You bought ${listing.name} ${listing.emoji} for $${listing.price.toLocaleString()} — your new home! 🏠`
                : `You bought ${listing.name} ${listing.emoji} for $${listing.price.toLocaleString()} to rent out. 💰`,
              kind: 'money',
            },
          ])
        },

        sellHome: (homeId: string) => {
          const s = get()
          const home = s.homes.find((h) => h.id === homeId)
          if (!home || !s.alive) return
          const value = Math.round(home.price / 2)
          const remaining = s.homes.filter((h) => h.id !== homeId)
          // Sold the place you lived in? Move into your next-priciest house.
          let residenceId = s.residenceId
          if (residenceId === homeId) {
            residenceId = [...remaining].sort((a, b) => b.price - a.price)[0]?.id ?? null
          }
          set({ money: s.money + value, homes: remaining, residenceId })
          playSfx('cash')
          addLog([{ text: `You sold ${home.name} for $${value.toLocaleString()}.`, kind: 'money' }])
        },

        setResidence: (homeId: string) => {
          const s = get()
          const home = s.homes.find((h) => h.id === homeId)
          if (!home || s.residenceId === homeId) return
          set({ residenceId: homeId })
          addLog([{ text: `You moved into ${home.name}. 🏠`, kind: 'event' }])
        },

        // ----- Pets -----

        adoptPet: (optionId: string) => {
          const s = get()
          const opt = getPetOption(optionId)
          if (!opt || !s.alive || s.money < opt.price) return
          const pet: Pet = {
            id: `pet-${s.nextPetId}`,
            optionId: opt.id,
            name: pick(PET_NAMES),
            emoji: opt.emoji,
            breed: opt.breed,
            age: 0,
            alive: true,
            happiness: randomInt(75, 95),
            bond: randomInt(50, 70),
          }
          set({
            pets: [...s.pets, pet],
            nextPetId: s.nextPetId + 1,
            money: s.money - opt.price,
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + opt.joy) },
          })
          playSfx('success')
          addLog([
            { text: `You adopted ${pet.name} the ${opt.breed} ${opt.emoji}!`, kind: 'relationship' },
          ])
        },

        playWithPet: (petId: string) => {
          const s = get()
          const pet = s.pets.find((p) => p.id === petId)
          if (!pet?.alive || !s.alive) return
          if (!useYearlyAction(`pet-play-${petId}`)) return
          updatePet(petId, {
            bond: clampStat(pet.bond + randomInt(4, 9)),
            happiness: clampStat(pet.happiness + randomInt(5, 10)),
          })
          set({ stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 3) } })
          addLog([{ text: `You played with ${pet.name}. Tails were wagged.`, kind: 'relationship' }])
        },

        feedPet: (petId: string) => {
          const s = get()
          const pet = s.pets.find((p) => p.id === petId)
          if (!pet?.alive || !s.alive || s.money < 10) return
          if (!useYearlyAction(`pet-feed-${petId}`)) return
          updatePet(petId, {
            bond: clampStat(pet.bond + randomInt(2, 5)),
            happiness: clampStat(pet.happiness + randomInt(4, 8)),
          })
          set({ money: get().money - 10 })
          addLog([{ text: `You gave ${pet.name} a tasty treat. 🦴`, kind: 'relationship' }])
        },

        walkPet: (petId: string) => {
          const s = get()
          const pet = s.pets.find((p) => p.id === petId)
          const opt = pet && getPetOption(pet.optionId)
          if (!pet?.alive || !s.alive || !opt?.walkable) return
          if (!useYearlyAction(`pet-walk-${petId}`)) return
          updatePet(petId, {
            bond: clampStat(pet.bond + randomInt(3, 7)),
            happiness: clampStat(pet.happiness + randomInt(4, 8)),
          })
          set({
            stats: {
              ...get().stats,
              health: clampStat(get().stats.health + randomInt(1, 3)),
              happiness: clampStat(get().stats.happiness + 2),
            },
          })
          addLog([{ text: `You took ${pet.name} for a long walk. Good for you both. 🐾`, kind: 'relationship' }])
        },

        vetPet: (petId: string) => {
          const s = get()
          const pet = s.pets.find((p) => p.id === petId)
          if (!pet?.alive || !s.alive) return
          const cost = scaleByCountry(150, s.countryCode)
          if (s.money < cost) return
          if (!useYearlyAction(`pet-vet-${petId}`)) return
          updatePet(petId, { happiness: clampStat(pet.happiness + randomInt(15, 30)) })
          set({ money: get().money - cost })
          addLog([
            { text: `You took ${pet.name} to the vet ($${cost.toLocaleString()}). Clean bill of health.`, kind: 'relationship' },
          ])
        },

        teachTrick: (petId: string) => {
          const s = get()
          const pet = s.pets.find((p) => p.id === petId)
          if (!pet?.alive || !s.alive) return
          if (!useYearlyAction(`pet-trick-${petId}`)) return
          if (Math.random() < 0.6) {
            updatePet(petId, { bond: clampStat(pet.bond + randomInt(5, 10)) })
            playSfx('success')
            addLog([{ text: `${pet.name} learned a new trick! Who's a good one? 🎉`, kind: 'relationship' }])
          } else {
            addLog([{ text: `${pet.name} just stared at you. Maybe next year.`, kind: 'relationship' }])
          }
        },

        rehomePet: (petId: string) => {
          const s = get()
          const pet = s.pets.find((p) => p.id === petId)
          if (!pet || !s.alive) return
          set({
            pets: s.pets.filter((p) => p.id !== petId),
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness - 4) },
          })
          playSfx('fail')
          addLog([{ text: `You found ${pet.name} a new home. Bittersweet.`, kind: 'relationship' }])
        },

        insult: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (!useYearlyAction(`insult-${personId}`)) return
          playSfx('punch')
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship - randomInt(8, 18)),
          })
          if (Math.random() < 0.5) {
            set({
              stats: { ...get().stats, happiness: clampStat(get().stats.happiness - 3) },
            })
            addLog([
              { text: `You insulted ${person.name}. They fired back something meaner. Ouch.`, kind: 'relationship' },
            ])
          } else {
            set({
              stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 2) },
            })
            addLog([
              { text: `You insulted ${person.name}. Petty? Yes. Satisfying? Also yes.`, kind: 'relationship' },
            ])
          }
          // Push someone far enough and they become an enemy.
          const updated = get().relationships.find((p) => p.id === personId)
          const canTurn: PersonRole[] = ['friend', 'sibling', 'classmate', 'coworker']
          if (updated && updated.role !== 'enemy' && canTurn.includes(updated.role) && updated.relationship < 15) {
            updatePerson(personId, { role: 'enemy' })
            addLog([{ text: `${updated.name} now considers you an enemy. 😠`, kind: 'relationship' }])
          }
        },

        makePeace: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || person.role !== 'enemy') return
          if (!useYearlyAction(`peace-${personId}`)) return
          if (Math.random() < 0.55) {
            updatePerson(personId, {
              role: 'friend',
              relationship: clampRelationship(person.relationship + randomInt(15, 30)),
            })
            playSfx('success')
            addLog([{ text: `You made peace with ${person.name}. Enemies no more. 🕊️`, kind: 'relationship' }])
          } else {
            playSfx('fail')
            addLog([{ text: `${person.name} rejected your peace offering. The feud continues.`, kind: 'relationship' }])
          }
        },

        askForAdvice: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (person.role !== 'mother' && person.role !== 'father') return
          if (!useYearlyAction(`advice-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(3, 6)),
          })
          set({
            stats: { ...get().stats, smarts: gainStat(get().stats.smarts, randomInt(1, 2)) },
          })
          addLog([
            { text: `${person.name} shared some hard-earned life advice. It actually helped.`, kind: 'relationship' },
          ])
        },

        prankSibling: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || person.role !== 'sibling') return
          if (!useYearlyAction(`prank-${personId}`)) return
          if (Math.random() < 0.5) {
            updatePerson(personId, {
              relationship: clampRelationship(person.relationship + randomInt(3, 8)),
            })
            set({
              stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 5) },
            })
            addLog([
              { text: `Your prank on ${person.name} was legendary. Even they had to laugh.`, kind: 'relationship' },
            ])
          } else {
            updatePerson(personId, {
              relationship: clampRelationship(person.relationship - randomInt(4, 10)),
            })
            addLog([
              { text: `Your prank on ${person.name} backfired badly. They're plotting revenge.`, kind: 'relationship' },
            ])
          }
        },

        watchMovie: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || person.role !== 'friend' || s.money < MOVIE_COST) return
          if (!useYearlyAction(`movie-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(5, 10)),
          })
          set({
            money: get().money - MOVIE_COST,
            stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 4) },
          })
          addLog([
            { text: `You caught a movie with ${person.name}. The popcorn was criminally overpriced.`, kind: 'relationship' },
          ])
        },

        studyTogether: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || person.role !== 'classmate') return
          if (!useYearlyAction(`study-with-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(4, 8)),
          })
          set({
            stats: { ...get().stats, smarts: gainStat(get().stats.smarts, randomInt(1, 2)) },
          })
          addLog([
            { text: `You studied with ${person.name}. Half studying, half memes — still counts.`, kind: 'career' },
          ])
        },

        grabLunch: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || s.money < LUNCH_COST) return
          if (person.role !== 'coworker' && person.role !== 'boss') return
          if (!useYearlyAction(`lunch-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(5, 10)),
          })
          set({
            money: get().money - LUNCH_COST,
            stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 3) },
          })
          addLog([
            { text: `You grabbed lunch with ${person.name}. Office gossip was exchanged.`, kind: 'relationship' },
          ])
        },

        weekendGetaway: () => {
          const s = get()
          const partner = s.relationships.find((p) => p.id === 'partner')
          if (!partner?.alive || !s.alive || s.money < GETAWAY_COST) return
          if (!useYearlyAction('getaway')) return
          updatePerson('partner', {
            relationship: clampRelationship(partner.relationship + randomInt(10, 16)),
          })
          set({
            money: get().money - GETAWAY_COST,
            stats: {
              ...get().stats,
              happiness: clampStat(get().stats.happiness + 8),
              stress: clampStat(get().stats.stress - randomInt(10, 20)),
            },
          })
          addLog([
            { text: `You whisked ${partner.name} away for a weekend getaway. 10/10, would elope again.`, kind: 'relationship' },
          ])
        },

        askTeacherHelp: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || person.role !== 'teacher') return
          if (!useYearlyAction(`teacher-help-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(2, 5)),
          })
          set({
            stats: { ...get().stats, smarts: gainStat(get().stats.smarts, randomInt(1, 3)) },
          })
          addLog([
            { text: `${person.name} stayed after class to help you. It actually made sense this time.`, kind: 'career' },
          ])
        },

        befriend: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          // Only acquaintances can be befriended (not family, partner or enemies).
          const eligible: PersonRole[] = ['classmate', 'coworker', 'boss', 'teacher']
          if (!eligible.includes(person.role)) return
          const friends = s.relationships.filter((p) => p.role === 'friend' && p.alive)
          if (friends.length >= MAX_FRIENDS) return
          // Authority figures (boss, teacher) take a much stronger bond to win over.
          const needed = person.role === 'boss' || person.role === 'teacher' ? 75 : 55
          if (person.relationship < needed) return
          updatePerson(personId, { role: 'friend' })
          playSfx('success')
          addLog([
            { text: `You and ${person.name} are officially friends now. 🤝`, kind: 'relationship' },
          ])
        },

        askOut: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || s.age < 16) return
          if (s.relationships.some((p) => p.id === 'partner' && p.alive)) return
          // You can ask out acquaintances, exes and flings — not family/enemies.
          const eligible: PersonRole[] = ['friend', 'classmate', 'coworker', 'ex', 'fling']
          if (!eligible.includes(person.role)) return
          if (!useYearlyAction(`askout-${personId}`)) return
          // Better odds with a strong bond and good looks.
          const chance = Math.min(0.9, person.relationship / 130 + s.stats.looks / 300)
          if (Math.random() < chance) {
            // They become your partner: drop the old entry (and any lingering
            // deceased partner), then add the partner slot.
            set({
              relationships: [
                ...s.relationships.filter((p) => p.id !== personId && p.id !== 'partner'),
                {
                  id: 'partner',
                  role: 'partner',
                  gender: person.gender,
                  name: person.name,
                  age: person.age,
                  alive: true,
                  relationship: clampRelationship(person.relationship),
                  career: person.career,
                  hobby: person.hobby,
                },
              ],
              partnerStatus: 'dating',
              stats: { ...s.stats, happiness: clampStat(s.stats.happiness + randomInt(4, 8)) },
            })
            playSfx('match')
            addLog([{ text: `You asked ${person.name} out — and they said yes! You're dating now. 💕`, kind: 'relationship' }])
          } else {
            updatePerson(personId, {
              relationship: clampRelationship(person.relationship - randomInt(3, 8)),
            })
            set({ stats: { ...get().stats, happiness: clampStat(get().stats.happiness - randomInt(2, 5)) } })
            playSfx('fail')
            addLog([{ text: `You asked ${person.name} out, but they just want to be friends. Ouch.`, kind: 'relationship' }])
          }
        },

        // ----- Career -----

        applyForJob: (jobId: string) => {
          const s = get()
          const job = getJob(jobId)
          if (!job || !s.alive || s.screen !== 'life' || s.jobId === jobId) return
          if (!s.jobOpenings.includes(jobId)) return
          if (
            jobBlocker(job, {
              age: s.age,
              smarts: s.stats.smarts,
              looks: s.stats.looks,
              hasDegree: s.hasDegree,
              major: s.major,
              criminalRecord: s.criminalRecord,
            })
          ) {
            return
          }
          const crew = rollWorkplacePeople(s.countryCode, s.age, s.nextFriendId)
          set({
            jobId,
            jobTier: 0,
            yearsInJob: 0,
            raisePercent: 0,
            relationships: [...withoutWorkPeople(s.relationships), ...crew],
            nextFriendId: s.nextFriendId + crew.length,
          })
          addLog([
            {
              text: `You aced the interview and were hired as a ${jobTitle(job, 0)} ${job.emoji} earning $${annualSalary(job, 0, 0, s.countryCode).toLocaleString()}/year!`,
              kind: 'career',
            },
          ])
        },

        failInterview: (jobId: string) => {
          const s = get()
          const job = getJob(jobId)
          if (!job || !s.alive) return
          addLog([
            { text: `You flubbed the interview question for the ${job.title} job. Awkward.`, kind: 'career' },
          ])
        },

        tryoutForSpecialJob: (jobId: string) => {
          const s = get()
          const job = getJob(jobId)
          if (!job || !job.special || !s.alive || s.screen !== 'life' || s.jobId === jobId) return
          if (s.age < job.minAge) return
          // One attempt per fame career per year.
          if (!useYearlyAction(`tryout-${jobId}`)) return

          // Sports careers are decided by hidden athletic talent; entertainment
          // careers by the job's audition stat (looks etc).
          const sportKind = jobSport(jobId)
          const stat = sportKind ? s.athletics : job.auditionStat ? s.stats[job.auditionStat] : 50
          const min = job.auditionMin ?? 50
          // Better talent → better odds; there's always a slim/​capped chance.
          const chance = Math.max(0.05, Math.min(0.9, (stat - min) / 50 + 0.3))
          if (Math.random() < chance) {
            const crew = rollWorkplacePeople(s.countryCode, s.age, s.nextFriendId)
            // Sports careers draft you onto a random team in a random league.
            let sport: SportState | null = null
            if (sportKind) {
              const league = pick(leaguesForSport(sportKind))
              const team = pick(league.teams)
              sport = {
                teamId: team.id,
                skill: clampStat(40 + Math.round((s.athletics - 55) / 2) + randomInt(0, 10)),
                titles: 0,
                mvps: 0,
                wins: 0,
                losses: 0,
              }
            }
            set({
              jobId,
              jobTier: 0,
              yearsInJob: 0,
              raisePercent: 0,
              sport,
              relationships: [...withoutWorkPeople(s.relationships), ...crew],
              nextFriendId: s.nextFriendId + crew.length,
            })
            playSfx('levelup')
            const where = sport ? ` for the ${getTeam(sport.teamId)?.team.name}` : ''
            addLog([
              {
                text: `You made it! You're now a ${jobTitle(job, 0)} ${job.emoji}${where}, earning $${annualSalary(job, 0, 0, s.countryCode).toLocaleString()}/year. Stardom awaits! 🌟`,
                kind: 'career',
              },
            ])
          } else {
            playSfx('fail')
            addLog([
              {
                text: `You tried out to be a ${job.title.toLowerCase()}, but didn't make the cut this time. Keep training.`,
                kind: 'career',
              },
            ])
          }
        },

        quitJob: () => {
          const s = get()
          const job = getJob(s.jobId)
          if (!job || !s.alive) return
          const retiring = !!s.sport
          const titles = s.sport?.titles ?? 0
          const mvps = s.sport?.mvps ?? 0
          set({
            jobId: null,
            jobTier: 0,
            yearsInJob: 0,
            raisePercent: 0,
            sport: null,
            relationships: withoutWorkPeople(s.relationships),
          })
          if (retiring) {
            const honours =
              titles || mvps
                ? ` You retire with ${titles} title${titles === 1 ? '' : 's'} and ${mvps} MVP${mvps === 1 ? '' : 's'}. A legend.`
                : ''
            playSfx('graduate')
            addLog([
              { text: `You retired from ${jobTitle(job, s.jobTier).toLowerCase()}.${honours}`, kind: 'career' },
            ])
          } else {
            addLog([{ text: `You quit your job as a ${jobTitle(job, s.jobTier)}.`, kind: 'career' }])
          }
        },

        retire: () => {
          const s = get()
          const job = getJob(s.jobId)
          if (!job || !s.alive) return
          const finalSalary = annualSalary(job, s.jobTier, s.raisePercent, s.countryCode)
          const years = Math.max(1, s.yearsInJob)
          // Pension scales with your final pay and how long you worked; a
          // lump-sum nest egg is paid out on the way out.
          const pension = Math.round(finalSalary * Math.min(0.6, 0.15 + years * 0.012))
          const fund = Math.round(finalSalary * years * 0.05)
          set({
            jobId: null,
            jobTier: 0,
            yearsInJob: 0,
            raisePercent: 0,
            sport: null,
            pension,
            money: s.money + fund,
            relationships: withoutWorkPeople(s.relationships),
          })
          playSfx('graduate')
          addLog([
            {
              text: `You retired after ${years} year${years === 1 ? '' : 's'} as a ${jobTitle(job, s.jobTier).toLowerCase()}. Nest egg $${fund.toLocaleString()}, pension $${pension.toLocaleString()}/yr. 🌴`,
              kind: 'career',
            },
          ])
        },

        // ----- Pro sports -----

        trainAthlete: () => {
          const s = get()
          if (!s.alive || !s.sport) return
          if (!useYearlyAction('train-athlete')) return
          const gain = randomInt(2, 5)
          const coach = s.relationships.find((p) => p.role === 'boss' && p.alive)
          set({
            sport: { ...s.sport, skill: clampStat(s.sport.skill + gain) },
            athletics: gainStat(s.athletics, randomInt(1, 2)),
            stats: { ...s.stats, health: clampStat(s.stats.health + randomInt(1, 3)) },
          })
          if (coach)
            updatePerson(coach.id, {
              relationship: clampRelationship(coach.relationship + randomInt(2, 5)),
            })
          playSfx('gym')
          addLog([
            { text: `You put in extra training this year. Skill up ${gain}. 💪`, kind: 'career' },
          ])
        },

        askPlayingTime: () => {
          const s = get()
          if (!s.alive || !s.sport) return
          const coach = s.relationships.find((p) => p.role === 'boss' && p.alive)
          if (!useYearlyAction('playing-time')) return
          const chance = 0.4 + (coach ? coach.relationship / 200 : 0)
          if (Math.random() < chance) {
            const gain = randomInt(2, 4)
            set({ sport: { ...s.sport, skill: clampStat(s.sport.skill + gain) } })
            playSfx('success')
            addLog([
              { text: 'The coach gave you more minutes on the court. Your game sharpened.', kind: 'career' },
            ])
          } else {
            playSfx('fail')
            addLog([{ text: 'The coach told you to earn it in practice first.', kind: 'career' }])
          }
        },

        requestTrade: () => {
          const s = get()
          if (!s.alive || !s.sport) return
          // Trades stay within your current league.
          const league = getTeam(s.sport.teamId)?.league
          if (!league) return
          if (!useYearlyAction('request-trade')) return
          const others = league.teams.filter((t) => t.id !== s.sport!.teamId)
          if (others.length === 0) return
          if (Math.random() < 0.7) {
            const team = pick(others)
            // A trade shakes up the locker room — new teammates and coach.
            const crew = rollWorkplacePeople(s.countryCode, s.age, s.nextFriendId)
            set({
              sport: { ...s.sport, teamId: team.id, wins: 0, losses: 0 },
              relationships: [...withoutWorkPeople(s.relationships), ...crew],
              nextFriendId: s.nextFriendId + crew.length,
            })
            playSfx('whoosh')
            addLog([{ text: `You were traded to the ${team.name}! Fresh start. 🔁`, kind: 'career' }])
          } else {
            playSfx('fail')
            addLog([{ text: 'You asked for a trade, but the front office said no.', kind: 'career' }])
          }
        },

        workHarder: () => {
          const s = get()
          const boss = s.relationships.find((p) => p.role === 'boss' && p.alive)
          if (!s.alive || !s.jobId) return
          if (!useYearlyAction('work-harder')) return
          if (boss) {
            updatePerson(boss.id, {
              relationship: clampRelationship(boss.relationship + randomInt(4, 9)),
            })
          }
          set({
            stats: { ...get().stats, health: clampStat(get().stats.health - randomInt(0, 2)) },
          })
          addLog([
            { text: 'You put in serious extra effort at work this year. The boss noticed.', kind: 'career' },
          ])
        },

        askForRaise: () => {
          const s = get()
          const job = getJob(s.jobId)
          const boss = s.relationships.find((p) => p.role === 'boss' && p.alive)
          if (!s.alive || !job) return
          if (s.raisePercent >= MAX_RAISE_PERCENT) return
          if (!useYearlyAction('raise')) return
          const chance = 0.15 + (boss ? boss.relationship / 140 : 0.2)
          if (Math.random() < chance) {
            const bump = randomInt(5, 12)
            set({ raisePercent: Math.min(MAX_RAISE_PERCENT, s.raisePercent + bump) })
            playSfx('levelup')
            addLog([
              { text: `Your raise request was approved — salary up ${bump}%! 💸`, kind: 'career' },
            ])
          } else {
            if (boss) {
              updatePerson(boss.id, {
                relationship: clampRelationship(boss.relationship - randomInt(1, 4)),
              })
            }
            addLog([
              { text: `"Not this year," said the boss, not looking up from their desk.`, kind: 'career' },
            ])
          }
        },

        openUniversityApplication: () => {
          if (canApplyToUniversity()) set({ applyingToUniversity: true })
        },

        cancelUniversityApplication: () => {
          set({ applyingToUniversity: false })
        },

        applyToUniversity: (majorId: string) => {
          const major = getMajor(majorId)
          if (!major || !canApplyToUniversity()) return
          set({ applyingToUniversity: false })
          const s = get()
          if (s.stats.smarts < major.minSmarts) {
            addLog([
              {
                text: `${major.name} rejected your application — they want ${major.minSmarts}+ smarts. Hit the books.`,
                kind: 'career',
              },
            ])
            return
          }
          const schoolName = schoolNameFor(s.countryCode, 'university')
          const campus = rollSchoolPeople(s.countryCode, 'university', s.age, s.nextFriendId)
          set({
            inUniversity: true,
            uniYearsLeft: UNIVERSITY_YEARS,
            major: majorId,
            schoolName,
            relationships: [
              ...s.relationships.filter((p) => p.role !== 'classmate' && p.role !== 'teacher'),
              ...campus,
            ],
            nextFriendId: s.nextFriendId + campus.length,
          })
          addLog([
            {
              text: `You got into ${schoolName}, majoring in ${major.name} ${major.emoji}! Tuition is $${tuitionPerYear(s.countryCode).toLocaleString()}/year for ${UNIVERSITY_YEARS} years.`,
              kind: 'career',
            },
          ])
        },

        // ----- Relationships -----

        spendTime: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (!useYearlyAction(`time-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(4, 10)),
          })
          set({ stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 2) } })
          addLog([{ text: `You spent quality time with ${person.name}.`, kind: 'relationship' }])
        },

        giveGift: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || s.money < GIFT_COST) return
          if (!useYearlyAction(`gift-${personId}`)) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(6, 12)),
          })
          set({ money: s.money - GIFT_COST })
          addLog([{ text: `You gave ${person.name} a thoughtful gift.`, kind: 'relationship' }])
        },

        askForMoney: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (person.role !== 'mother' && person.role !== 'father') return
          if (s.age >= 18) return
          if (!useYearlyAction(`ask-money-${personId}`)) return
          if (person.relationship >= 40) {
            const amount = scaleByCountry(randomInt(20, 100), s.countryCode)
            set({ money: s.money + amount })
            playSfx('cash')
            addLog([
              { text: `You asked ${person.name} for pocket money and got $${amount.toLocaleString()}.`, kind: 'relationship' },
            ])
          } else {
            addLog([
              { text: `${person.name} said money doesn't grow on trees. Request denied.`, kind: 'relationship' },
            ])
          }
        },

        askForPhone: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (person.role !== 'mother' && person.role !== 'father') return
          if (s.age >= 18) return
          if (s.ownedAssetIds.some((id) => getAsset(id)?.category === 'phone')) return
          if (!useYearlyAction(`ask-phone-${personId}`)) return
          // A good bond and being at least a pre-teen wins them over.
          if (person.relationship >= 55 && s.age >= 10) {
            const phones = phonesForYear(s.year)
            const phone = phones[phones.length - 1]
            if (phone) {
              set({ ownedAssetIds: [...s.ownedAssetIds, phone.id] })
              playSfx('success')
              addLog([
                { text: `${person.name} caved and bought you a ${phone.name}! 📱`, kind: 'relationship' },
              ])
              return
            }
          }
          playSfx('fail')
          addLog([
            {
              text:
                s.age < 10
                  ? `${person.name} said you're too young for a phone. Maybe later.`
                  : `${person.name} said not yet — earn it first.`,
              kind: 'relationship',
            },
          ])
        },

        goOnDate: () => {
          const s = get()
          const partner = s.relationships.find((p) => p.id === 'partner')
          if (!partner?.alive || !s.alive || s.money < DATE_COST) return
          if (!useYearlyAction('date')) return
          updatePerson('partner', {
            relationship: clampRelationship(partner.relationship + randomInt(5, 11)),
          })
          set({
            money: get().money - DATE_COST,
            stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 4) },
          })
          addLog([{ text: `You took ${partner.name} on a lovely date.`, kind: 'relationship' }])
        },

        makeFriend: () => {
          const s = get()
          if (!s.alive || s.age < 5) return
          const friends = s.relationships.filter((p) => p.role === 'friend' && p.alive)
          if (friends.length >= MAX_FRIENDS) return
          if (!useYearlyAction('make-friend')) return
          if (Math.random() < 0.8) {
            const friend = rollNewFriend(randomInt(-3, 3))
            set({
              relationships: [...get().relationships, friend],
              nextFriendId: get().nextFriendId + 1,
            })
            addLog([{ text: `You made a new friend: ${friend.name}!`, kind: 'relationship' }])
          } else {
            addLog([
              { text: 'You tried to make a new friend, but the small talk fizzled out.', kind: 'relationship' },
            ])
          }
        },

        beginRelationship: (name: string, gender: Gender, age: number) => {
          const s = get()
          if (!s.alive || s.age < 18 || s.relationships.some((p) => p.id === 'partner' && p.alive))
            return
          const partner: Person = {
            id: 'partner',
            role: 'partner',
            gender,
            name,
            age: Math.max(18, age),
            alive: true,
            relationship: randomInt(35, 55),
            ...makeNpcLife(),
          }
          set({
            // Drop any lingering deceased partner so the slot is unique.
            relationships: [...s.relationships.filter((p) => p.id !== 'partner'), partner],
            partnerStatus: 'dating',
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 4) },
          })
          playSfx('match')
          addLog([
            { text: `You matched with ${name} on Cinder and started dating. 🔥`, kind: 'relationship' },
          ])
        },

        // ----- Phone: social media -----

        socialPost: (app: SocialApp) => {
          const s = get()
          if (!s.alive) return
          // OnlyStans is strictly adults-only.
          if (app === 'onlystans' && s.age < 18) return
          if (!useYearlyAction(`post-${app}`)) return
          const meta = SOCIAL_APPS[app]
          // Looks and existing reach help; there's a small viral jackpot.
          const roll = Math.random()
          let gained: number
          let flop = false
          if (roll < 0.08) {
            // Viral: a huge spike, bigger the more looks you have.
            gained = randomInt(2000, 20000) + Math.round(s.stats.looks * 200)
          } else if (roll < 0.2) {
            // Flop: it barely lands, you even shed a few followers.
            gained = -randomInt(0, 30)
            flop = true
          } else if (app === 'onlystans') {
            // Subscribers come almost entirely from looks — beauty is the product.
            const base = randomInt(5, 40) + Math.round(s.stats.looks * 1.5)
            gained = base + Math.round(s.followers[app] * 0.03)
          } else {
            // Normal growth, nudged by looks and your current audience.
            const base = randomInt(10, 120) + Math.round(s.stats.looks / 2)
            gained = base + Math.round(s.followers[app] * 0.02)
          }
          const next = Math.max(0, s.followers[app] + gained)
          set({
            followers: { ...s.followers, [app]: next },
            stats: {
              ...s.stats,
              happiness: clampStat(s.stats.happiness + (flop ? -1 : gained > 1000 ? 5 : 2)),
            },
          })
          playSfx(flop ? 'fail' : gained > 1000 ? 'levelup' : 'success')
          addLog([
            {
              text: flop
                ? `Your ${meta.name} post flopped. The algorithm was not kind.`
                : gained > 1000
                  ? `Your ${meta.name} post went viral! +${gained.toLocaleString()} followers. 🚀`
                  : `You posted on ${meta.name} and gained ${gained.toLocaleString()} followers.`,
              kind: 'relationship',
            },
          ])
        },

        monetizeSocial: (app: SocialApp) => {
          const s = get()
          if (!s.alive) return
          if (app === 'onlystans' && s.age < 18) return
          const count = s.followers[app]
          const isSubs = app === 'onlystans'
          if (count < (isSubs ? ONLYSTANS_MIN_SUBS : MONETIZE_MIN_FOLLOWERS)) return
          if (!useYearlyAction(`monetize-${app}`)) return
          const meta = SOCIAL_APPS[app]
          // Brand deals pay ~$2–5 per hundred followers; OnlyStans subscribers
          // pay real money each — far fewer of them go a lot further.
          const gross = isSubs
            ? Math.round(count * (randomInt(40, 80) / 100))
            : Math.round(count * (randomInt(2, 5) / 100))
          const payout = scaleByCountry(gross, s.countryCode)
          set({
            money: s.money + payout,
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 3) },
          })
          playSfx('cash')
          addLog([
            {
              text: isSubs
                ? `Your OnlyStans subscriptions paid out $${payout.toLocaleString()}. 💎`
                : `You cashed in your ${meta.name} following for $${payout.toLocaleString()} in brand deals. 💰`,
              kind: 'money',
            },
          ])
        },

        propose: () => {
          const s = get()
          const partner = s.relationships.find((p) => p.id === 'partner')
          if (
            !s.alive ||
            !partner?.alive ||
            s.partnerStatus !== 'dating' ||
            partner.relationship < PROPOSAL_MIN_RELATIONSHIP
          ) {
            return
          }
          set({
            partnerStatus: 'engaged',
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 10) },
          })
          addLog([{ text: `${partner.name} said yes! You're engaged. 💍`, kind: 'relationship' }])
        },

        marry: () => {
          const s = get()
          const partner = s.relationships.find((p) => p.id === 'partner')
          if (!s.alive || !partner?.alive || s.partnerStatus !== 'engaged' || s.money < WEDDING_COST) {
            return
          }
          updatePerson('partner', {
            relationship: clampRelationship(partner.relationship + 10),
          })
          set({
            partnerStatus: 'married',
            money: get().money - WEDDING_COST,
            stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 15) },
          })
          playSfx('wedding')
          addLog([{ text: `You married ${partner.name}! 💒`, kind: 'relationship' }])
        },

        breakUp: () => {
          const s = get()
          const partner = s.relationships.find((p) => p.id === 'partner')
          if (!s.alive || !partner) return
          const divorced = s.partnerStatus === 'married'
          // The partner sticks around as an ex you can still reach out to.
          const exId = `ex-${s.nextFriendId}`
          set({
            relationships: s.relationships.map((p) =>
              p.id === 'partner'
                ? { ...p, id: exId, role: 'ex', relationship: clampRelationship(p.relationship - 20) }
                : p,
            ),
            nextFriendId: s.nextFriendId + 1,
            partnerStatus: null,
            money: divorced ? Math.floor(s.money / 2) : s.money,
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness - 10) },
          })
          playSfx('heartbreak')
          addLog([
            divorced
              ? { text: `You divorced ${partner.name}. They took half of everything.`, kind: 'relationship' }
              : { text: `You broke up with ${partner.name}.`, kind: 'relationship' },
          ])
        },

        tryForBaby: () => {
          const s = get()
          const partner = s.relationships.find((p) => p.id === 'partner' && p.alive)
          if (!s.alive || !partner || s.age < 18 || partner.age < 18) return
          // A pregnancy needs the woman of the couple to be 18–55; the man's
          // age doesn't matter. (Same-gender couples can't conceive here.)
          const womanAge = s.gender === 'female' ? s.age : partner.gender === 'female' ? partner.age : null
          if (womanAge === null || womanAge > 55) return
          const kids = s.relationships.filter((p) => p.role === 'child')
          if (kids.length >= 8) return
          if (!useYearlyAction('try-baby')) return
          const chance = s.partnerStatus === 'married' ? 0.65 : 0.4
          if (Math.random() < chance) {
            const gender = randomGender()
            const lastName = s.name.split(' ').slice(-1)[0] ?? ''
            const baby: Person = {
              id: `child-${s.nextFriendId}`,
              role: 'child',
              gender,
              name: `${randomFirstName(s.countryCode, gender)} ${lastName}`.trim(),
              age: 0,
              alive: true,
              relationship: randomInt(80, 100),
              // The career they'll grow into, revealed once they're an adult.
              ...makeNpcLife(),
            }
            set({
              relationships: [...s.relationships, baby],
              nextFriendId: s.nextFriendId + 1,
              stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 8) },
            })
            playSfx('baby')
            addLog([
              { text: `You had a baby${partner ? ` with ${partner.name}` : ''}! Welcome ${baby.name}. 👶`, kind: 'relationship' },
            ])
          } else {
            playSfx('fail')
            addLog([{ text: 'You tried for a baby this year, but it wasn’t meant to be.', kind: 'relationship' }])
          }
        },

        // ----- Lineage: continue the bloodline through your child -----

        continueAsChild: (childId: string) => {
          const s = get()
          if (s.alive) return
          const heir = s.relationships.find((p) => p.id === childId && p.role === 'child' && p.alive)
          if (!heir) return

          // Estate split evenly among living children; the heir keeps a share.
          // A 10% inheritance tax is skimmed off the cash each time the family
          // hands down its wealth.
          const ESTATE_TAX = 0.1
          const livingKids = s.relationships.filter((p) => p.role === 'child' && p.alive)
          const grossShare = s.money > 0 ? Math.floor(s.money / livingKids.length) : 0
          const estateTax = Math.round(grossShare * ESTATE_TAX)
          const inheritance = grossShare - estateTax
          // The heir also inherits the family's real estate (homes + residence).
          const inheritedHomes = s.homes
          const inheritedResidenceId = s.residenceId

          const ancestor: Ancestor = {
            name: s.name,
            gender: s.gender,
            bornYear: s.year - s.age,
            diedYear: s.year,
            ageAtDeath: s.age,
            generation: s.generation,
          }

          // The heir's new family: surviving partner becomes a parent, the
          // deceased you becomes the other (late) parent, siblings are your
          // other kids. Everyone else moves on.
          const rebuilt: Person[] = []
          const partner = s.relationships.find((p) => p.id === 'partner' && p.alive)
          const youRole: PersonRole = s.gender === 'male' ? 'father' : 'mother'
          if (partner) {
            rebuilt.push({
              ...partner,
              id: partner.gender === 'male' ? 'father' : 'mother',
              role: partner.gender === 'male' ? 'father' : 'mother',
            })
          }
          rebuilt.push({
            id: youRole,
            role: youRole,
            gender: s.gender,
            name: s.name,
            age: s.age,
            alive: false,
            relationship: 100,
          })
          let nextFriendId = s.nextFriendId
          for (const kid of livingKids) {
            if (kid === heir) continue
            rebuilt.push({ ...kid, id: `sibling-${nextFriendId++}`, role: 'sibling' })
          }

          const heirGender = heir.gender
          const stage = schoolStageFor(heir.age, false)
          let schoolName: string | null = null
          if (stage && stage !== 'university') {
            schoolName = schoolNameFor(s.countryCode, stage)
            const classroom = rollSchoolPeople(s.countryCode, stage, heir.age, nextFriendId)
            nextFriendId += classroom.length
            rebuilt.push(...classroom)
          }

          // A grown heir already has the life they built: their career (and the
          // degree it needed), promotions to match their age, and a workplace.
          let heirJobId: string | null = null
          let heirTier = 0
          let heirYears = 0
          let heirDegree = false
          let heirMajor: string | null = null
          if (heir.age >= 22) {
            const heirJob = jobForCareer(heir.career)
            if (heirJob) {
              heirJobId = heirJob.id
              heirDegree = !!(heirJob.requiresDegree || heirJob.requiredMajor)
              heirMajor = heirJob.requiredMajor ?? null
              const maxTier = (heirJob.tiers?.length ?? 1) - 1
              heirYears = Math.max(0, heir.age - 22)
              heirTier = Math.min(maxTier, Math.floor(heirYears / YEARS_PER_PROMOTION))
              const crew = rollWorkplacePeople(s.countryCode, heir.age, nextFriendId)
              nextFriendId += crew.length
              rebuilt.push(...crew)
            } else if (heir.age >= 22) {
              // Grown but no matching career → assume they finished school/uni.
              heirDegree = Math.random() < 0.5
            }
          }
          const heirJob = getJob(heirJobId)

          // The heir has been living their own life all along: give them friends,
          // maybe a partner, and — depending on their age — kids of their own, so
          // the world isn't empty when you take over.
          let heirPartnerStatus: PartnerStatus | null = null
          const heirLast = heir.name.split(' ').slice(-1)[0] ?? ''
          const oppGender: Gender = heirGender === 'male' ? 'female' : 'male'
          const friendCount = heir.age >= 14 ? randomInt(1, 3) : randomInt(0, 2)
          for (let i = 0; i < friendCount; i++) {
            const g: Gender = Math.random() < 0.7 ? heirGender : oppGender
            rebuilt.push({
              id: `friend-${nextFriendId++}`,
              role: 'friend',
              gender: g,
              name: `${randomFirstName(s.countryCode, g)} ${randomLastName(s.countryCode)}`,
              age: Math.max(6, heir.age + randomInt(-3, 3)),
              alive: true,
              relationship: randomInt(45, 80),
              ...makeNpcLife(),
            })
          }
          let heirHasPartner = false
          if (heir.age >= 20 && Math.random() < (heir.age >= 26 ? 0.62 : 0.4)) {
            heirHasPartner = true
            heirPartnerStatus =
              heir.age >= 30 ? 'married' : heir.age >= 25 ? (Math.random() < 0.5 ? 'married' : 'engaged') : 'dating'
            rebuilt.push({
              id: 'partner',
              role: 'partner',
              gender: oppGender,
              name: `${randomFirstName(s.countryCode, oppGender)} ${randomLastName(s.countryCode)}`,
              age: Math.max(18, heir.age + randomInt(-4, 4)),
              alive: true,
              relationship: randomInt(60, 90),
              ...makeNpcLife(),
            })
          }
          // Their own children (they had to be an adult to have them).
          if (heirHasPartner && heir.age >= 24) {
            const maxKids = heir.age >= 40 ? 3 : heir.age >= 32 ? 2 : 1
            const kidCount = randomInt(0, maxKids)
            for (let i = 0; i < kidCount; i++) {
              const g = randomGender()
              const kidAge = randomInt(0, Math.max(0, heir.age - 20))
              rebuilt.push({
                id: `child-${nextFriendId++}`,
                role: 'child',
                gender: g,
                name: `${randomFirstName(s.countryCode, g)} ${heirLast}`.trim(),
                age: kidAge,
                alive: true,
                relationship: randomInt(70, 95),
                ...makeNpcLife(),
              })
            }
          }

          // Raw setter: a young heir's inherited balance is a fresh start, not
          // spending, so the child money-guard must not clamp it.
          baseSet({
            ...newLifeState(),
            screen: 'life',
            name: heir.name,
            gender: heirGender,
            avatarConfig: { ...randomAvatarConfig(heirGender), skinColor: s.avatarConfig.skinColor },
            countryCode: s.countryCode,
            age: heir.age,
            year: s.year,
            stats: rollStats(),
            money: inheritance,
            homes: inheritedHomes,
            residenceId: inheritedResidenceId,
            relationships: rebuilt,
            partnerStatus: heirPartnerStatus,
            nextFriendId,
            schoolName,
            jobId: heirJobId,
            jobTier: heirTier,
            yearsInJob: heirYears,
            hasDegree: heirDegree,
            major: heirMajor,
            jobOpenings: rollJobOpenings(heirMajor, heirDegree),
            ancestors: [...s.ancestors, ancestor],
            generation: s.generation + 1,
            alive: true,
            log: [
              {
                id: 0,
                age: heir.age,
                year: s.year,
                text:
                  `You continue the family story as ${heir.name}, generation ${s.generation + 1}.` +
                  (heirJob ? ` You're a ${jobTitle(heirJob, heirTier)} ${heirJob.emoji}.` : '') +
                  (inheritance > 0
                    ? ` You inherited $${inheritance.toLocaleString()} after a $${estateTax.toLocaleString()} estate tax.`
                    : '') +
                  (inheritedHomes.length > 0
                    ? ` You also inherited ${inheritedHomes.length} propert${inheritedHomes.length === 1 ? 'y' : 'ies'}. 🏠`
                    : ''),
                kind: 'info',
              },
            ],
            nextLogId: 1,
          })
          playSfx('baby')
        },
      }
    },
    {
      name: 'simlife-save',
      version: 33,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        hasHydrated: _hasHydrated,
        toast: _toast,
        modalNonce: _modalNonce,
        deepLink: _deepLink,
        ...rest
      }) =>
        rest,
      onRehydrateStorage: () => () => {
        useGameStore.setState({ hasHydrated: true })
      },
      migrate: (persisted, version) => {
        const state = persisted as Partial<GameState> & { age?: number; name?: string }
        // v0 saves predate the character creation screen: they were mid-life.
        if (version < 1) state.screen = 'life'
        // v1 saves predate careers and relationships.
        if (version < 2) {
          state.jobId = null
          state.hasDegree = false
          state.inUniversity = false
          state.uniYearsLeft = 0
          state.partnerStatus = null
          const age = state.age ?? 0
          const lastName = state.name?.split(' ').slice(-1)[0] ?? ''
          state.relationships = (['mother', 'father'] as const).map((role) => ({
            id: role,
            role,
            gender: (role === 'mother' ? 'female' : 'male') as Gender,
            name: `${randomFirstName('US', role === 'mother' ? 'female' : 'male')} ${lastName}`.trim(),
            age: age + randomInt(22, 40),
            alive: true,
            relationship: randomInt(55, 85),
          }))
        }
        // v2 saves predate friends, yearly actions, and settings.
        if (version < 3) {
          state.usedActions = []
          state.nextFriendId = 1
          state.sfxVolume = 1
        }
        // v3 saves predate majors and rotating job openings.
        if (version < 4) {
          state.major = state.hasDegree || state.inUniversity ? 'business' : null
          state.applyingToUniversity = false
          // Keep an existing major-locked job valid by aligning the major.
          const job = JOBS.find((j) => j.id === state.jobId)
          if (job?.requiredMajor) state.major = job.requiredMajor
          state.jobOpenings = rollJobOpenings(state.major ?? null, !!state.hasDegree)
        }
        // v4 saves predate countries.
        if (version < 5) {
          state.countryCode = 'US'
        }
        // v5 saves predate gender.
        if (version < 6) {
          const playerGender = randomGender()
          state.gender = playerGender
          state.relationships = (state.relationships ?? []).map((p) => {
            if (p.gender) return p
            const gender: Gender =
              p.role === 'mother'
                ? 'female'
                : p.role === 'father'
                  ? 'male'
                  : p.role === 'partner'
                    ? playerGender === 'male'
                      ? 'female'
                      : 'male'
                    : randomGender()
            return { ...p, gender }
          })
        }
        // v6 saves predate school names and classrooms.
        if (version < 7) {
          state.schoolName = null
          const stage = schoolStageFor(state.age ?? 0, !!state.inUniversity)
          if (stage) {
            const country = state.countryCode ?? 'US'
            state.schoolName = schoolNameFor(country, stage)
            const people = rollSchoolPeople(
              country,
              stage,
              state.age ?? 10,
              state.nextFriendId ?? 1,
            )
            state.relationships = [...(state.relationships ?? []), ...people]
            state.nextFriendId = (state.nextFriendId ?? 1) + people.length
          }
        }
        // v7 saves predate workplaces and raises.
        if (version < 8) {
          state.raisePercent = 0
          if (state.jobId) {
            const crew = rollWorkplacePeople(
              state.countryCode ?? 'US',
              state.age ?? 25,
              state.nextFriendId ?? 1,
            )
            state.relationships = [...(state.relationships ?? []), ...crew]
            state.nextFriendId = (state.nextFriendId ?? 1) + crew.length
          }
        }
        // v8 saves predate belongings.
        if (version < 9) {
          state.ownedAssetIds = []
        }
        // v9 saves predate job tiers and the debt/expenses economy.
        if (version < 10) {
          state.jobTier = 0
          state.yearsInJob = 0
        }
        // v10 saves predate the parents-divorce flag.
        if (version < 11) {
          state.parentsDivorced = false
        }
        // v11 saves predate the pursuits/crime activities overhaul.
        if (version < 12) {
          state.pursuits = { sport: null, mind: null, hobby: null }
          state.criminalRecord = false
        }
        // v12 saves predate the phone / social media follower counts.
        if (version < 13) {
          state.followers = { rizzgram: 0, flicktok: 0, youtube: 0, onlystans: 0 }
        }
        // v13 saves predate customizable avatars.
        if (version < 14) {
          state.avatarConfig = randomAvatarConfig(state.gender ?? 'male')
        }
        // v14 saves predate pro-sports leagues.
        if (version < 15) {
          state.sport = null
        }
        // v15 saves predate the dark-mode setting.
        if (version < 16) {
          state.theme = 'light'
        }
        // v16 saves predate kids/inheritance/lineage.
        if (version < 17) {
          state.ancestors = []
          state.generation = 1
        }
        // v17 saves predate pets.
        if (version < 18) {
          state.pets = []
          state.nextPetId = 1
        }
        // v18 saves predate the prison/justice system.
        if (version < 19) {
          state.prison = null
          state.timesArrested = 0
        }
        // v19 saves predate the hidden athletics stat and school sports.
        if (version < 20) {
          state.athletics = randomInt(25, 55)
          state.schoolSport = null
        }
        // v21 saves predate the Midnight Indigo redesign (dark by default).
        if (version < 22) {
          state.theme = 'dark'
        }
        // v23 saves predate retirement pensions.
        if (version < 24) {
          state.pension = 0
        }
        // v24 saves predate the residence flag.
        if (version < 25) {
          delete (state as Record<string, unknown>).properties
          delete (state as Record<string, unknown>).rentalListings
        }
        // v25 saves kept houses in ownedAssetIds; move them into their own
        // `homes` list, generate a rotating market, and pick a residence.
        if (version < 26) {
          const homeAssets = (state.ownedAssetIds ?? [])
            .map((id) => getAsset(id))
            .filter((a): a is NonNullable<typeof a> => !!a && a.category === 'home')
          state.homes = homeAssets.map((a) => ({
            id: a.id,
            name: a.name,
            emoji: a.emoji,
            price: a.price,
            size: a.size ?? 3,
            boughtYear: state.year ?? START_YEAR_BASE,
          }))
          state.ownedAssetIds = (state.ownedAssetIds ?? []).filter((id) => {
            const a = getAsset(id)
            return !a || a.category !== 'home'
          })
          const priciest = [...state.homes].sort((a, b) => b.price - a.price)[0]
          state.residenceId = priciest?.id ?? null
          state.homeListings = rollHomeListings(state.countryCode ?? 'US')
        }
        // v22 saves predate the 5th stat (formerly Fame, now Stress).
        if (version < 23) {
          state.stats = { ...(state.stats as Stats), stress: 20 }
        }
        // v20 saves predate NPCs having their own careers and hobbies.
        if (version < 21) {
          state.relationships = (state.relationships ?? []).map((p) =>
            p.career
              ? p
              : {
                  ...p,
                  ...makeNpcLife(),
                  ...(p.role === 'teacher' ? { career: 'Teacher' } : {}),
                  ...(p.role === 'boss' ? { career: 'Manager' } : {}),
                },
          )
        }
        // v26 saves predate the Streamly (YouTube) app — backfill its count.
        if (version < 27) {
          state.followers = {
            rizzgram: 0,
            flicktok: 0,
            youtube: 0,
            ...(state.followers ?? {}),
          } as Record<SocialApp, number>
        }
        // v27 saves predate the illness system.
        if (version < 28) {
          state.conditions = []
        }
        // v28 saves had a Fame stat; it's replaced by Stress.
        if (version < 29) {
          const st = state.stats as (Stats & { fame?: number }) | undefined
          if (st) {
            delete st.fame
            if (typeof st.stress !== 'number') st.stress = 20
          }
        }
        // v29 saves predate the eyebrow avatar option.
        if (version < 30) {
          const av = state.avatarConfig as (AvatarConfig & { eyebrows?: string }) | undefined
          if (av && !av.eyebrows) av.eyebrows = 'defaultNatural'
        }
        // v30 saves predate the investing app.
        if (version < 31) {
          state.investPrices = initialInvestPrices()
          state.investments = {}
        }
        // v31 saves predate the OnlyStans app.
        if (version < 32) {
          state.followers = {
            rizzgram: 0,
            flicktok: 0,
            youtube: 0,
            onlystans: 0,
            ...(state.followers ?? {}),
          } as Record<SocialApp, number>
        }
        // v32 saves predate the consumable Messages catalogue.
        if (version < 33) {
          state.usedTexts = []
        }
        return state as GameState
      },
    },
  ),
)
