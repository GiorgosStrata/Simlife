import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { GameEvent, LogEntry, Stats } from '../types'
import { EVENTS } from '../data/events'

const START_YEAR_BASE = 2026
const MAX_AGE = 100

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

  rerollStats: () => void
  startLife: (firstName: string, lastName: string) => void
  ageUp: () => void
  chooseOption: (choiceIndex: number) => void
  startNewLife: () => void
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

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
        set({
          name,
          screen: 'life',
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

        // Gentle wear and tear in later life.
        const stats = { ...s.stats }
        if (age > 50) {
          stats.health = clampStat(stats.health - randomInt(0, 2))
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
    }),
    {
      name: 'simlife-save',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => {
        useGameStore.setState({ hasHydrated: true })
      },
    },
  ),
)
