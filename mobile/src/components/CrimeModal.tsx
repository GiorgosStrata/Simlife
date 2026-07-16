import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { CRIMES } from '../data/activities'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'

interface CrimeModalProps {
  onClose: () => void
}

/** One-time crimes — each has a chance of getting caught. */
export function CrimeModal({ onClose }: CrimeModalProps) {
  const age = useGameStore((s) => s.age)
  const usedActions = useGameStore((s) => s.usedActions)
  const commitCrime = useGameStore((s) => s.commitCrime)

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🦹 Crime</Text>
          <Text style={styles.subtitle}>
            High risk, high reward. Each job can be pulled once a year — if you dare.
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {CRIMES.map((crime) => {
              const tooYoung = age < crime.minAge
              const doneThisYear = usedActions.includes(`crime-${crime.id}`)
              const risk =
                crime.catchChance >= 0.5 ? 'Very high risk' : crime.catchChance >= 0.4 ? 'High risk' : 'Moderate risk'
              return (
                <Row
                  key={crime.id}
                  emoji={crime.emoji}
                  title={crime.name}
                  subtitle={
                    tooYoung
                      ? `Unlocks at age ${crime.minAge}`
                      : doneThisYear
                        ? 'Already tried this year'
                        : `${risk} · ${crime.description}`
                  }
                  onPress={() => {
                    playSfx('crime')
                    commitCrime(crime.id)
                    onClose()
                  }}
                  disabled={tooYoung || doneThisYear}
                  right={
                    <View style={[styles.pill, (tooYoung || doneThisYear) && styles.pillOff]}>
                      <Text style={styles.pillText}>{tooYoung ? '🔒' : 'Do it'}</Text>
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
    backgroundColor: colors.rose700,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillOff: { backgroundColor: colors.slate200 },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.white },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
