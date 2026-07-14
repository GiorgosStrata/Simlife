import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { CareerScreen } from './src/components/CareerScreen'
import { CharacterCreation } from './src/components/CharacterCreation'
import { EventModal } from './src/components/EventModal'
import { GameOverModal } from './src/components/GameOverModal'
import { LifeLog } from './src/components/LifeLog'
import { RelationshipsScreen } from './src/components/RelationshipsScreen'
import { StatsPanel } from './src/components/StatsPanel'
import { TabBar, type TabKey } from './src/components/TabBar'
import { useGameStore } from './src/store/gameStore'
import { colors } from './src/theme'

function Game() {
  const [tab, setTab] = useState<TabKey>('life')
  const hasHydrated = useGameStore((s) => s.hasHydrated)
  const screen = useGameStore((s) => s.screen)
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const alive = useGameStore((s) => s.alive)
  const currentEvent = useGameStore((s) => s.currentEvent)
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

  const ageUpDisabled = !alive || currentEvent !== null

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.column}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerBrand}>Simlife</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerAge}>Age {age}</Text>
            <Text style={styles.headerYear}>Year {year}</Text>
          </View>
        </View>

        <StatsPanel />

        {tab === 'life' && <LifeLog />}
        {tab === 'career' && <CareerScreen />}
        {tab === 'relationships' && <RelationshipsScreen />}

        <TabBar active={tab} onChange={setTab} />
      </View>

      {/* Fixed Age Up button: never moves, like BitLife's age button. */}
      <Pressable
        onPress={ageUp}
        disabled={ageUpDisabled}
        style={({ pressed }) => [
          styles.ageUpButton,
          pressed && styles.ageUpButtonPressed,
          ageUpDisabled && styles.ageUpButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Age Up"
      >
        <Text style={styles.ageUpText}>Age Up +</Text>
      </Pressable>

      <EventModal />
      <GameOverModal />
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
    padding: 16,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flex: 1,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cyan600,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  headerBrand: {
    fontSize: 11,
    color: colors.cyan100,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerAge: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  headerYear: {
    fontSize: 11,
    color: colors.cyan100,
    fontVariant: ['tabular-nums'],
  },
  ageUpButton: {
    position: 'absolute',
    bottom: 92,
    alignSelf: 'center',
    backgroundColor: colors.cyan500,
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 16,
    shadowColor: colors.cyan500,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ageUpButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  ageUpButtonDisabled: {
    opacity: 0.6,
  },
  ageUpText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
})
