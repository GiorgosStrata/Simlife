import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import {
  MAX_RAISE_PERCENT,
  annualSalary,
  getJob,
  jobTitle,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import { PersonModal, personEmoji } from './PersonModal'
import { Row } from './Row'

interface WorkplaceModalProps {
  onClose: () => void
}

/** BitLife-style workplace: your job, your moves, your coworkers. */
export function WorkplaceModal({ onClose }: WorkplaceModalProps) {
  const jobId = useGameStore((s) => s.jobId)
  const jobTier = useGameStore((s) => s.jobTier)
  const raisePercent = useGameStore((s) => s.raisePercent)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const relationships = useGameStore((s) => s.relationships)
  const workHarder = useGameStore((s) => s.workHarder)
  const askForRaise = useGameStore((s) => s.askForRaise)

  const [personId, setPersonId] = useState<string | null>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const job = getJob(jobId)
  if (!job) return null

  const coworkers = relationships.filter((p) => p.role === 'coworker' && p.alive)
  const boss = relationships.find((p) => p.role === 'boss' && p.alive)
  const salary = annualSalary(job, jobTier, raisePercent, countryCode)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {job.emoji} {jobTitle(job, jobTier)}
          </Text>
          <Text style={styles.subtitle}>
            ${salary.toLocaleString()}/year
            {raisePercent > 0 ? ` · +${raisePercent}% in raises` : ''}
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Row
              emoji="💪"
              title="Work harder"
              subtitle={usedActions.includes('work-harder') ? 'Done this year' : 'Impress the boss'}
              onPress={() => {
                playSfx('click')
                workHarder()
              }}
              disabled={usedActions.includes('work-harder')}
              chevron
            />
            <Row
              emoji="💸"
              title="Ask for a raise"
              subtitle={
                raisePercent >= MAX_RAISE_PERCENT
                  ? 'Maxed out'
                  : usedActions.includes('raise')
                    ? 'Done this year'
                    : 'Better odds with a happy boss'
              }
              onPress={() => {
                playSfx('click')
                askForRaise()
              }}
              disabled={usedActions.includes('raise') || raisePercent >= MAX_RAISE_PERCENT}
              chevron
            />

            {boss && (
              <>
                <Text style={styles.sectionHeading}>👔 BOSS</Text>
                <Row
                  emoji={personEmoji(boss)}
                  title={boss.name}
                  subtitle={`Bond ${boss.relationship}`}
                  onPress={() => {
                    playSfx('click')
                    setPersonId(boss.id)
                  }}
                  chevron
                />
              </>
            )}

            <Text style={styles.sectionHeading}>🧑‍💼 COWORKERS</Text>
            {coworkers.length === 0 && <Text style={styles.empty}>You work alone.</Text>}
            {coworkers.map((p) => (
              <Row
                key={p.id}
                emoji={personEmoji(p)}
                title={p.name}
                subtitle={`Bond ${p.relationship}`}
                onPress={() => {
                  playSfx('click')
                  setPersonId(p.id)
                }}
                chevron
              />
            ))}
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>

      {personId && <PersonModal personId={personId} onClose={() => setPersonId(null)} />}
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.slate100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate800,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.slate500,
  },
  list: {
    marginTop: 12,
  },
  listContent: {
    gap: 8,
    paddingBottom: 8,
  },
  sectionHeading: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate500,
  },
  empty: {
    fontSize: 13,
    color: colors.slate400,
  },
  cancel: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate500,
  },
})
