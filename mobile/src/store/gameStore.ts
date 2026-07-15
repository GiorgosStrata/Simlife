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
  const teachers = stage === 'university' ? TEACHER_COUNT : TEACHER_COUNT
  for (let i = 0; i < teachers; i++) {
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
  askTeacherHelp: (personId: string) => void
  befriendClassmate: (personId: string) => void

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

          // Salary lands every year you hold a job, scaled by country.
          const job = getJob(s.jobId)
          if (job) {
            money += jobSalary(job, s.countryCode)
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
          set({ jobId })
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
          set({ jobId: null })
          addLog([{ text: `You quit your job as a ${job.title}.`, kind: 'career' }])
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
      version: 7,
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
        return state as GameState
      },
    },
  ),
)
