import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { playSfx } from '../audio/sfx'
import type { ThemeName } from '../theme'
import { randomAvatarConfig, type AvatarConfig } from '../data/avatar'
import type {
  Ancestor,
  ActivePursuit,
  ActivityCategory,
  GameEvent,
  Gender,
  Job,
  LogEntry,
  PartnerStatus,
  Person,
  PersonRole,
  Pet,
  SocialApp,
  SportState,
  Stats,
} from '../types'
import { PET_NAMES, getPetOption } from '../data/pets'
import { LEAGUES, getTeam, jobSport, leagueForJob } from '../data/leagues'
import { LANGUAGES, getActivity, getCrime } from '../data/activities'
import { getAsset, resaleValue } from '../data/assets'
import { COUNTRIES, countrySalary, getCountry, scaleByCountry } from '../data/countries'
import {
  DEBT_INTEREST,
  EXPENSES_START_AGE,
  YEARS_PER_PROMOTION,
  assetUpkeep,
  friendCost,
  partnerCost,
  personalExpenses,
  tierMultiplier,
  tuitionPerYear,
} from '../data/economy'
import { EVENTS } from '../data/events'
import { JOBS } from '../data/jobs'
import { getMajor } from '../data/majors'
import { randomFirstName, randomGender, randomLastName } from '../data/names'
import { schoolNameFor, schoolStageFor, teacherName, type SchoolStage } from '../data/schools'
import { DIVORCE_EVENT, GRADUATION_EVENT, languageCompleteEvent } from '../data/specialEvents'
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

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function clampRelationship(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function rollStats(): Stats {
  return {
    health: randomInt(60, 100),
    happiness: randomInt(50, 100),
    smarts: randomInt(30, 100),
    looks: randomInt(30, 100),
  }
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
    },
    {
      id: 'father',
      role: 'father',
      gender: 'male',
      name: `${randomFirstName(countryCode, 'male')} ${familyLastName}`,
      age: randomInt(22, 42),
      alive: true,
      relationship: randomInt(70, 95),
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
    })
  }
  return family
}

export function getJob(jobId: string | null): Job | null {
  return jobId ? (JOBS.find((j) => j.id === jobId) ?? null) : null
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
  who: { age: number; smarts: number; hasDegree: boolean; major: string | null },
): string | null {
  if (job.requiredMajor && who.major !== job.requiredMajor)
    return `${getMajor(job.requiredMajor)?.name ?? job.requiredMajor} degree required`
  if (job.requiresDegree && !who.hasDegree) return 'university degree required'
  // Degree jobs skip the age gate (you've already earned the degree);
  // everyone else must be old enough.
  const needsDegree = !!job.requiredMajor || !!job.requiresDegree
  if (!needsDegree && who.age < job.minAge) return `age ${job.minAge}+`
  if (who.smarts < job.minSmarts) return `${job.minSmarts} smarts required`
  return null
}

/** True while the character is in mandatory schooling. */
export function isInSchool(age: number): boolean {
  return age >= 6 && age < 18
}

const CLASSMATE_COUNT = 4
const TEACHER_COUNT = 2
const COWORKER_COUNT = 3
export const MAX_RAISE_PERCENT = 50
export const MOVIE_COST = 20
export const LUNCH_COST = 15
export const GETAWAY_COST = 300

