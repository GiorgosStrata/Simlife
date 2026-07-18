import { StyleSheet, View } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { StatRing } from './StatRing'

/** A row of circular ring meters for the four core stats. */
export function StatsPanel() {
  const stats = useGameStore((s) => s.stats)

  return (
    <View style={styles.card}>
      <StatRing label="Health" value={stats.health} color={colors.rose500} />
      <StatRing label="Mood" value={stats.happiness} color={colors.amber400} />
      <StatRing label="Smarts" value={stats.smarts} color={colors.sky500} />
      <StatRing label="Looks" value={stats.looks} color={colors.violet500} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
})
