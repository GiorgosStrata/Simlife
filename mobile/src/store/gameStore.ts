import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  GameEvent,
  Job,
  LogEntry,
  PartnerStatus,
  Person,
  PersonRole,
  Stats,
} from '../types'
import { EVENTS } from '../data/events'
import { JOBS } from '../data/jobs'

const START_YEAR_BASE = 2026
const MAX_AGE = 100
export const TUITION_PER_YEAR = 5000
export const UNIVERSITY_YEARS = 4
export const UNIVERSITY_MIN_SMARTS = 30
export const GIFT_COST = 100
export const WEDDING_COST = 2000
export const PROPOSAL_MIN_RELATIONSHIP = 70

const FIRST_NAMES = [
  'Alex', 'Billie', 'Casey', 'Dana', 'Eli', 'Frankie', 'Georgie', 'Harper',
  'Izzy', 'Jules', 'Kai', 'Lou', 'Marlow', 'Nico', 'Ozzie', 'Piper',
  'Quinn', 'Remy', 'Sasha', 'Toni',
]
const LAST_NAMES = [
  'Abbott', 'Baker', 'Castillo', 'Dawson', 'Ellis', 'Ferris', 'Grady',
  'Holloway', 'Ibarra', 'Jensen', 'Klein', 'Lambert', 'Moreau', 'Novak',
  'Ortega', 'Petrov', 'Quill', 'Rossi', 'Silva', 'Tanaka',
]

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

export function randomNameParts(): { first: string; last: string } {
  return { first: pick(FIRST_NAMES), last: pick(LAST_NAMES) }
}

function rollStats(): Stats {
  return {
    health: randomInt(60, 100),
    happiness: randomInt(50, 100),
    smarts: randomInt(30, 100),
    looks: randomInt(30, 100),
  }
}

