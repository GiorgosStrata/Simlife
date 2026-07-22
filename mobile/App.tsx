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
import { GRADIENTS, GradientFill } from './src/components/Gradient'
import { GameOverModal } from './src/components/GameOverModal'
import { InvestingModal } from './src/components/InvestingModal'
import { JobListingsModal } from './src/components/JobListingsModal'
import { LifeLog } from './src/components/LifeLog'
import { MajorPickerModal } from './src/components/MajorPickerModal'
import { MindBodyModal } from './src/components/MindBodyModal'
import { SocialModal } from './src/components/SocialModal'
import { StoreModal } from './src/components/StoreModal'
import { RelationshipsScreen } from './src/components/RelationshipsScreen'
import { SettingsModal } from './src/components/SettingsModal'
import { StatsPanel } from './src/components/StatsPanel'
import { TabBar, type TabKey } from './src/components/TabBar'
import { AchievementToast } from './src/components/AchievementToast'
import { AdBanner } from './src/components/AdBanner'
import { AuthScreen } from './src/components/AuthScreen'
import { InterstitialAd } from './src/components/InterstitialAd'
import { PremiumModal } from './src/components/PremiumModal'
import { SaveSlotsModal } from './src/components/SaveSlotsModal'
import { Toast } from './src/components/Toast'
import { getMajor } from './src/data/majors'
import { ensureSeeded } from './src/saves'
import { useAuthStore } from './src/store/authStore'
import { usePremiumStore } from './src/store/premiumStore'
import { useSlotsStore } from './src/store/slotsStore'
import { getJob, isInSchool, jobTitle, useGameStore } from './src/store/gameStore'
import { colors } from './src/theme'

/** How often a full-screen interstitial ad appears during play (~10 min). */
const AD_INTERVAL_MS = 10 * 60 * 1000

