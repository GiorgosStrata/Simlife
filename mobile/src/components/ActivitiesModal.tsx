import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { ONGOING_ACTIVITIES, getActivity } from '../data/activities'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface ActivitiesModalProps {
  onClose: () => void
}

/**
 * Every activity in one flat list — no categories, no "boosts smarts" hints.
 * Take one up and you keep at it each year; you can have one going per kind of
 * activity, so starting a new one of the same kind swaps it in.
 */
export function ActivitiesModal({ onClose }: ActivitiesModalProps) {
  const age = useGameStore((s) => s.age)
  const pursuits = useGameStore((s) => s.pursuits)
  const startPursuit = useGameStore((s) => s.startPursuit)
  const stopPursuit = useGameStore((s) => s.stopPursuit)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  const isActive = (id: string) => {
    const a = getActivity(id)
    return a ? pursuits[a.category]?.id === id : false
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Activities</Text>
          <Text style={styles.subtitle}>Pick something up — you'll keep at it every year.</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {ONGOING_ACTIVITIES.map((a) => {
              const active = isActive(a.id)
              const tooYoung = age < a.minAge
              const label = active && pursuits[a.category]?.label ? ` · ${pursuits[a.category]?.label}` : ''
              return (
                <Row
                  key={a.id}
                  emoji={a.emoji}
                  title={`${a.name}${label}`}
                  subtitle={
                    active
                      ? 'Currently doing this — tap to stop'
                      : tooYoung
                        ? `Unlocks at age ${a.minAge}`
                        : 'Tap to take it up'
                  }
                  onPress={
                    active
                      ? act(() => stopPursuit(a.category))
                      : tooYoung
                        ? undefined
                        : act(() => startPursuit(a.id))
                  }
                  disabled={tooYoung}
                  right={
                    <View style={[styles.pill, (active || tooYoung) && styles.pillOff]}>
                      <Text style={styles.pillText}>
                        {active ? 'Active' : tooYoung ? '🔒' : 'Start'}
                      </Text>
                    </View>
                  }
                />
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
    maxHeight: '85%',
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.slate500, marginBottom: 8 },
  list: { marginTop: 4 },
  listContent: { gap: 8, paddingBottom: 8 },
  pill: {
    backgroundColor: colors.cyan500,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillOff: { backgroundColor: colors.slate200 },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.onColor },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
