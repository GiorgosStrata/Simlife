import { StyleSheet, Text, View } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { StatBar } from './StatBar'

export function StatsPanel() {
  const stats = useGameStore((s) => s.stats)
  const money = useGameStore((s) => s.money)

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>STATS</Text>
        <View style={[styles.moneyBadge, money < 0 && styles.moneyBadgeDebt]}>
          <Text style={[styles.moneyText, money < 0 && styles.moneyTextDebt]}>
            {money < 0 ? `-$${Math.abs(money).toLocaleString()}` : `$${money.toLocaleString()}`}
          </Text>
        </View>
      </View>
      <StatBar label="Health" value={stats.health} color={colors.rose500} icon="❤️" />
      <StatBar label="Happiness" value={stats.happiness} color={colors.amber400} icon="😊" />
      <StatBar label="Smarts" value={stats.smarts} color={colors.sky500} icon="🧠" />
      <StatBar label="Looks" value={stats.looks} color={colors.violet500} icon="✨" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.slate400,
  },
  moneyBadge: {
    backgroundColor: colors.emerald50,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  moneyBadgeDebt: {
    backgroundColor: '#fee2e2',
  },
  moneyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.emerald700,
    fontVariant: ['tabular-nums'],
  },
  moneyTextDebt: {
    color: colors.rose700,
  },
})