function Game() {
  const [tab, setTab] = useState<TabKey>('life')
  const [prevTab, setPrevTab] = useState<TabKey>('career')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [livesOpen, setLivesOpen] = useState(false)
  const [adOpen, setAdOpen] = useState(false)
  const tabRef = useRef<TabKey>(tab)
  tabRef.current = tab

  const premium = usePremiumStore((s) => s.premium)
  const slotsHydrated = useSlotsStore((s) => s.hasHydrated)

  // Show a full-screen interstitial ad roughly every 10 minutes of play, but
  // never for premium players or on top of a pending life event.
  useEffect(() => {
    const id = setInterval(() => {
      if (usePremiumStore.getState().premium) return
      if (!useGameStore.getState().currentEvent) setAdOpen(true)
    }, AD_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

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
  const deepLink = useGameStore((s) => s.deepLink)
  const clearDeepLink = useGameStore((s) => s.clearDeepLink)

  // Apply the light/dark theme on web whenever it changes.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Once the game and the slot roster are loaded, make sure the current game
  // is represented by a save slot (seeds the first slot on a fresh install).
  const seededRef = useRef(false)
  useEffect(() => {
    if (hasHydrated && slotsHydrated && !seededRef.current) {
      seededRef.current = true
      ensureSeeded()
    }
  }, [hasHydrated, slotsHydrated])

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
  // Children are never shown in the red — their parents cover everything, even
  // if a stray cost dips them negative mid-year (it's wiped at year-end anyway).
  const shownMoney = age < 18 ? Math.max(0, money) : money
  const balance =
    shownMoney < 0
      ? `-$${Math.abs(shownMoney).toLocaleString()}`
      : `$${shownMoney.toLocaleString()}`

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.column}>
        {/* Banner ad slot (AdMob on native; house-ad placeholder on web).
            Premium removes ads entirely. */}
        {!premium && <AdBanner />}

        {/* Flat character summary bar */}
        <View style={styles.topBar}>
          <View style={styles.avatar}>
            <Avatar config={avatarConfig} age={age} alive={alive} size={44} />
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
            accessibilityLabel={premium ? 'Premium' : 'Get Premium'}
            onPress={() => setPremiumOpen(true)}
            style={({ pressed }) => [
              styles.premiumBox,
              premium && styles.premiumBoxOwned,
              pressed && styles.gearPressed,
            ]}
          >
            <Text style={styles.premiumIcon}>👑</Text>
            {!premium && <Text style={styles.premiumLabel}>PRO</Text>}
          </Pressable>
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
          <View
            style={[styles.metaChip, styles.balanceChip, shownMoney < 0 && styles.balanceChipNeg]}
          >
            <Text
              style={[styles.balanceDot, shownMoney < 0 ? styles.balanceNeg : styles.balancePos]}
            >
              ●
            </Text>
            <Text
              style={[styles.metaValue, shownMoney < 0 ? styles.balanceNeg : styles.balancePos]}
            >
              {balance}
            </Text>
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
        <GradientFill from={GRADIENTS.primary[0]} to={GRADIENTS.primary[1]} />
        <Text style={styles.advanceText}>Advance Year</Text>
        <Text style={styles.advanceArrow}>→</Text>
      </Pressable>

      <Toast />
      <EventModal />
      <GameOverModal onWantPremium={() => setPremiumOpen(true)} />
      {applyingToUniversity && <MajorPickerModal />}
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onOpenLives={() => {
            setSettingsOpen(false)
            setLivesOpen(true)
          }}
          onOpenPremium={() => {
            setSettingsOpen(false)
            setPremiumOpen(true)
          }}
        />
      )}
      {premiumOpen && <PremiumModal onClose={() => setPremiumOpen(false)} />}
      {livesOpen && (
        <SaveSlotsModal
          onClose={() => setLivesOpen(false)}
          onWantPremium={() => {
            setLivesOpen(false)
            setPremiumOpen(true)
          }}
        />
      )}

      {/* Event choices can jump straight into an app area ("Invest" → Vestr). */}
      {deepLink === 'investing' && <InvestingModal onClose={clearDeepLink} />}
      {deepLink === 'health' && <MindBodyModal onClose={clearDeepLink} />}
      {deepLink === 'shop' && <StoreModal onClose={clearDeepLink} />}
      {deepLink === 'jobs' && <JobListingsModal onClose={clearDeepLink} />}
      {deepLink === 'social' && <SocialModal app="flicktok" onClose={clearDeepLink} />}

      <AchievementToast />
      {adOpen && <InterstitialAd onClose={() => setAdOpen(false)} />}
    </SafeAreaView>
  )
}

/** Gates the game behind sign-up / log-in. */
function Root() {
  const authHydrated = useAuthStore((s) => s.hasHydrated)
  const loggedIn = useAuthStore((s) => s.currentEmail !== null)
  const theme = useGameStore((s) => s.theme)

  // Apply the theme up here so the auth screen is themed too (Game re-applies).
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  if (!authHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.cyan500} />
      </View>
    )
  }
  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.authScreen} edges={['top', 'bottom']}>
        <AuthScreen />
      </SafeAreaView>
    )
  }
  return <Game />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Root />
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
  authScreen: {
    flex: 1,
    backgroundColor: colors.slate100,
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
  premiumBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.amber400,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
  },
  premiumBoxOwned: {
    borderColor: colors.amber400,
    backgroundColor: colors.emerald50,
  },
  premiumIcon: { fontSize: 15 },
  premiumLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colors.amber400,
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
  balanceChip: {
    borderColor: colors.emerald700,
    backgroundColor: colors.emerald50,
  },
  balanceChipNeg: {
    borderColor: colors.rose500,
    backgroundColor: colors.white,
  },
  balanceDot: {
    fontSize: 9,
  },
  balancePos: {
    color: colors.emerald700,
  },
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
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  advanceButtonPressed: {
    opacity: 0.88,
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
