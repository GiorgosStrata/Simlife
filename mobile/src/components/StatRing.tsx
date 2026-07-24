import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../theme'

interface StatRingProps {
  label: string
  value: number
  color: string
  size?: number
  /**
   * For stats where a HIGH value is *bad* (stress), colour the ring by level —
   * calm green when low, amber in the middle, red when it's running hot — so a
   * full ring reads as a warning instead of an achievement.
   */
  dangerHigh?: boolean
}

/** A circular progress ring with the value in the middle and a label below. */
export function StatRing({ label, value, color, size = 62, dangerHigh = false }: StatRingProps) {
  const v = Math.max(0, Math.min(100, value))
  const ringColor = dangerHigh
    ? v >= 70
      ? colors.rose500
      : v >= 40
        ? colors.orange500
        : colors.emerald700
    : color
  const stroke = 6
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const dash = (v / 100) * circumference

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.slate200}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={styles.value}>{Math.round(v)}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 5 },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 16, fontWeight: '700', color: colors.slate800, fontVariant: ['tabular-nums'] },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.slate500,
    textTransform: 'uppercase',
  },
})
