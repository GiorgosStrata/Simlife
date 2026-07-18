import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getMajor } from '../data/majors'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { PersonAvatar } from './Avatar'
import { PersonModal } from './PersonModal'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface SchoolModalProps {
  onClose: () => void
}

const SCHOOL_SPORTS = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Track', emoji: '🏃' },
  { name: 'Swimming', emoji: '🏊' },
]

/** BitLife-style school screen: your school, your actions, your classroom. */
export function SchoolModal({ onClose }: SchoolModalProps) {
  const age = useGameStore((s) => s.age)
  const schoolName = useGameStore((s) => s.schoolName)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const uniYearsLeft = useGameStore((s) => s.uniYearsLeft)
  const major = useGameStore((s) => s.major)
  const usedActions = useGameStore((s) => s.usedActions)
  const relationships = useGameStore((s) => s.relationships)
  const athletics = useGameStore((s) => s.athletics)
  const schoolSport = useGameStore((s) => s.schoolSport)
  const studyHarder = useGameStore((s) => s.studyHarder)
  const tryoutSchoolTeam = useGameStore((s) => s.tryoutSchoolTeam)
  const trainWithTeam = useGameStore((s) => s.trainWithTeam)
  const quitSchoolTeam = useGameStore((s) => s.quitSchoolTeam)

  const [personId, setPersonId] = useState<string | null>(null)
  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const classmates = relationships.filter((p) => p.role === 'classmate' && p.alive)
  const teachers = relationships.filter((p) => p.role === 'teacher' && p.alive)
  // School sports only for actual school (not university), from age 8.
  const canDoSchoolSports = !inUniversity && age >= 8 && age < 18
  const talentHint =
    athletics >= 70 ? 'Scouts love your talent' : athletics >= 45 ? 'You have a decent shot' : 'A long shot — keep training'
  const trainedThisYear = usedActions.includes('team-train')
  const triedOutThisYear = usedActions.includes('school-tryout')

  const subtitle = inUniversity
    ? `Studying ${getMajor(major)?.name ?? '...'} · ${uniYearsLeft} year${uniYearsLeft === 1 ? '' : 's'} to go`
    : 'Your school'

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {inUniversity ? '🏛️' : '🏫'} {schoolName ?? 'School'}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Row
              emoji="📖"
              title="Study harder"
              subtitle={usedActions.includes('study') ? 'Done this year' : '+ smarts'}
              onPress={act(studyHarder)}
              disabled={usedActions.includes('study')}
              chevron
            />

            {canDoSchoolSports && (
              <>
                <Text style={styles.sectionHeading}>🏅 SCHOOL SPORTS</Text>
                {schoolSport ? (
                  <>
                    <Row
                      emoji="🏅"
                      title={`Train with the ${schoolSport.toLowerCase()} team`}
                      subtitle={trainedThisYear ? 'Done this year' : `${talentHint} · builds athletic talent`}
                      onPress={act(trainWithTeam, null)}
                      disabled={trainedThisYear}
                      chevron
                    />
                    <Row
                      emoji="🚪"
                      title="Leave the team"
                      subtitle="Hang up your jersey"
                      onPress={act(quitSchoolTeam)}
                      chevron
                    />
                  </>
                ) : (
                  SCHOOL_SPORTS.map((sp) => (
                    <Row
                      key={sp.name}
                      emoji={sp.emoji}
                      title={`Try out: ${sp.name}`}
                      subtitle={triedOutThisYear ? 'You tried out this year' : talentHint}
                      onPress={act(() => tryoutSchoolTeam(sp.name), null)}
                      disabled={triedOutThisYear}
                      chevron
                    />
                  ))
                )}
              </>
            )}

            <Text style={styles.sectionHeading}>🧑‍🎓 CLASSMATES</Text>
            {classmates.length === 0 && (
              <Text style={styles.empty}>No classmates right now.</Text>
            )}
            {classmates.map((p) => (
              <Row
                key={p.id}
                emoji="🙂"
                avatar={<PersonAvatar person={p} />}
                title={p.name}
                subtitle={`Bond ${p.relationship}`}
                onPress={() => {
                  playSfx('click')
                  setPersonId(p.id)
                }}
                chevron
              />
            ))}

            <Text style={styles.sectionHeading}>🧑‍🏫 TEACHERS</Text>
            {teachers.length === 0 && <Text style={styles.empty}>No teachers right now.</Text>}
            {teachers.map((p) => (
              <Row
                key={p.id}
                emoji="🙂"
                avatar={<PersonAvatar person={p} />}
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
