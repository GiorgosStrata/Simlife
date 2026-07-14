import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { JOBS } from '../data/jobs'
import {
  TUITION_PER_YEAR,
  UNIVERSITY_MIN_SMARTS,
  UNIVERSITY_YEARS,
  getJob,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import type { Job } from '../types'

function educationLabel(
  age: number,
  hasDegree: boolean,
  inUniversity: boolean,
  uniYearsLeft: number,
): string {
  if (hasDegree) return 'University graduate 🎓'
  if (inUniversity) return `University student — ${uniYearsLeft} year${uniYearsLeft === 1 ? '' : 's'} to go`
  if (age < 6) return 'Too young for school'
  if (age < 12) return 'Primary school student'
  if (age < 15) return 'Middle school student'
  if (age < 18) return 'High school student'
  return 'High school graduate'
}

function jobBlocker(job: Job, age: number, smarts: number, hasDegree: boolean): string | null {
  if (age < job.minAge) return `requires age ${job.minAge}`
  if (job.requiresDegree && !hasDegree) return 'requires a university degree'
  if (smarts < job.minSmarts) return `requires ${job.minSmarts} smarts`
  return null
}

export function CareerScreen() {
  const age = useGameStore((s) => s.age)
  const stats = useGameStore((s) => s.stats)
  const jobId = useGameStore((s) => s.jobId)
  const hasDegree = useGameStore((s) => s.hasDegree)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const uniYearsLeft = useGameStore((s) => s.uniYearsLeft)
  const applyForJob = useGameStore((s) => s.applyForJob)
  const quitJob = useGameStore((s) => s.quitJob)
  const enrollUniversity = useGameStore((s) => s.enrollUniversity)

  const currentJob = getJob(jobId)
  const canEnroll =
    age >= 18 && !hasDegree && !inUniversity && stats.smarts >= UNIVERSITY_MIN_SMARTS

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.heading}>EDUCATION</Text>
        <Text style={styles.bodyText}>
          {educationLabel(age, hasDegree, inUniversity, uniYearsLeft)}
        </Text>
        {age >= 18 && !hasDegree && !inUniversity && (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={enrollUniversity}
              disabled={!canEnroll}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                !canEnroll && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>Enroll in University</Text>
            </Pressable>
            <Text style={styles.hint}>
              ${TUITION_PER_YEAR.toLocaleString()}/year for {UNIVERSITY_YEARS} years · needs{' '}
              {UNIVERSITY_MIN_SMARTS} smarts · unlocks better jobs
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>CURRENT JOB</Text>
        {currentJob ? (
          <>
            <Text style={styles.bodyText}>
              {currentJob.emoji} {currentJob.title} · ${currentJob.salary.toLocaleString()}/year
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={quitJob}
              style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]}
            >
              <Text style={styles.dangerButtonText}>Quit Job</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.bodyText}>
            {age < 16 ? 'Unemployed — come back when you turn 16.' : 'Unemployed'}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>JOB LISTINGS</Text>
        {JOBS.map((job) => {
          const blocker = jobBlocker(job, age, stats.smarts, hasDegree)
          const isCurrent = job.id === jobId
          return (
            <View key={job.id} style={styles.jobRow}>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>
                  {job.emoji} {job.title}
                </Text>
                <Text style={styles.jobMeta}>
                  ${job.salary.toLocaleString()}/yr
                  {blocker ? ` · ${blocker}` : ''}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => applyForJob(job.id)}
                disabled={blocker !== null || isCurrent}
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && styles.applyButtonPressed,
                  (blocker !== null || isCurrent) && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.applyButtonText}>{isCurrent ? 'Hired' : 'Apply'}</Text>
              </Pressable>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 64,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  heading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.slate400,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: colors.slate800,
    fontWeight: '500',
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.slate500,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: colors.cyan500,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  dangerButton: {
    marginTop: 12,
    backgroundColor: colors.slate100,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dangerButtonPressed: {
    backgroundColor: colors.slate200,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.rose700,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.slate200,
    gap: 10,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate800,
  },
  jobMeta: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 1,
  },
  applyButton: {
    backgroundColor: colors.cyan50,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  applyButtonPressed: {
    backgroundColor: colors.cyan100,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cyan600,
  },
})
