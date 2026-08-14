import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from '../data/achievements'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { SectionHeading } from './SectionHeading'
import { useCloseOnAction } from './useCloseOnAction'

const GROUP_COLORS: Record<string, string> = {
  life: colors.amber400,
  family: colors.rose500,
  love: colors.pink600,
  career: colors.sky500,
  wealth: colors.emerald700,
  property: colors.cyan500,
  fame: colors.violet500,
  crime: colors.orange500,
  health: colors.rose500,
  growth: colors.sky500,
}

interface AchievementsModalProps {
  onClose: () => void
}

/** The trophy case: every badge you can earn, unlocked ones lit up. */
export function AchievementsModal({ onClose }: AchievementsModalProps) {
  const unlocked = useGameStore((s) => s.unlockedAchievements)
  useCloseOnAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const earned = new Set(unlocked)
  const total = ACHIEVEMENTS.length
  const pct = total > 0 ? Math.round((earned.size / total) * 100) : 0

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>🏆 Achievements</Text>
              <Text style={styles.sub}>
                {earned.size} of {total} earned · {pct}%
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{pct}%</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${pct}%` }]} />
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {ACHIEVEMENT_GROUPS.map((group) => {
              const items = ACHIEVEMENTS.filter((a) => a.category === group.key)
              if (items.length === 0) return null
              const got = items.filter((a) => earned.has(a.id)).length
              return (
                <View key={group.key} style={styles.group}>
                  <View style={styles.groupHead}>
                    <SectionHeading color={GROUP_COLORS[group.key] ?? colors.cyan500}>
                      {group.label.toUpperCase()}
                    </SectionHeading>
                    <Text style={styles.groupCount}>
                      {got}/{items.length}
                    </Text>
                  </View>
                  {items.map((a) => {
                    const has = earned.has(a.id)
                    return (
                      <View key={a.id} style={[styles.row, !has && styles.rowLocked]}>
                        <View style={[styles.tile, has ? styles.tileOn : styles.tileOff]}>
                          <Text style={[styles.tileEmoji, !has && styles.tileEmojiLocked]}>
                            {has ? a.emoji : '🔒'}
                          </Text>
                        </View>
                        <View style={styles.rowText}>
                          <Text style={[styles.rowTitle, !has && styles.rowTitleLocked]}>
                            {a.title}
                          </Text>
                          <Text style={styles.rowDesc} numberOfLines={2}>
                            {a.description}
                          </Text>
                        </View>
                        {has && <Text style={styles.check}>✓</Text>}
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.slate100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '86%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  sub: { fontSize: 13, color: colors.slate500, marginTop: 2 },
  progressBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cyan50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cyan500,
  },
  progressBadgeText: { fontSize: 15, fontWeight: '800', color: colors.cyan600 },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
    marginTop: 14,
  },
  trackFill: { height: '100%', borderRadius: 999, backgroundColor: colors.cyan500 },
  body: { marginTop: 12 },
  bodyContent: { paddingBottom: 8 },
  group: { marginBottom: 8 },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupCount: { fontSize: 12, fontWeight: '700', color: colors.slate400 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },
  rowLocked: { opacity: 0.7 },
  tile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileOn: { backgroundColor: colors.emerald50 },
  tileOff: { backgroundColor: colors.slate200 },
  tileEmoji: { fontSize: 22 },
  tileEmojiLocked: { fontSize: 16, opacity: 0.6 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '800', color: colors.slate800 },
  rowTitleLocked: { color: colors.slate500 },
  rowDesc: { fontSize: 12, color: colors.slate500, marginTop: 1 },
  check: { fontSize: 16, fontWeight: '900', color: colors.emerald700 },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
