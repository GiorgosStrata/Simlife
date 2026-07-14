import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { playSfx } from './src/audio/sfx'
import { CareerScreen } from './src/components/CareerScreen'
import { CharacterCreation } from './src/components/CharacterCreation'
import { EventModal } from './src/components/EventModal'
import { GameOverModal } from './src/components/GameOverModal'
import { LifeLog } from './src/components/LifeLog'
import { MajorPickerModal } from './src/components/MajorPickerModal'
import { RelationshipsScreen } from './src/components/RelationshipsScreen'
import { SettingsModal } from './src/components/SettingsModal'
import { StatsPanel } from './src/components/StatsPanel'
import { TabBar, type TabKey } from './src/components/TabBar'
import { getMajor } from './src/data/majors'
import { getJob, isInSchool, useGameStore } from './src/store/gameStore'
import { colors } from './src/theme'

/** BitLife-style avatar: the character's emoji changes as they age. */
function avatarEmoji(age: number, alive: boolean): string {
  if (!alive) return '🪦'
  if (age < 2) return '👶'
  if (age < 13) return '🧒'
  if (age < 20) return '🧑'
  if (age < 60) return '🧑‍🦱'
  return '🧓'
}

function Game() {
  const [tab, setTab] = useState<TabKey>('life')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const hasHydrated = useGameStore((s) => s.hasHydrated)
  const screen = useGameStore((s) => s.screen)
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const alive = useGameStore((s) => s.alive)
  const currentEvent = useGameStore((s) => s.currentEvent)
  const jobId = useGameStore((s) => s.jobId)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const major = useGameStore((s) => s.major)
  const applyingToUniversity = useGameStore((s) => s.applyingToUniversity)
  const ageUp = useGameStore((s) => s.ageUp)

  if (!hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.cyan500} />
      </View>
    )
  }

  if (screen === 'creation') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <CharacterCreation />
      </SafeAreaView>
    )
  }

  const job = getJob(jobId)
  const occupation = job
    ? `${job.emoji} ${job.title}`
    : inUniversity
      ? `🏛️ Studying ${getMajor(major)?.name ?? ''}`
      : isInSchool(age)
        ? '🎒 Student'
        : age < 6
          ? '🧸 Child'
          : '🛋️ Unemployed'

  const ageUpDisabled = !alive || currentEvent !== null

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.column}>
        {/* Header: avatar, name, occupation, age/year, settings */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{avatarEmoji(age, alive)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.headerOccupation} numberOfLines={1}>
              {occupation}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View>
              <Text style={styles.headerAge}>Age {age}</Text>
              <Text style={styles.headerYear}>{year}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => setSettingsOpen(true)}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        <StatsPanel />

        {tab === 'life' && <LifeLog />}
        {tab === 'career' && <CareerScreen />}
        {tab === 'relationships' && <RelationshipsScreen />}

        <TabBar active={tab} onChange={setTab} />
      </View>

      {/* Big round Age button, BitLife style: fixed, never moves. */}
      <Pressable
        onPress={() => {
          playSfx('click')
          ageUp()
        }}
        disabled={ageUpDisabled}
        style={({ pressed }) => [
          styles.ageUpButton,
          pressed && styles.ageUpButtonPressed,
          ageUpDisabled && styles.ageUpButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Age Up"
      >
        <Text style={styles.ageUpPlus}>＋</Text>
        <Text style={styles.ageUpText}>Age</Text>
      </Pressable>

      <EventModal />
      <GameOverModal />
      {applyingToUniversity && <MajorPickerModal />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Game />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.slate100,
    padding: 14,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flex: 1,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cyan600,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cyan500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  headerOccupation: {
    fontSize: 12,
    color: colors.cyan100,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAge: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  headerYear: {
    fontSize: 11,
    color: colors.cyan100,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cyan500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  settingsIcon: {
    fontSize: 16,
  },
  ageUpButton: {
    position: 'absolute',
    bottom: 96,
    alignSelf: 'center',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.cyan500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  ageUpButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  ageUpButtonDisabled: {
    opacity: 0.55,
  },
  ageUpPlus: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 24,
  },
  ageUpText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
    marginTop: -2,
  },
})