/** The two social platforms you can post to once you own a phone. */
export const SOCIAL_APPS: Record<SocialApp, { name: string; emoji: string; kind: string }> = {
  rizzgram: { name: 'Rizzgram', emoji: '📸', kind: 'photos' },
  flicktok: { name: 'FlickTok', emoji: '🎵', kind: 'short videos' },
}

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
  log: LogEntry[]
  currentEvent: GameEvent | null
  /** Events already shown this life, so the pool doesn't repeat early. */
  usedEventIds: string[]
  nextLogId: number
  /** True once the persisted save has been loaded from AsyncStorage. */
  hasHydrated: boolean
  /** Once-per-year action keys, cleared on every Age Up. */
  usedActions: string[]

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
  /** Pro sports career state (set when you join a basketball/football team). */
  sport: SportState | null
  hasDegree: boolean
  inUniversity: boolean
  uniYearsLeft: number
  /** The university major (see majors.ts); set when accepted. */
  major: string | null
  /** Current school's name, e.g. "Palm Street High School". */
  schoolName: string | null
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

  // Belongings
  ownedAssetIds: string[]

  // Pets
  pets: Pet[]
  nextPetId: number

  // Phone: social media follower counts per app.
  followers: Record<SocialApp, number>

  // Activities: one ongoing pursuit per category; crime is one-off.
  pursuits: Record<ActivityCategory, ActivePursuit | null>
  criminalRecord: boolean

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

  // School (once per year each)
  studyHarder: () => void

  // Person interactions (once per person per year)
  compliment: (personId: string) => void
  insult: (personId: string) => void
  askForAdvice: (personId: string) => void
  prankSibling: (personId: string) => void
  watchMovie: (personId: string) => void
  studyTogether: (personId: string) => void
  grabLunch: (personId: string) => void
  weekendGetaway: () => void
  askTeacherHelp: (personId: string) => void
  befriendClassmate: (personId: string) => void

  // Workplace
  workHarder: () => void
  askForRaise: () => void

  // Activities & belongings
  startPursuit: (activityId: string) => void
  stopPursuit: (category: ActivityCategory) => void
  commitCrime: (crimeId: string) => void
  buyAsset: (assetId: string) => void
  sellAsset: (assetId: string) => void

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
  goOnDate: () => void
  makeFriend: () => void
  findLove: () => void
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
    currentEvent: null,
    usedEventIds: [] as string[],
    nextLogId: 1,
    log: [] as LogEntry[],
    usedActions: [] as string[],
    jobId: null,
    jobTier: 0,
    yearsInJob: 0,
    raisePercent: 0,
    sport: null as SportState | null,
    hasDegree: false,
    inUniversity: false,
    uniYearsLeft: 0,
    major: null,
    schoolName: null,
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
    pets: [] as Pet[],
    nextPetId: 1,
    followers: { rizzgram: 0, flicktok: 0 } as Record<SocialApp, number>,
    pursuits: { sport: null, mind: null, hobby: null } as Record<
      ActivityCategory,
      ActivePursuit | null
    >,
    criminalRecord: false,
  }
}

/** Pick a random eligible event, avoiding repeats until the pool runs dry. */
function drawEvent(age: number, usedIds: string[]): GameEvent | null {
  const eligible = EVENTS.filter((e) => age >= e.minAge && age <= e.maxAge)
  if (eligible.length === 0) return null
  const fresh = eligible.filter((e) => !usedIds.includes(e.id))
  return pick(fresh.length > 0 ? fresh : eligible)
}

