import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  GameEvent,
  Gender,
  Job,
  LogEntry,
  PartnerStatus,
  Person,
  Stats,
} from '../types'
import { ACTIVITIES } from '../data/activities'
import { getAsset, resaleValue } from '../data/assets'
import { COUNTRIES, countrySalary, getCountry } from '../data/countries'
import { EVENTS } from '../data/events'
import { JOBS } from '../data/jobs'
import { getMajor } from '../data/majors'
import { randomFirstName, randomGender, randomLastName } from '../data/names'
import { schoolNameFor, schoolStageFor, teacherName, type SchoolStage } from '../data/schools'
import { GRADUATION_EVENT } from '../data/specialEvents'
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
  const rest = shuffle(JOBS.filter((j) => !picked.includes(j.id)))
  picked.push(...rest.slice(0, OPENINGS_PER_YEAR - picked.length).map((j) => j.id))
  return picked
}

/** Country-adjusted yearly salary for a job. */
export function jobSalary(job: Job, countryCode: string | null): number {
  return countrySalary(job.salary, countryCode)
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

  // Career
  jobId: string | null
  /** Accumulated raises as a percentage of base salary (0-50). */
  raisePercent: number
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

  // Belongings
  ownedAssetIds: string[]

  setSfxVolume: (volume: number) => void

  gender: Gender

  rerollStats: () => void
  startLife: (firstName: string, lastName: string, countryCode: string, gender: Gender) => void
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
  doActivity: (activityId: string) => void
  buyAsset: (assetId: string) => void
  sellAsset: (assetId: string) => void

  // Career
  applyForJob: (jobId: string) => void
  failInterview: (jobId: string) => void
  quitJob: () => void
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
    raisePercent: 0,
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
    ownedAssetIds: [] as string[],
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

        setSfxVolume: (volume: number) => {
          set({ sfxVolume: Math.max(0, Math.min(1, volume)) })
        },

        rerollStats: () => {
          if (get().screen !== 'creation') return
          set({ stats: rollStats() })
        },

        startLife: (firstName: string, lastName: string, countryCode: string, gender: Gender) => {
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

          // Salary lands every year you hold a job, scaled by country + raises.
          const job = getJob(s.jobId)
          if (job) {
            money += Math.round(jobSalary(job, s.countryCode) * (1 + s.raisePercent / 100))
          }

          // University: tuition drains yearly until graduation.
          let { hasDegree, inUniversity, uniYearsLeft } = s
          if (inUniversity) {
            money = Math.max(0, money - TUITION_PER_YEAR)
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
              hasDegree,
              inUniversity,
              uniYearsLeft,
              relationships,
              partnerStatus,
              schoolName,
              nextFriendId,
              alive: false,
              currentEvent: null,
              usedActions: [],
              log: [...s.log, ...entries],
              nextLogId: logId,
            })
            return
          }

          // At 18 the graduation decision pops instead of a random event.
          const event =
            age === 18 && !hasDegree && !inUniversity
              ? GRADUATION_EVENT
              : drawEvent(age, s.usedEventIds)
          set({
            age,
            year,
            stats,
            money,
            hasDegree,
            inUniversity,
            uniYearsLeft,
            relationships,
            partnerStatus,
            schoolName,
            nextFriendId,
            currentEvent: event,
            usedEventIds:
              event && event !== GRADUATION_EVENT
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
          const money = Math.max(0, s.money + moneyDelta)

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

          if (!died && choice.action === 'enrollUniversity' && canApplyToUniversity()) {
            set({ applyingToUniversity: true })
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

        doActivity: (activityId: string) => {
          const s = get()
          const activity = ACTIVITIES.find((a) => a.id === activityId)
          if (!activity || !s.alive || s.age < activity.minAge) return
          if (s.money < activity.cost) return
          if (!useYearlyAction(`activity-${activityId}`)) return

          const stats = { ...s.stats }
          const applyEffects = (e: typeof activity.effects) => {
            const { money: m = 0, ...statDeltas } = e
            for (const key of Object.keys(statDeltas) as (keyof Stats)[]) {
              stats[key] = clampStat(stats[key] + (statDeltas[key] ?? 0))
            }
            return m
          }

          let money = s.money - activity.cost
          money += applyEffects(activity.effects)

          if (activity.special === 'casino') {
            const won = Math.random() < 0.45
            const amount = randomInt(100, 2000)
            if (won) {
              money += amount
              stats.happiness = clampStat(stats.happiness + 6)
              set({ money: Math.max(0, money), stats })
              addLog([{ text: `You won $${amount.toLocaleString()} at the casino! 🎉`, kind: 'event' }])
            } else {
              money = Math.max(0, money - amount)
              stats.happiness = clampStat(stats.happiness - 6)
              set({ money, stats })
              addLog([{ text: `You lost $${amount.toLocaleString()} at the casino. The house wins again.`, kind: 'event' }])
            }
            return
          }

          if (activity.special === 'surgery') {
            const botched = Math.random() < 0.2
            if (botched) {
              stats.looks = clampStat(stats.looks - randomInt(5, 12))
              stats.health = clampStat(stats.health - randomInt(8, 18))
              set({ money: Math.max(0, money), stats })
              addLog([{ text: 'The plastic surgery went badly. That is... not what you asked for.', kind: 'event' }])
            } else {
              stats.looks = clampStat(stats.looks + randomInt(15, 25))
              stats.happiness = clampStat(stats.happiness + 6)
              set({ money: Math.max(0, money), stats })
              addLog([{ text: 'Your plastic surgery was a stunning success. Heads turn. 💃', kind: 'event' }])
            }
            return
          }

          set({ money: Math.max(0, money), stats })
          addLog([{ text: `${activity.name}: done. ${activity.description}`, kind: 'event' }])
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
          addLog([
            { text: `You sold your ${asset.name} for $${value.toLocaleString()}.`, kind: 'event' },
          ])
        },

        insult: (personId: string) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          if (!useYearlyAction(`insult-${personId}`)) return
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
          if (
            s.age < job.minAge ||
            s.stats.smarts < job.minSmarts ||
            (job.requiredMajor && s.major !== job.requiredMajor) ||
            (job.requiresDegree && !s.hasDegree)
          ) {
            return
          }
          const crew = rollWorkplacePeople(s.countryCode, s.age, s.nextFriendId)
          set({
            jobId,
            raisePercent: 0,
            relationships: [...withoutWorkPeople(s.relationships), ...crew],
            nextFriendId: s.nextFriendId + crew.length,
          })
          addLog([
            {
              text: `You aced the interview and were hired as a ${job.title} ${job.emoji} earning $${jobSalary(job, s.countryCode).toLocaleString()}/year!`,
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

        quitJob: () => {
          const s = get()
          const job = getJob(s.jobId)
          if (!job || !s.alive) return
          set({
            jobId: null,
            raisePercent: 0,
            relationships: withoutWorkPeople(s.relationships),
          })
          addLog([{ text: `You quit your job as a ${job.title}.`, kind: 'career' }])
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
              text: `You got into ${schoolName}, majoring in ${major.name} ${major.emoji}! Tuition is $${TUITION_PER_YEAR.toLocaleString()}/year for ${UNIVERSITY_YEARS} years.`,
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
            addLog([{ text: `You started dating ${partner.name}. 💕`, kind: 'relationship' }])
          } else {
            set({ stats: { ...s.stats, happiness: clampStat(s.stats.happiness - 2) } })
            addLog([
              { text: 'You put yourself out there, but love did not cooperate this year.', kind: 'relationship' },
            ])
          }
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
          addLog([
            divorced
              ? { text: `You divorced ${partner.name}. They took half of everything.`, kind: 'relationship' }
              : { text: `You broke up with ${partner.name}.`, kind: 'relationship' },
          ])
        },
      }
    },
    {
      name: 'simlife-save',
      version: 9,
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
        return state as GameState
      },
    },
  ),
)
