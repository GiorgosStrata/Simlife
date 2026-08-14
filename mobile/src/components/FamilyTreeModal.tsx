import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Avatar, PersonAvatar } from './Avatar'
import { Row } from './Row'
import { SectionHeading } from './SectionHeading'

interface FamilyTreeModalProps {
  onClose: () => void
}

/** The bloodline: past generations (ancestors), you, and your children. */
export function FamilyTreeModal({ onClose }: FamilyTreeModalProps) {
  const name = useGameStore((s) => s.name)
  const gender = useGameStore((s) => s.gender)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const avatarConfig = useGameStore((s) => s.avatarConfig)
  const generation = useGameStore((s) => s.generation)
  const ancestors = useGameStore((s) => s.ancestors)
  const relationships = useGameStore((s) => s.relationships)

  const children = relationships.filter((p) => p.role === 'child')

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🌳 Family Tree</Text>
          <Text style={styles.subtitle}>
            Generation {generation} of your bloodline.
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {ancestors.length > 0 && (
              <SectionHeading color={colors.violet500}>ANCESTORS</SectionHeading>
            )}
            {ancestors.map((a, i) => (
              <Row
                key={`${a.name}-${i}`}
                emoji="🕯️"
                avatar={<Avatar seed={a.name} gender={a.gender} age={a.ageAtDeath} alive={false} />}
                title={a.name}
                subtitle={`Gen ${a.generation} · ${a.bornYear}–${a.diedYear} · lived ${a.ageAtDeath} years`}
              />
            ))}

            <SectionHeading color={colors.cyan500}>YOU</SectionHeading>
            <Row
              emoji="🙂"
              avatar={
                <View style={styles.you}>
                  <Avatar config={avatarConfig} age={age} size={44} />
                </View>
              }
              title={`${name} (you)`}
              subtitle={`Gen ${generation} · age ${age} · born ${year - age}`}
            />

            {children.length > 0 && (
              <SectionHeading color={colors.pink600}>CHILDREN</SectionHeading>
            )}
            {children.map((c) => (
              <Row
                key={c.id}
                emoji="🙂"
                avatar={<PersonAvatar person={c} />}
                title={c.name}
                subtitle={
                  c.alive
                    ? `${c.gender === 'male' ? 'Son' : 'Daughter'} · age ${c.age}`
                    : `${c.gender === 'male' ? 'Son' : 'Daughter'} · passed away at ${c.age}`
                }
              />
            ))}
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
  subtitle: { marginTop: 2, fontSize: 13, color: colors.slate500 },
  list: { marginTop: 12 },
  listContent: { gap: 8, paddingBottom: 8 },
  you: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.cyan500,
  },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