/** Chance of dying of old age this year; kicks in past 70. */
function oldAgeDeathRoll(age: number, health: number): boolean {
  if (age < 70) return false
  const risk = (age - 70) * 0.015 + (health < 30 ? 0.05 : 0)
  return Math.random() < risk
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
    (set, get) => {
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
        theme: 'light' as ThemeName,

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

          // Gentle wear and tear in later life.
          if (age > 50) {
            stats.health = clampStat(stats.health - randomInt(0, 2))
          }

          // Salary lands every year you hold a job (country + tier + raises).
          const job = getJob(s.jobId)
          let jobTier = s.jobTier
          let yearsInJob = s.yearsInJob
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

          // Pro sports season: record, championships, MVPs, injuries, bonuses.
          let sport = s.sport
          if (job && sport && jobSport(job.id)) {
            const res = simulateSeason(sport, age, stats.health, s.countryCode)
            sport = res.sport
            stats.health = clampStat(stats.health + res.healthDelta)
            money += res.moneyDelta
            for (const l of res.lines) entries.push({ id: logId++, age, year, ...l })
            if (res.sound) playSfx(res.sound)
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
              stats.smarts = clampStat(stats.smarts + 10)
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
          let partnerStatus = s.partnerStatus
          const agedRelationships = s.relationships.map((p) => {
            if (!p.alive) return p
            const pAge = p.age + 1
            if (familyDeathRoll(pAge)) {
              entries.push({
                id: logId++,
                age,
                year,
                text: `${p.name} passed away at age ${pAge}. 💔`,
                kind: 'death',
              })
              stats.happiness = clampStat(stats.happiness - 15)
              if (p.role === 'partner') partnerStatus = null
              return { ...p, age: pAge, alive: false }
            }
            return {
              ...p,
              age: pAge,
              relationship: clampRelationship(p.relationship - randomInt(0, 3)),
            }
          })
          // Old classmates and teachers move on when the stage changes.
          const relationships = [
            ...(stageChanged
              ? agedRelationships.filter((p) => p.role !== 'classmate' && p.role !== 'teacher')
              : agedRelationships),
            ...newSchoolPeople,
          ]

          // ----- Yearly cost of living (this is why you keep less than salary) -----
          // Personal expenses kick in once you're on your own.
          if (age >= EXPENSES_START_AGE) {
            const living = personalExpenses(s.countryCode)
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
          // Cars, homes, and luxuries need upkeep every year.
          for (const id of s.ownedAssetIds) {
            const asset = getAsset(id)
            if (asset) {
              const upkeep = assetUpkeep(asset.price, asset.category)
              money -= upkeep
              expenses += upkeep
            }
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
              stats[key] = clampStat(stats[key] + (deltas[key] ?? 0))
            }
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

          if (stats.health <= 0 || oldAgeDeathRoll(age, stats.health) || age >= MAX_AGE) {
            entries.push({
              id: logId++,
              age,
              year,
              text: `${s.name} passed away peacefully at age ${age}. What a life it was.`,
              kind: 'death',
            })
            set({
              age,
              year,
              stats,
              money,
              jobTier,
              yearsInJob,
              sport,
              hasDegree,
              inUniversity,
              uniYearsLeft,
              relationships,
              partnerStatus,
              schoolName,
              nextFriendId,
              pursuits,
              pets,
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
          const event =
            age === 18 && !hasDegree && !inUniversity
              ? GRADUATION_EVENT
              : pursuitPopEvent
                ? pursuitPopEvent
                : divorceRolls
                  ? DIVORCE_EVENT
                  : drawEvent(age, s.usedEventIds)
          set({
            age,
            year,
            stats,
            money,
            jobTier,
            yearsInJob,
            sport,
            hasDegree,
            inUniversity,
            uniYearsLeft,
            relationships,
            partnerStatus,
            schoolName,
            nextFriendId,
            pursuits,
            pets,
            currentEvent: event,
            usedEventIds:
              event && !event.id.startsWith('special-')
                ? [...s.usedEventIds, event.id]
                : s.usedEventIds,
            usedActions: [],
            jobOpenings: rollJobOpenings(s.major, hasDegree),
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
            stats[key] = clampStat(stats[key] + (statDeltas[key] ?? 0))
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
        },

        startNewLife: () => set(newLifeState()),

        // ----- School -----

        studyHarder: () => {
          const s = get()
          if (!s.alive || !(isInSchool(s.age) || s.inUniversity)) return
          if (!useYearlyAction('study')) return
          set({
            stats: {
              ...s.stats,
              smarts: clampStat(s.stats.smarts + randomInt(2, 5)),
              happiness: clampStat(s.stats.happiness - randomInt(0, 2)),
            },
          })
          addLog([{ text: 'You hit the books and studied extra hard this year.', kind: 'career' }])
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

        commitCrime: (crimeId: string) => {
          const s = get()
          const crime = getCrime(crimeId)
          if (!crime || !s.alive || s.age < crime.minAge) return
          if (!useYearlyAction(`crime-${crimeId}`)) return

          const stats = { ...s.stats }
          let money = s.money
          const apply = (e: typeof crime.success) => {
            const { money: m = 0, ...statDeltas } = e
            for (const key of Object.keys(statDeltas) as (keyof Stats)[]) {
              stats[key] = clampStat(stats[key] + (statDeltas[key] ?? 0))
            }
            money += m
          }

          const caught = Math.random() < crime.catchChance
          if (caught) {
            apply(crime.caught)
            set({ money, stats, criminalRecord: true })
            playSfx('police')
            addLog([
              { text: `You tried to ${crime.name.toLowerCase()} — and got caught. The law was not kind.`, kind: 'death' },
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
            stats: { ...get().stats, smarts: clampStat(get().stats.smarts + randomInt(1, 2)) },
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
            stats: { ...get().stats, smarts: clampStat(get().stats.smarts + randomInt(1, 2)) },
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
            stats: { ...get().stats, happiness: clampStat(get().stats.happiness + 8) },
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
            stats: { ...get().stats, smarts: clampStat(get().stats.smarts + randomInt(1, 3)) },
          })
          addLog([
            { text: `${person.name} stayed after class to help you. It actually made sense this time.`, kind: 'career' },
          ])
        },

        befriendClassmate: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || person.role !== 'classmate') return
          if (person.relationship < 60) return
          const friends = s.relationships.filter((p) => p.role === 'friend' && p.alive)
          if (friends.length >= MAX_FRIENDS) return
          updatePerson(personId, { role: 'friend' })
          addLog([
            { text: `You and ${person.name} are officially friends now. 🤝`, kind: 'relationship' },
          ])
        },

        // ----- Career -----

        applyForJob: (jobId: string) => {
          const s = get()
          const job = getJob(jobId)
          if (!job || !s.alive || s.screen !== 'life' || s.jobId === jobId) return
          if (!s.jobOpenings.includes(jobId)) return
          if (jobBlocker(job, { age: s.age, smarts: s.stats.smarts, hasDegree: s.hasDegree, major: s.major })) {
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

          const stat = job.auditionStat ? s.stats[job.auditionStat] : 50
          const min = job.auditionMin ?? 50
          // Better stats → better odds; there's always a slim/​capped chance.
          const chance = Math.max(0.05, Math.min(0.9, (stat - min) / 50 + 0.3))
          if (Math.random() < chance) {
            const crew = rollWorkplacePeople(s.countryCode, s.age, s.nextFriendId)
            // Sports careers draft you onto a random team in their league.
            const league = leagueForJob(jobId)
            let sport: SportState | null = null
            if (league) {
              const team = pick(league.teams)
              sport = {
                teamId: team.id,
                skill: clampStat(45 + Math.round((s.stats.health - 60) / 2) + randomInt(0, 10)),
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

        // ----- Pro sports -----

        trainAthlete: () => {
          const s = get()
          if (!s.alive || !s.sport) return
          if (!useYearlyAction('train-athlete')) return
          const gain = randomInt(2, 5)
          const coach = s.relationships.find((p) => p.role === 'boss' && p.alive)
          set({
            sport: { ...s.sport, skill: clampStat(s.sport.skill + gain) },
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
          const league = leagueForJob(s.jobId)
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
            const amount = randomInt(20, 100)
            set({ money: s.money + amount })
            playSfx('cash')
            addLog([
              { text: `You asked ${person.name} for pocket money and got $${amount}.`, kind: 'relationship' },
            ])
          } else {
            addLog([
              { text: `${person.name} said money doesn't grow on trees. Request denied.`, kind: 'relationship' },
            ])
          }
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

        findLove: () => {
          const s = get()
          if (!s.alive || s.age < 18 || s.relationships.some((p) => p.id === 'partner')) return
          if (Math.random() < 0.75) {
            // Heterosexual pairing for now; sexuality options come later.
            const gender = s.gender === 'male' ? 'female' : 'male'
            const partner: Person = {
              id: 'partner',
              role: 'partner',
              gender,
              name: `${randomFirstName(s.countryCode, gender)} ${randomLastName(s.countryCode)}`,
              age: Math.max(18, s.age + randomInt(-4, 4)),
              alive: true,
              relationship: randomInt(40, 65),
            }
            set({ relationships: [...s.relationships, partner], partnerStatus: 'dating' })
            playSfx('match')
            addLog([{ text: `You started dating ${partner.name}. 💕`, kind: 'relationship' }])
          } else {
            set({ stats: { ...s.stats, happiness: clampStat(s.stats.happiness - 2) } })
            playSfx('fail')
            addLog([
              { text: 'You put yourself out there, but love did not cooperate this year.', kind: 'relationship' },
            ])
          }
        },

        beginRelationship: (name: string, gender: Gender, age: number) => {
          const s = get()
          if (!s.alive || s.age < 18 || s.relationships.some((p) => p.id === 'partner')) return
          const partner: Person = {
            id: 'partner',
            role: 'partner',
            gender,
            name,
            age: Math.max(18, age),
            alive: true,
            relationship: randomInt(35, 55),
          }
          set({
            relationships: [...s.relationships, partner],
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
          const count = s.followers[app]
          if (count < MONETIZE_MIN_FOLLOWERS) return
          if (!useYearlyAction(`monetize-${app}`)) return
          const meta = SOCIAL_APPS[app]
          // Roughly $2–5 per hundred followers, country-scaled like other pay.
          const gross = Math.round(count * (randomInt(2, 5) / 100))
          const payout = scaleByCountry(gross, s.countryCode)
          set({
            money: s.money + payout,
            stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 3) },
          })
          playSfx('cash')
          addLog([
            {
              text: `You cashed in your ${meta.name} following for $${payout.toLocaleString()} in brand deals. 💰`,
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
          set({
            relationships: s.relationships.filter((p) => p.id !== 'partner'),
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
          if (!s.alive || !partner || s.age < 18 || s.age > 55) return
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
          const livingKids = s.relationships.filter((p) => p.role === 'child' && p.alive)
          const inheritance = s.money > 0 ? Math.floor(s.money / livingKids.length) : 0

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

          set({
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
            relationships: rebuilt,
            nextFriendId,
            schoolName,
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
                  (inheritance > 0 ? ` You inherited $${inheritance.toLocaleString()}.` : ''),
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
      version: 18,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
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
          state.followers = { rizzgram: 0, flicktok: 0 }
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
        return state as GameState
      },
    },
  ),
)
