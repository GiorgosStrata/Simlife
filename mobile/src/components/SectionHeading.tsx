import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface SectionHeadingProps {
  children: React.ReactNode
  /** Accent colour for the leading bar; defaults to the indigo brand accent. */
  color?: string
}

/**
 * A small uppercase section label with a coloured accent bar on the left.
 * Give different sections different `color`s for a livelier, more varied UI.
 */
export function SectionHeading({ children, color = colors.cyan500 }: SectionHeadingProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },
  bar: {
    width: 3,
    height: 13,
    borderRadius: 999,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
})
