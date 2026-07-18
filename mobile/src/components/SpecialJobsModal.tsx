import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { SPECIAL_JOBS } from '../data/jobs'
import { leagueForJob } from '../data/leagues'
import { annualSalary, useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'

interface SpecialJobsModalProps {
  onClose: () => void
}

/** Odds label for the tryout, mirroring the store's success formula. */
function tryoutOdds(stat: number, min: number): string {
  const chance = Math.max(0.05, Math.min(0.9, (stat - min) / 50 + 0.3))
  if (chance >= 0.6) return 'Great shot'
  if (chance >= 0.35) return 'Decent shot'
  return 'Long shot'
}

/** Fame careers: try out to become an athlete or entertainer. */
export function SpecialJobsModal({ onClose }: SpecialJobsModalProps) {
  const age = useGameStore((s) => s.age)
  const stats = useGameStore((s) => s.stats)
  const athletics = useGameStore((s) => s.athletics)
  const jobId = useGameStore((s) => s.jobId)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const tryoutForSpecialJob = useGameStore((s) => s.tryoutForSpecialJob)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const act = confirmAction(onClose)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🌟 Special Careers</Text>
          <Text style={styles.subtitle}>
            No résumé needed — you try out, and talent decides. One attempt per career each year.
          </Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {SPECIAL_JOBS.map((job) => {
              const isCurrent = job.id === jobId
              const tooYoung = age < job.minAge
              const triedThisYear = usedActions.includes(`tryout-${job.id}`)
              const disabled = isCurrent || tooYoung || triedThisYear
              const isSport = leagueForJob(job.id) !== null
              const statName = isSport ? 'athletic talent' : 'star quality'
              const stat = isSport ? athletics : job.auditionStat ? stats[job.auditionStat] : 50
              const odds = tryoutOdds(stat, job.auditionMin ?? 50)
              const subtitle = isCurrent
                ? 'This is your current career'
                : tooYoung
                  ? `Unlocks at age ${job.minAge}`
                  : triedThisYear
                    ? 'You already tried out this year'
                    : `$${annualSalary(job, 0, 0, countryCode).toLocaleString()}/yr · ${odds} · rewards ${statName}`
              return (
                <Row
                  key={job.id}
                  emoji={job.emoji}
                  title={job.title}
                  subtitle={subtitle}
                  onPress={act(() => tryoutForSpecialJob(job.id), null)}
                  disabled={disabled}
                  right={
                    <View style={[styles.pill, disabled && styles.pillLocked]}>
                      <Text style={styles.pillText}>
                        {isCurrent ? 'Current' : tooYoung ? '🔒' : 'Try out'}
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
  subtitle: { marginTop: 4, fontSize: 13, color: colors.slate500 },
  list: { marginTop: 12 },
  listContent: { gap: 8, paddingBottom: 8 },
  pill: { backgroundColor: colors.violet500, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillLocked: { backgroundColor: colors.slate200 },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.onColor },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
