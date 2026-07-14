import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface StatBarProps {
  label: string
  value: number
  color: string
  icon: string
}

/** BitLife-style stat row: emoji, label, thick bar with the % beside it. */
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
      <Text style={styles.value}>{value}%</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 5,
  },
  icon: {
    width: 26,
    fontSize: 17,
    textAlign: 'center',
  },
  label: {
    width: 76,
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate600,
  },
  track: {
    flex: 1,
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  value: {
    width: 38,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
})
