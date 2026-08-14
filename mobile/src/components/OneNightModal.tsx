import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface OneNightModalProps {
  onClose: () => void
}

/** "Prowl" — a casual-hookup app. One fling per year, with a bit of risk. */
export function OneNightModal({ onClose }: OneNightModalProps) {
  const age = useGameStore((s) => s.age)
  const usedActions = useGameStore((s) => s.usedActions)
  const oneNightStand = useGameStore((s) => s.oneNightStand)
  const tooYoung = age < 18
  const done = usedActions.includes('one-night-stand')
  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>😈</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>Prowl</Text>
              <Text style={styles.meta}>Find someone for tonight — no strings attached</Text>
            </View>
          </View>

          <ScrollView style={styles.actions} contentContainerStyle={styles.actionsContent}>
            <Row
              emoji="🔥"
              title="Find a hookup"
              subtitle={
                tooYoung
                  ? 'You must be 18 to use Prowl'
                  : done
                    ? 'You’ve already been out this year'
                    : 'Swipe, match, and see where the night goes'
              }
              onPress={act(oneNightStand, null)}
              disabled={tooYoung || done}
              chevron
            />
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
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 27 },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: colors.slate800 },
  meta: { fontSize: 13, color: colors.slate500, marginTop: 1 },
  actions: { marginTop: 14 },
  actionsContent: { gap: 8, paddingBottom: 4 },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
