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
import { SchoolModal } from './SchoolModal'
import { WorkplaceModal } from './WorkplaceModal'

function educationRow(state: {
  age: number
  hasDegree: boolean
  inUniversity: boolean
  uniYearsLeft: number
  major: string | null
  schoolName: string | null
}): { emoji: string; title: string; subtitle: string } {
  const { age, hasDegree, inUniversity, uniYearsLeft, major, schoolName } = state
  const majorName = getMajor(major)?.name
  if (inUniversity)
    return {
      emoji: '🏛️',
      title: schoolName ?? 'University',
      subtitle: `${majorName ?? '...'} · ${uniYearsLeft} year${uniYearsLeft === 1 ? '' : 's'} to go`,
    }
  if (isInSchool(age))
    return {
      emoji: age < 12 ? '🎒' : age < 15 ? '📗' : '📘',
      title: schoolName ?? 'School',
      subtitle: 'Tap to visit your school',
    }
  if (hasDegree)
    return { emoji: '🎓', title: `${majorName ?? 'University'} graduate`, subtitle: 'Degree earned' }
  if (age < 6) return { emoji: '🧸', title: 'Too young for school', subtitle: 'Enjoy it while it lasts' }
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
  const schoolName = useGameStore((s) => s.schoolName)
  const countryCode = useGameStore((s) => s.countryCode)
  const jobOpenings = useGameStore((s) => s.jobOpenings)
  const raisePercent = useGameStore((s) => s.raisePercent)
  const quitJob = useGameStore((s) => s.quitJob)
  const openUniversityApplication = useGameStore((s) => s.openUniversityApplication)

  const [browsingJobs, setBrowsingJobs] = useState(false)
  const [visitingSchool, setVisitingSchool] = useState(false)
  const [visitingWork, setVisitingWork] = useState(false)

  const currentJob = getJob(jobId)
  const inSchool = isInSchool(age) || inUniversity
  const edu = educationRow({ age, hasDegree, inUniversity, uniYearsLeft, major, schoolName })
  const workingAge = age >= 16

  const action = (run: () => void) => () => {
    playSfx('click')
    run()
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>🎓 EDUCATION</Text>
      <Row
        emoji={edu.emoji}
        title={edu.title}
        subtitle={edu.subtitle}
        onPress={inSchool ? action(() => setVisitingSchool(true)) : undefined}
        chevron={inSchool}
      />

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
            subtitle={`$${Math.round(jobSalary(currentJob, countryCode) * (1 + raisePercent / 100)).toLocaleString()}/year · Tap to visit your workplace`}
            onPress={action(() => setVisitingWork(true))}
            chevron
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
      {visitingSchool && <SchoolModal onClose={() => setVisitingSchool(false)} />}
      {visitingWork && <WorkplaceModal onClose={() => setVisitingWork(false)} />}
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