/** Parents (and maybe an older sibling); first names only until startLife. */
function makeFamily(): Person[] {
  const family: Person[] = [
    {
      id: 'mother',
      role: 'mother',
      name: pick(FIRST_NAMES),
      age: randomInt(20, 38),
      alive: true,
      relationship: randomInt(70, 95),
    },
    {
      id: 'father',
      role: 'father',
      name: pick(FIRST_NAMES),
      age: randomInt(22, 42),
      alive: true,
      relationship: randomInt(70, 95),
    },
  ]
  if (Math.random() < 0.6) {
    family.push({
      id: 'sibling',
      role: 'sibling',
      name: pick(FIRST_NAMES),
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

interface GameState {
  /** 'creation' shows the character creation screen; 'life' is the game. */
  screen: 'creation' | 'life'
  name: string
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

  // Career
  jobId: string | null
  hasDegree: boolean
  inUniversity: boolean
  uniYearsLeft: number

  // Relationships
  relationships: Person[]
  partnerStatus: PartnerStatus | null

  rerollStats: () => void
  startLife: (firstName: string, lastName: string) => void
  ageUp: () => void
  chooseOption: (choiceIndex: number) => void
  startNewLife: () => void

  applyForJob: (jobId: string) => void
  quitJob: () => void
  enrollUniversity: () => void

  spendTime: (personId: PersonRole) => void
  giveGift: (personId: PersonRole) => void
  findLove: () => void
  propose: () => void
  marry: () => void
  breakUp: () => void
}

function newLifeState() {
  const { first, last } = randomNameParts()
  return {
    screen: 'creation' as const,
    name: `${first} ${last}`,
    alive: true,
    age: 0,
    year: START_YEAR_BASE,
    stats: rollStats(),
    money: 0,
    currentEvent: null,
    usedEventIds: [] as string[],
    nextLogId: 1,
    log: [] as LogEntry[],
    jobId: null,
    hasDegree: false,
    inUniversity: false,
    uniYearsLeft: 0,
    relationships: makeFamily(),
    partnerStatus: null as PartnerStatus | null,
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
      /** Append log entries, advancing the id counter. */
      const addLog = (
        entries: Array<Pick<LogEntry, 'text' | 'kind'>>,
      ) => {
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

      const updatePerson = (personId: PersonRole, change: Partial<Person>) => {
        set({
          relationships: get().relationships.map((p) =>
            p.id === personId ? { ...p, ...change } : p,
          ),
        })
      }

      return {
        ...newLifeState(),
        hasHydrated: false,

        rerollStats: () => {
          if (get().screen !== 'creation') return
          set({ stats: rollStats() })
        },

        startLife: (firstName: string, lastName: string) => {
          const s = get()
          if (s.screen !== 'creation') return
          const typed = `${firstName.trim()} ${lastName.trim()}`.trim()
          const fallback = randomNameParts()
          const name = typed || `${fallback.first} ${fallback.last}`
          const familyLastName = name.split(' ').slice(-1)[0] ?? ''
          set({
            name,
            screen: 'life',
            relationships: s.relationships.map((p) => ({
              ...p,
              name: `${p.name} ${familyLastName}`.trim(),
            })),
            log: [
              {
                id: 0,
                age: 0,
                year: s.year,
                text: `You were born! Say hello to ${name}.`,
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

          // Salary lands every year you hold a job.
          const job = getJob(s.jobId)
          if (job) {
            money += job.salary
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
              entries.push({
                id: logId++,
                age,
                year,
                text: 'You graduated from university! 🎓',
                kind: 'career',
              })
            }
          }

          // School milestones (flavor only; enrollment is automatic).
          const milestone: Record<number, string> = {
            6: 'You started primary school.',
            12: 'You moved up to middle school.',
            15: 'You started high school.',
            18: 'You graduated from high school.',
          }
          if (milestone[age]) {
            entries.push({ id: logId++, age, year, text: milestone[age], kind: 'career' })
          }

          // The people in your life age too — and drift if neglected.
          let partnerStatus = s.partnerStatus
          const relationships = s.relationships.map((p) => {
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
              alive: false,
              currentEvent: null,
              log: [...s.log, ...entries],
              nextLogId: logId,
            })
            return
          }

          const event = drawEvent(age, s.usedEventIds)
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
            currentEvent: event,
            usedEventIds: event ? [...s.usedEventIds, event.id] : s.usedEventIds,
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
        },

        startNewLife: () => set(newLifeState()),

        // ----- Career -----

        applyForJob: (jobId: string) => {
          const s = get()
          const job = getJob(jobId)
          if (!job || !s.alive || s.screen !== 'life' || s.jobId === jobId) return
          if (
            s.age < job.minAge ||
            s.stats.smarts < job.minSmarts ||
            (job.requiresDegree && !s.hasDegree)
          ) {
            return
          }
          set({ jobId })
          addLog([
            {
              text: `You were hired as a ${job.title} ${job.emoji} earning $${job.salary.toLocaleString()}/year.`,
              kind: 'career',
            },
          ])
        },

        quitJob: () => {
          const s = get()
          const job = getJob(s.jobId)
          if (!job || !s.alive) return
          set({ jobId: null })
          addLog([{ text: `You quit your job as a ${job.title}.`, kind: 'career' }])
        },

        enrollUniversity: () => {
          const s = get()
          if (
            !s.alive ||
            s.screen !== 'life' ||
            s.age < 18 ||
            s.hasDegree ||
            s.inUniversity ||
            s.stats.smarts < UNIVERSITY_MIN_SMARTS
          ) {
            return
          }
          set({ inUniversity: true, uniYearsLeft: UNIVERSITY_YEARS })
          addLog([
            {
              text: `You enrolled in university. Tuition is $${TUITION_PER_YEAR.toLocaleString()}/year for ${UNIVERSITY_YEARS} years.`,
              kind: 'career',
            },
          ])
        },

        // ----- Relationships -----

        spendTime: (personId: PersonRole) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(4, 10)),
          })
          set({ stats: { ...s.stats, happiness: clampStat(s.stats.happiness + 2) } })
          addLog([{ text: `You spent quality time with ${person.name}.`, kind: 'relationship' }])
        },

        giveGift: (personId: PersonRole) => {
          const s = get()
          const person = s.relationships.find((p) => p.id === personId)
          if (!person?.alive || !s.alive || s.money < GIFT_COST) return
          updatePerson(personId, {
            relationship: clampRelationship(person.relationship + randomInt(6, 12)),
          })
          set({ money: s.money - GIFT_COST })
          addLog([{ text: `You gave ${person.name} a thoughtful gift.`, kind: 'relationship' }])
        },

        findLove: () => {
          const s = get()
          if (!s.alive || s.age < 18 || s.relationships.some((p) => p.id === 'partner')) return
          if (Math.random() < 0.75) {
            const { first, last } = randomNameParts()
            const partner: Person = {
              id: 'partner',
              role: 'partner',
              name: `${first} ${last}`,
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
      version: 2,
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
            name: `${pick(FIRST_NAMES)} ${lastName}`.trim(),
            age: age + randomInt(22, 40),
            alive: true,
            relationship: randomInt(55, 85),
          }))
        }
        return state as GameState
      },
    },
  ),
)
