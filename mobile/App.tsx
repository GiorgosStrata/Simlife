import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { playSfx } from './src/audio/sfx'
import { applyTheme } from './src/applyTheme'
import { ActivitiesScreen } from './src/components/ActivitiesScreen'
import { Avatar } from './src/components/Avatar'
import { CareerScreen } from './src/components/CareerScreen'
import { CharacterCreation } from './src/components/CharacterCreation'
import { EventModal } from './src/components/EventModal'
import { Flag } from './src/components/Flag'
import { GameOverModal } from './src/components/GameOverModal'
import { LifeLog } from './src/components/LifeLog'
import { MajorPickerModal } from './src/components/MajorPickerModal'
import { RelationshipsScreen } from './src/components/RelationshipsScreen'
import { SettingsModal } from './src/components/SettingsModal'
import { StatsPanel } from './src/components/StatsPanel'
import { TabBar, type TabKey } from './src/components/TabBar'
import { Toast } from './src/components/Toast'
import { getMajor } from './src/data/majors'
import { getJob, isInSchool, jobTitle, useGameStore } from './src/store/gameStore'
import { colors } from './src/theme'

function Game() {
  const [tab, setTab] = useState<TabKey>('life')
  const [prevTab, setPrevTab] = useState<TabKey>('career')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const tabRef = useRef<TabKey>(tab)
  tabRef.current = tab

  // Switch tabs while remembering where we came from, so the Back button can
  // return there (BitLife style).
  const goTab = (t: TabKey) => {
    if (t !== tabRef.current) setPrevTab(tabRef.current)
    setTab(t)
  }

  const hasHydrated = useGameStore((s) => s.hasHydrated)
  const screen = useGameStore((s) => s.screen)
  const name = useGameStore((s) => s.name)
  const avatarConfig = useGameStore((s) => s.avatarConfig)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const money = useGameStore((s) => s.money)
  const alive = useGameStore((s) => s.alive)
  const currentEvent = useGameStore((s) => s.currentEvent)
  const jobId = useGameStore((s) => s.jobId)
  const jobTier = useGameStore((s) => s.jobTier)
  const countryCode = useGameStore((s) => s.countryCode)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const major = useGameStore((s) => s.major)
  const applyingToUniversity = useGameStore((s) => s.applyingToUniversity)
  const ageUp = useGameStore((s) => s.ageUp)
  const prison = useGameStore((s) => s.prison)
  const theme = useGameStore((s) => s.theme)
  const modalNonce = useGameStore((s) => s.modalNonce)

  // Apply the light/dark theme on web whenever it changes.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // After any confirmed action (which closes all sheets), snap back to the
  // "Dashboard" tab — you always land on the main screen.
  const prevNonce = useRef(modalNonce)
  useEffect(() => {
    if (modalNonce !== prevNonce.current) {
      prevNonce.current = modalNonce
      goTab('life')
    }
  }, [modalNonce])

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
  const occupation = prison
    ? `Inmate · ${prison.yearsLeft}y left`
    : job
      ? jobTitle(job, jobTier)
      : inUniversity
        ? `Studying ${getMajor(major)?.name ?? ''}`
        : isInSchool(age)
          ? 'Student'
          : age < 6
            ? 'Child'
            : 'Unemployed'

  const advanceDisabled = !alive || currentEvent !== null
  const balance =
    money < 0 ? `-$${Math.abs(money).toLocaleString()}` : `$${money.toLocaleString()}`

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.column}>
        {/* Flat character summary bar */}
        <View style={styles.topBar}>
          <View style={styles.avatar}>
            <Avatar config={avatarConfig} alive={alive} size={44} />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Flag code={countryCode} width={20} />
              <Text style={styles.headerName} numberOfLines={1}>
                {name}
              </Text>
            </View>
            <Text style={styles.headerOccupation} numberOfLines={1}>
              {occupation}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => setSettingsOpen(true)}
            style={({ pressed }) => [styles.gear, pressed && styles.gearPressed]}
          >
            <Text style={styles.gearIcon}>⚙</Text>
          </Pressable>
        </View>

        {/* Meta row: age/year + balance */}
        <View style={styles.metaBar}>
          <View style={styles.metaChip}>
            <Text style={styles.metaLabel}>AGE</Text>
            <Text style={styles.metaValue}>{age}</Text>
            <Text style={styles.metaSub}>· {year}</Text>
          </View>
          <View style={[styles.metaChip, styles.balanceChip]}>
            <Text style={[styles.metaValue, money < 0 && styles.balanceNeg]}>{balance}</Text>
          </View>
        </View>

        <StatsPanel />

        {tab === 'life' && <LifeLog />}
        {tab === 'career' && <CareerScreen />}
        {tab === 'relationships' && <RelationshipsScreen />}
        {tab === 'activities' && <ActivitiesScreen />}

        <TabBar active={tab} onChange={goTab} />
      </View>

      {/* Back button, bottom-left: returns to the tab you were last on. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => goTab(prevTab)}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      >
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      {/* Floating Advance Year button, bottom-left for easy thumb reach. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Advance Year"
        onPress={() => {
          playSfx('click')
          ageUp()
        }}
        disabled={advanceDisabled}
        style={({ pressed }) => [
          styles.advanceButton,
          pressed && styles.advanceButtonPressed,
          advanceDisabled && styles.advanceButtonDisabled,
        ]}
      >
        <Text style={styles.advanceText}>Advance Year</Text>
        <Text style={styles.advanceArrow}>→</Text>
      </Pressable>

      <Toast />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerName: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: colors.slate800,
  },
  headerOccupation: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 1,
  },
  gear: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearPressed: {
    backgroundColor: colors.cyan50,
  },
  gearIcon: {
    fontSize: 17,
    color: colors.slate600,
  },
  metaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  balanceChip: {},
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.slate400,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
    fontVariant: ['tabular-nums'],
  },
  metaSub: {
    fontSize: 12,
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
  balanceNeg: {
    color: colors.rose500,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    bottom: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  backButtonPressed: {
    backgroundColor: colors.cyan50,
  },
  backArrow: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.slate600,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate600,
  },
  advanceButton: {
    position: 'absolute',
    right: 16,
    bottom: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cyan500,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  advanceButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  advanceButtonDisabled: {
    opacity: 0.4,
  },
  advanceText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.onColor,
  },
  advanceArrow: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.onColor,
  },
})
