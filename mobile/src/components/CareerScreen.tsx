import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getMajor } from '../data/majors'
import {
  TUITION_PER_YEAR,
  UNIVERSITY_YEARS,
  getJob,
  isInSchool,
  jobSalary,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import { JobListingsModal } from './JobListingsModal'
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

/** Clean BitLife-style menu: a few rows, details behind submenus. */
export function CareerScreen() {
  const age = useGameStore((s) => s.age)
  const jobId = useGameStore((s) => s.jobId)
  const hasDegree = useGameStore((s) => s.hasDegree)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const uniYearsLeft = useGameStore((s) => s.uniYearsLeft)
  const major = useGameStore((s) => s.major)
  const countryCode = useGameStore((s) => s.countryCode)
  const jobOpenings = useGameStore((s) => s.jobOpenings)
  const usedActions = useGameStore((s) => s.usedActions)
  const quitJob = useGameStore((s) => s.quitJob)
  const openUniversityApplication = useGameStore((s) => s.openUniversityApplication)
  const studyHarder = useGameStore((s) => s.studyHarder)
  const hangWithClassmates = useGameStore((s) => s.hangWithClassmates)
  const askTeacherForHelp = useGameStore((s) => s.askTeacherForHelp)

  const [browsingJobs, setBrowsingJobs] = useState(false)

  const currentJob = getJob(jobId)
  const inSchool = isInSchool(age) || inUniversity
  const edu = educationLabel({ age, hasDegree, inUniversity, uniYearsLeft, major })
  const workingAge = age >= 16

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

      <Text style={styles.sectionHeading}>💼 WORK</Text>
      {currentJob ? (
        <>
          <Row
            emoji={currentJob.emoji}
            title={currentJob.title}
            subtitle={`$${jobSalary(currentJob, countryCode).toLocaleString()}/year`}
          />
          <Row emoji="🚪" title="Quit job" subtitle="Walk away" onPress={action(quitJob)} chevron />
        </>
      ) : (
        <Row
          emoji="🛋️"
          title="Unemployed"
          subtitle={workingAge ? 'Time to find a job' : 'Too young to work — jobs unlock at 16'}
        />
      )}
      {workingAge && (
        <Row
          emoji="🔍"
          title="Find a job"
          subtitle={`${jobOpenings.length} openings this year`}
          onPress={action(() => setBrowsingJobs(true))}
          chevron
        />
      )}

      {browsingJobs && <JobListingsModal onClose={() => setBrowsingJobs(false)} />}
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
})
