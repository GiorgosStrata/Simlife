import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { CRIMES } from '../data/activities'
import type { CrimeAction } from '../types'
import { relationLabel, useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface CrimeModalProps {
  onClose: () => void
}

/** One-time crimes — each has a chance of getting caught. */
export function CrimeModal({ onClose }: CrimeModalProps) {
  const age = useGameStore((s) => s.age)
  const usedActions = useGameStore((s) => s.usedActions)
  const relationships = useGameStore((s) => s.relationships)
  const partnerStatus = useGameStore((s) => s.partnerStatus)
  const commitCrime = useGameStore((s) => s.commitCrime)
  // When a crime lets you choose a victim (murder), we swap to a target list.
  const [picking, setPicking] = useState<CrimeAction | null>(null)
  useCloseOnAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  // Pull the job, then return to the main screen. If it triggered an arrest
  // (an event pops), let that speak; otherwise show the outcome bubble.
  const run = (id: string, targetId?: string) => {
    playSfx('crime')
    const before = useGameStore.getState().log.length
    commitCrime(id, targetId)
    const st = useGameStore.getState()
    if (!st.currentEvent && st.log.length > before) {
      st.showToast(st.log[st.log.length - 1].text)
    }
    st.closeModals()
  }

  const doCrime = (crime: CrimeAction) => () => {
    if (crime.pickTarget) {
      playSfx('click')
      setPicking(crime)
      return
    }
    run(crime.id)
  }

  // People you could target for murder — anyone still alive that you know.
  const targets = relationships.filter((p) => p.alive)

  if (picking) {
    return (
      <Modal visible transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>🔪 {picking.name}</Text>
            <Text style={styles.subtitle}>Choose your victim. There's no undoing this.</Text>

            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              <Row
                emoji="🕶️"
                title="A random stranger"
                subtitle="Someone you've never met. Harder to trace back to you."
                onPress={() => run(picking.id)}
                right={
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>Do it</Text>
                  </View>
                }
              />
              {targets.map((person) => (
                <Row
                  key={person.id}
                  emoji="🎯"
                  title={person.name}
                  subtitle={`Your ${relationLabel(person.role, person.gender, partnerStatus)} · age ${person.age}`}
                  onPress={() => run(picking.id, person.id)}
                  right={
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>Kill</Text>
                    </View>
                  }
                />
              ))}
            </ScrollView>

            <Pressable accessibilityRole="button" onPress={() => setPicking(null)} style={styles.cancel}>
              <Text style={styles.cancelText}>Back</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    )
  }

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
                  onPress={doCrime(crime)}
                  disabled={tooYoung || doneThisYear}
                  right={
                    <View style={[styles.pill, (tooYoung || doneThisYear) && styles.pillOff]}>
                      <Text style={styles.pillText}>
                        {tooYoung ? '🔒' : crime.pickTarget ? 'Choose' : 'Do it'}
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
    backgroundColor: colors.rose700,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillOff: { backgroundColor: colors.slate200 },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.onColor },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
