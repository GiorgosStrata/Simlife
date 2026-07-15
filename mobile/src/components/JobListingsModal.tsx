import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { JOBS } from '../data/jobs'
import { annualSalary, getJob, jobBlocker, useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Job, JobQuestion } from '../types'
import { InterviewModal } from './InterviewModal'
import { Row } from './Row'

interface Interview {
  job: Job
  question: JobQuestion
}

interface JobListingsModalProps {
  onClose: () => void
}

/** BitLife-style job board: this year's openings, one tap to interview. */
export function JobListingsModal({ onClose }: JobListingsModalProps) {
  const age = useGameStore((s) => s.age)
  const stats = useGameStore((s) => s.stats)
  const jobId = useGameStore((s) => s.jobId)
  const hasDegree = useGameStore((s) => s.hasDegree)
  const major = useGameStore((s) => s.major)
  const countryCode = useGameStore((s) => s.countryCode)
  const jobOpenings = useGameStore((s) => s.jobOpenings)
  const applyForJob = useGameStore((s) => s.applyForJob)
  const failInterview = useGameStore((s) => s.failInterview)

  const [interview, setInterview] = useState<Interview | null>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const openings = JOBS.filter((j) => jobOpenings.includes(j.id))

  const startInterview = (job: Job) => {
    playSfx('click')
    const question = job.questions[Math.floor(Math.random() * job.questions.length)]
    setInterview({ job, question })
  }

  const answerInterview = (correct: boolean) => {
    if (!interview) return
    if (correct) {
      playSfx('success')
      applyForJob(interview.job.id)
      setInterview(null)
      onClose()
      return
    }
    playSfx('fail')
    failInterview(interview.job.id)
    setInterview(null)
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Job Listings</Text>
          <Text style={styles.subtitle}>
            Hiring this year — openings rotate every birthday. Applying means one interview
            question.
          </Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {openings.map((job) => {
              const blocker = jobBlocker(job, { age, smarts: stats.smarts, hasDegree, major })
              const isCurrent = job.id === jobId
              return (
                <Row
                  key={job.id}
                  emoji={job.emoji}
                  title={job.title}
                  subtitle={`$${annualSalary(job, 0, 0, countryCode).toLocaleString()}/yr${blocker ? ` · 🔒 ${blocker}` : ''}`}
                  onPress={() => startInterview(job)}
                  disabled={blocker !== null || isCurrent}
                  right={
                    <View style={[styles.pill, (blocker !== null || isCurrent) && styles.pillLocked]}>
                      <Text style={styles.pillText}>
                        {isCurrent ? 'Hired' : blocker ? '🔒' : 'Apply'}
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

      {interview && (
        <InterviewModal
          job={interview.job}
          question={interview.question}
          onAnswer={answerInterview}
          onCancel={() => setInterview(null)}
        />
      )}
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
    marginTop: 4,
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
  pill: {
    backgroundColor: colors.cyan500,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillLocked: {
    backgroundColor: colors.slate200,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
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
