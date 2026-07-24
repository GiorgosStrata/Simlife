import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { playSfx } from '../audio/sfx'
import { tuitionPerYear } from '../data/economy'
import { jobSport } from '../data/leagues'
import { getMajor } from '../data/majors'
import { YEARS_PER_PROMOTION } from '../data/economy'
import {
  UNIVERSITY_YEARS,
  annualSalary,
  getJob,
  isInSchool,
  jobTierNames,
  jobTitle,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { JobListingsModal } from './JobListingsModal'
import { PrisonModal } from './PrisonModal'
import { Row } from './Row'
import { SchoolModal } from './SchoolModal'
import { SectionHeading } from './SectionHeading'
import { SpecialJobsModal } from './SpecialJobsModal'
import { SportsHubModal } from './SportsHubModal'
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
  const jobTier = useGameStore((s) => s.jobTier)
  const yearsInJob = useGameStore((s) => s.yearsInJob)
  const raisePercent = useGameStore((s) => s.raisePercent)
  const pension = useGameStore((s) => s.pension)
  const quitJob = useGameStore((s) => s.quitJob)
  const retire = useGameStore((s) => s.retire)
  const showToast = useGameStore((s) => s.showToast)
  const openUniversityApplication = useGameStore((s) => s.openUniversityApplication)

  const [browsingJobs, setBrowsingJobs] = useState(false)
  const [visitingSchool, setVisitingSchool] = useState(false)
  const [visitingWork, setVisitingWork] = useState(false)
  const [visitingTeam, setVisitingTeam] = useState(false)
  const [specialJobs, setSpecialJobs] = useState(false)
  const [visitingPrison, setVisitingPrison] = useState(false)
  const prison = useGameStore((s) => s.prison)

  const currentJob = getJob(jobId)
  const isSport = jobSport(jobId) !== null
  // A little "next promotion" nudge so a career shows momentum, not a dead end.
  // (Sports careers progress by on-field performance, so we skip it there.)
  let promoHint = ''
  if (currentJob && !isSport) {
    const ladder = jobTierNames(currentJob)
    if (jobTier >= ladder.length - 1) {
      promoHint = ' · 🏆 Top of the ladder'
    } else {
      const yrs = YEARS_PER_PROMOTION - (yearsInJob % YEARS_PER_PROMOTION)
      promoHint = ` · ↑ ${ladder[jobTier + 1]} in ${yrs} yr${yrs === 1 ? '' : 's'}`
    }
  }
  const inSchool = isInSchool(age) || inUniversity
  const edu = educationRow({ age, hasDegree, inUniversity, uniYearsLeft, major, schoolName })
  const workingAge = age >= 16

  const action = (run: () => void) => () => {
    playSfx('click')
    run()
  }
  // Retiring pops the confirmation bubble and returns to the Dashboard.
  const confirm = confirmAction()

  if (prison) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeading color={colors.rose500}>🔒 INCARCERATED</SectionHeading>
        <Row
          emoji="🔒"
          title="Prison"
          subtitle={`${prison.yearsLeft} year${prison.yearsLeft === 1 ? '' : 's'} left · ${prison.crime} · tap to do your time`}
          onPress={action(() => setVisitingPrison(true))}
          chevron
        />
        {visitingPrison && <PrisonModal onClose={() => setVisitingPrison(false)} />}
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <SectionHeading color={colors.sky500}>🎓 EDUCATION</SectionHeading>
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
          subtitle={`Pick a major · ${UNIVERSITY_YEARS} years · $${tuitionPerYear(countryCode).toLocaleString()}/yr`}
          onPress={action(openUniversityApplication)}
          chevron
        />
      )}

      <SectionHeading color={colors.cyan500}>💼 WORK</SectionHeading>
      {currentJob ? (
        <>
          <Row
            emoji={currentJob.emoji}
            title={jobTitle(currentJob, jobTier)}
            subtitle={`$${annualSalary(currentJob, jobTier, raisePercent, countryCode).toLocaleString()}/yr${promoHint}`}
            onPress={action(() => (isSport ? setVisitingTeam(true) : setVisitingWork(true)))}
            chevron
          />
          {!isSport && (
            <Row emoji="🚪" title="Quit job" subtitle="Walk away" onPress={action(quitJob)} chevron />
          )}
          {!isSport && age >= 55 && (
            <Row
              emoji="🌴"
              title="Retire"
              subtitle="Draw a pension and a nest egg — more if you retire later"
              onPress={confirm(retire, null)}
              chevron
            />
          )}
        </>
      ) : pension > 0 ? (
        <Row
          emoji="🌴"
          title="Retired"
          subtitle={`Drawing a pension of $${pension.toLocaleString()}/year`}
        />
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

      {workingAge && (
        <>
          <SectionHeading color={colors.amber400}>🌟 SPECIAL JOBS</SectionHeading>
          <Row
            emoji="🌟"
            title="Fame & fortune"
            subtitle="Athlete or entertainer careers — coming soon"
            onPress={action(() => showToast('Special jobs are coming soon! 🚧'))}
            chevron
          />
        </>
      )}

      {browsingJobs && <JobListingsModal onClose={() => setBrowsingJobs(false)} />}
      {visitingSchool && <SchoolModal onClose={() => setVisitingSchool(false)} />}
      {visitingWork && <WorkplaceModal onClose={() => setVisitingWork(false)} />}
      {visitingTeam && <SportsHubModal onClose={() => setVisitingTeam(false)} />}
      {specialJobs && <SpecialJobsModal onClose={() => setSpecialJobs(false)} />}
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
})
