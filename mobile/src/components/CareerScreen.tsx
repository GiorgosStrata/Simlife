import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { JOBS } from '../data/jobs'
import { getMajor } from '../data/majors'
import {
  TUITION_PER_YEAR,
  UNIVERSITY_YEARS,
  getJob,
  isInSchool,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import type { Job, JobQuestion } from '../types'
import { InterviewModal } from './InterviewModal'
import { Row } from './Row'

function educationLabel(state: {
  age: number
  hasDegree: boolean
  inUniversity: boolean
  uniYearsLeft: number
  major: string | null
}): { emoji: string; title: string; subtitle: string } {
  const { age, hasDegree, inUniversity, uniYearsLeft, major } = state
  const majorName = getMajor(major)?.name
  if (hasDegree)
    return { emoji: '🎓', title: `${majorName ?? 'University'} graduate`, subtitle: 'Degree earned' }
  if (inUniversity)
    return {
      emoji: '🏛️',
      title: `University — ${majorName ?? '...'}`,
      subtitle: `${uniYearsLeft} year${uniYearsLeft === 1 ? '' : 's'} to go · $${TUITION_PER_YEAR.toLocaleString()}/yr tuition`,
    }
  if (age < 6) return { emoji: '🧸', title: 'Too young for school', subtitle: 'Enjoy it while it lasts' }
  if (age < 12) return { emoji: '🎒', title: 'Primary school', subtitle: 'Student' }
  if (age < 15) return { emoji: '📗', title: 'Middle school', subtitle: 'Student' }
  if (age < 18) return { emoji: '📘', title: 'High school', subtitle: 'Student' }
  return { emoji: '📜', title: 'High school graduate', subtitle: 'No degree yet' }
}

function jobBlocker(
  job: Job,
  age: number,
  smarts: number,
  hasDegree: boolean,
  major: string | null,
): string | null {
  if (age < job.minAge) return `age ${job.minAge}+`
  if (job.requiredMajor && major !== job.requiredMajor)
    return `${getMajor(job.requiredMajor)?.name ?? job.requiredMajor} degree required`
  if (job.requiresDegree && !hasDegree) return 'university degree required'
  if (smarts < job.minSmarts) return `${job.minSmarts} smarts required`
  return null
}

interface Interview {
  job: Job
  question: JobQuestion
}

export function CareerScreen() {
  const age = useGameStore((s) => s.age)
  const stats = useGameStore((s) => s.stats)
  const jobId = useGameStore((s) => s.jobId)
  const hasDegree = useGameStore((s) => s.hasDegree)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const uniYearsLeft = useGameStore((s) => s.uniYearsLeft)
  const major = useGameStore((s) => s.major)
  const jobOpenings = useGameStore((s) => s.jobOpenings)
  const usedActions = useGameStore((s) => s.usedActions)
  const applyForJob = useGameStore((s) => s.applyForJob)
  const failInterview = useGameStore((s) => s.failInterview)
  const quitJob = useGameStore((s) => s.quitJob)
  const openUniversityApplication = useGameStore((s) => s.openUniversityApplication)
  const studyHarder = useGameStore((s) => s.studyHarder)
  const hangWithClassmates = useGameStore((s) => s.hangWithClassmates)
  const askTeacherForHelp = useGameStore((s) => s.askTeacherForHelp)

  const [interview, setInterview] = useState<Interview | null>(null)

  const currentJob = getJob(jobId)
  const inSchool = isInSchool(age) || inUniversity
  const edu = educationLabel({ age, hasDegree, inUniversity, uniYearsLeft, major })
  const workingAge = age >= 16

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
    } else {
      playSfx('fail')
      failInterview(interview.job.id)
    }
    setInterview(null)
  }

  const action = (run: () => void) => () => {
    playSfx('click')
    run()
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>{inSchool ? '🎓 SCHOOL' : '🎓 EDUCATION'}</Text>
      <Row emoji={edu.emoji} title={edu.title} subtitle={edu.subtitle} />

      {inSchool && (
        <>
          <Row
            emoji="📖"
            title="Study harder"
            subtitle={usedActions.includes('study') ? 'Done this year' : '+ smarts'}
            onPress={action(studyHarder)}
            disabled={usedActions.includes('study')}
            chevron
          />
          <Row
            emoji="🎒"
            title="Hang out with classmates"
            subtitle={usedActions.includes('classmates') ? 'Done this year' : '+ happiness, maybe a friend'}
            onPress={action(hangWithClassmates)}
            disabled={usedActions.includes('classmates')}
            chevron
          />
          <Row
            emoji="🍎"
            title="Ask a teacher for help"
            subtitle={usedActions.includes('teacher') ? 'Done this year' : '+ smarts'}
            onPress={action(askTeacherForHelp)}
            disabled={usedActions.includes('teacher')}
            chevron
          />
        </>
      )}

      {age >= 18 && !hasDegree && !inUniversity && (
        <Row
          emoji="🏛️"
          title="Apply to university"
          subtitle={`Pick a major · ${UNIVERSITY_YEARS} years · $${TUITION_PER_YEAR.toLocaleString()}/yr`}
          onPress={action(openUniversityApplication)}
          chevron
        />
      )}

      {workingAge && (
        <>
          <Text style={styles.sectionHeading}>💼 CURRENT JOB</Text>
          {currentJob ? (
            <>
              <Row
                emoji={currentJob.emoji}
                title={currentJob.title}
                subtitle={`$${currentJob.salary.toLocaleString()}/year`}
              />
              <Row emoji="🚪" title="Quit job" subtitle="Walk away" onPress={action(quitJob)} chevron />
            </>
          ) : (
            <Row emoji="🛋️" title="Unemployed" subtitle="Check the listings below" />
          )}

          <Text style={styles.sectionHeading}>📋 JOB LISTINGS · HIRING THIS YEAR</Text>
          <Text style={styles.hint}>
            Openings rotate every year. Applying means one interview question — don’t blow it.
          </Text>
          {openings.map((job) => {
            const blocker = jobBlocker(job, age, stats.smarts, hasDegree, major)
            const isCurrent = job.id === jobId
            return (
              <Row
                key={job.id}
                emoji={job.emoji}
                title={job.title}
                subtitle={`$${job.salary.toLocaleString()}/yr${blocker ? ` · 🔒 ${blocker}` : ''}`}
                onPress={() => startInterview(job)}
                disabled={blocker !== null || isCurrent}
                right={
                  <View style={[styles.applyPill, (blocker !== null || isCurrent) && styles.applyPillLocked]}>
                    <Text style={styles.applyPillText}>{isCurrent ? 'Hired' : blocker ? '🔒' : 'Apply'}</Text>
                  </View>
                }
              />
            )
          })}
        </>
      )}

      {!workingAge && (
        <>
          <Text style={styles.sectionHeading}>💼 JOBS</Text>
          <Row emoji="⏳" title="Too young to work" subtitle="Come back when you turn 16" />
        </>
      )}

      {interview && (
        <InterviewModal
          job={interview.job}
          question={interview.question}
          onAnswer={answerInterview}
          onCancel={() => setInterview(null)}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 8,
    paddingBottom: 110,
  },
  sectionHeading: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate500,
  },
  hint: {
    fontSize: 12,
    color: colors.slate500,
    marginBottom: 2,
  },
  applyPill: {
    backgroundColor: colors.cyan500,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  applyPillLocked: {
    backgroundColor: colors.slate200,
  },
  applyPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
})
