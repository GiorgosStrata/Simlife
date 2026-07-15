import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getMajor } from '../data/majors'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { PersonModal, personEmoji } from './PersonModal'
import { Row } from './Row'

interface SchoolModalProps {
  onClose: () => void
}

/** BitLife-style school screen: your school, your actions, your classroom. */
export function SchoolModal({ onClose }: SchoolModalProps) {
  const schoolName = useGameStore((s) => s.schoolName)
  const inUniversity = useGameStore((s) => s.inUniversity)
  const uniYearsLeft = useGameStore((s) => s.uniYearsLeft)
  const major = useGameStore((s) => s.major)
  const usedActions = useGameStore((s) => s.usedActions)
  const relationships = useGameStore((s) => s.relationships)
  const studyHarder = useGameStore((s) => s.studyHarder)

  const [personId, setPersonId] = useState<string | null>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const classmates = relationships.filter((p) => p.role === 'classmate' && p.alive)
  const teachers = relationships.filter((p) => p.role === 'teacher' && p.alive)

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
              onPress={() => {
                playSfx('click')
                studyHarder()
              }}
              disabled={usedActions.includes('study')}
              chevron
            />

            <Text style={styles.sectionHeading}>🧑‍🎓 CLASSMATES</Text>
            {classmates.length === 0 && (
              <Text style={styles.empty}>No classmates right now.</Text>
            )}
            {classmates.map((p) => (
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

            <Text style={styles.sectionHeading}>🧑‍🏫 TEACHERS</Text>
            {teachers.length === 0 && <Text style={styles.empty}>No teachers right now.</Text>}
            {teachers.map((p) => (
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
