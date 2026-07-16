import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { ONGOING_ACTIVITIES } from '../data/activities'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { ActivityCategory } from '../types'
import { Row } from './Row'

const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  sport: 'Sport',
  mind: 'Mind',
  hobby: 'Hobbies',
}

interface PursuitModalProps {
  category: ActivityCategory
  onClose: () => void
}

/** Pick an ongoing pursuit — you keep doing it every year until you switch. */
export function PursuitModal({ category, onClose }: PursuitModalProps) {
  const age = useGameStore((s) => s.age)
  const active = useGameStore((s) => s.pursuits[category])
  const startPursuit = useGameStore((s) => s.startPursuit)
  const stopPursuit = useGameStore((s) => s.stopPursuit)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const options = ONGOING_ACTIVITIES.filter((a) => a.category === category)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{CATEGORY_LABEL[category]}</Text>
          <Text style={styles.subtitle}>
            Take one up and you keep doing it every year until you switch or stop.
          </Text>

          {active && (
            <Row
              emoji="🛑"
              title="Stop current activity"
              subtitle="Quit what you're doing now"
              onPress={() => {
                playSfx('click')
                stopPursuit(category)
              }}
              chevron
            />
          )}

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {options.map((a) => {
              const isActive = active?.id === a.id
              const tooYoung = age < a.minAge
              const label = isActive && active?.label ? ` · ${active.label}` : ''
              return (
                <Row
                  key={a.id}
                  emoji={a.emoji}
                  title={`${a.name}${label}`}
                  subtitle={
                    isActive
                      ? active?.label
                        ? `Learning · ${active.years}/${a.durationYears} yrs`
                        : 'Currently doing this'
                      : tooYoung
                        ? `Unlocks at age ${a.minAge}`
                        : a.description
                  }
                  onPress={() => {
                    playSfx('click')
                    startPursuit(a.id)
                  }}
                  disabled={isActive || tooYoung}
                  right={
                    <View style={[styles.pill, (isActive || tooYoung) && styles.pillOff]}>
                      <Text style={styles.pillText}>{isActive ? 'Active' : tooYoung ? '🔒' : 'Start'}</Text>
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
  pillText: { fontSize: 13, fontWeight: '700', color: colors.white },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
