import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface RowProps {
  emoji: string
  title: string
  subtitle?: string
  right?: ReactNode
  onPress?: () => void
  disabled?: boolean
  /** Show a chevron on the right (ignored when `right` is given). */
  chevron?: boolean
  /** Custom left node (e.g. an Avatar) shown instead of the emoji badge. */
  avatar?: ReactNode
}

/** BitLife-style list row: emoji badge, title/subtitle, right accessory. */
export function Row({ emoji, title, subtitle, right, onPress, disabled, chevron, avatar }: RowProps) {
  const body = (
    <>
      {avatar ?? (
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>{emoji}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (chevron ? <Text style={styles.chevron}>›</Text> : null)}
    </>
  )

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed, disabled && styles.rowDisabled]}
      >
        {body}
      </Pressable>
    )
  }
  return <View style={[styles.row, disabled && styles.rowDisabled]}>{body}</View>
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  rowPressed: {
    backgroundColor: colors.cyan50,
    borderColor: colors.cyan500,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  badge: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 1,
  },
  chevron: {
    fontSize: 24,
    color: colors.slate400,
    fontWeight: '600',
    marginRight: 2,
  },
})
