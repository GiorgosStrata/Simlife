import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Person, PersonRole } from '../types'
import { PersonAvatar } from './Avatar'
import { FamilyTreeModal } from './FamilyTreeModal'
import { PersonModal, roleLabel } from './PersonModal'
import { PetsModal } from './PetsModal'
import { Row } from './Row'
import { SectionHeading } from './SectionHeading'

/** People grouped into the three sections the player cares about. */
const GROUPS: Array<{ title: string; color: string; roles: PersonRole[] }> = [
  { title: 'RELATIONSHIPS', color: colors.pink600, roles: ['partner', 'ex', 'fling'] },
  { title: 'FAMILY', color: colors.sky500, roles: ['mother', 'father', 'sibling', 'child'] },
  { title: 'FRIENDS', color: colors.emerald700, roles: ['friend'] },
  { title: 'ENEMIES', color: colors.rose700, roles: ['enemy'] },
]

/** Clean BitLife-style list: tap a person to open their interaction sheet. */
export function RelationshipsScreen() {
  const relationships = useGameStore((s) => s.relationships)
  const partnerStatus = useGameStore((s) => s.partnerStatus)

  const [personId, setPersonId] = useState<string | null>(null)
  const [treeOpen, setTreeOpen] = useState(false)
  const [petsOpen, setPetsOpen] = useState(false)
  const generation = useGameStore((s) => s.generation)
  const ancestors = useGameStore((s) => s.ancestors)
  const petCount = useGameStore((s) => s.pets.length)

  const renderPerson = (person: Person) => (
    <Row
      key={person.id}
      emoji="🙂"
      avatar={<PersonAvatar person={person} />}
      title={person.name}
      subtitle={
        person.alive
          ? `${roleLabel(person, partnerStatus)} · age ${person.age} · Bond ${person.relationship}`
          : `${roleLabel(person, partnerStatus)} · passed away at ${person.age}`
      }
      onPress={
        person.alive
          ? () => {
              playSfx('click')
              setPersonId(person.id)
            }
          : undefined
      }
      disabled={!person.alive}
      chevron={person.alive}
      right={
        person.alive ? (
          <View style={styles.bondPill}>
            <View
              style={styles.bondTrack}
              accessibilityRole="progressbar"
              accessibilityLabel={`Bond with ${person.name}`}
              accessibilityValue={{ min: 0, max: 100, now: person.relationship }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={person.relationship}
            >
              <View style={[styles.bondFill, { width: `${person.relationship}%` }]} />
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        ) : undefined
      }
    />
  )

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Row
        emoji="🐾"
        title="Pets"
        subtitle={petCount > 0 ? `${petCount} pet${petCount === 1 ? '' : 's'} · adopt & care` : 'Adopt a furry (or scaly) friend'}
        onPress={() => {
          playSfx('click')
          setPetsOpen(true)
        }}
        chevron
      />
      <Row
        emoji="🌳"
        title="Family tree"
        subtitle={
          generation > 1
            ? `Generation ${generation} · ${ancestors.length} ancestor${ancestors.length === 1 ? '' : 's'}`
            : 'Your bloodline starts with you'
        }
        onPress={() => {
          playSfx('click')
          setTreeOpen(true)
        }}
        chevron
      />

      {GROUPS.map((group) => {
        const members = relationships
          .filter((p) => group.roles.includes(p.role))
          // Living first, then by role order within the group.
          .sort(
            (a, b) =>
              Number(b.alive) - Number(a.alive) ||
              group.roles.indexOf(a.role) - group.roles.indexOf(b.role),
          )
        if (members.length === 0) return null
        return (
          <View key={group.title} style={styles.group}>
            <SectionHeading color={group.color}>{group.title}</SectionHeading>
            {members.map(renderPerson)}
          </View>
        )
      })}

      {personId && <PersonModal personId={personId} onClose={() => setPersonId(null)} />}
      {treeOpen && <FamilyTreeModal onClose={() => setTreeOpen(false)} />}
      {petsOpen && <PetsModal onClose={() => setPetsOpen(false)} />}
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
  group: {
    gap: 8,
  },
  bondPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bondTrack: {
    width: 52,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  bondFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.pink600,
  },
  chevron: {
    fontSize: 24,
    color: colors.slate400,
    fontWeight: '600',
  },
})
