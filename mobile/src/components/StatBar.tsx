import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface StatBarProps {
  label: string
  value: number
  color: string
  icon: string
}

export function StatBar({ label, value, color, icon }: StatBarProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: value }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  icon: {
    width: 22,
    fontSize: 13,
    textAlign: 'center',
  },
  label: {
    width: 78,
    fontSize: 12,
    fontWeight: '500',
    color: colors.slate600,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  value: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
})
