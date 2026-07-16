import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getAsset } from '../data/assets'
import { MAX_FRIENDS, useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Person } from '../types'
import { PersonAvatar } from './Avatar'
import { PersonModal, roleLabel } from './PersonModal'
import { PhoneModal } from './PhoneModal'
import { Row } from './Row'

const SECTION_ORDER: Person['role'][] = ['partner', 'mother', 'father', 'sibling', 'friend']

/** Clean BitLife-style list: tap a person to open their interaction sheet. */
export function RelationshipsScreen() {
  const age = useGameStore((s) => s.age)
  const relationships = useGameStore((s) => s.relationships)
  const partnerStatus = useGameStore((s) => s.partnerStatus)
  const findLove = useGameStore((s) => s.findLove)
  const ownedAssetIds = useGameStore((s) => s.ownedAssetIds)

  const [personId, setPersonId] = useState<string | null>(null)
  const [phoneOpen, setPhoneOpen] = useState(false)

  const hasPhone = ownedAssetIds.some((id) => getAsset(id)?.category === 'phone')

  const people = relationships
    .filter((p) => SECTION_ORDER.includes(p.role))
    .sort((a, b) => SECTION_ORDER.indexOf(a.role) - SECTION_ORDER.indexOf(b.role))

  const hasPartner = relationships.some((p) => p.id === 'partner')

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Row
        emoji="📱"
        title="Phone"
        subtitle={
          hasPhone
            ? 'Open social media, dating & investing apps'
            : 'Buy a phone in the Shop to unlock apps'
        }
        onPress={
          hasPhone
            ? () => {
                playSfx('click')
                setPhoneOpen(true)
              }
            : undefined
        }
        disabled={!hasPhone}
        chevron={hasPhone}
      />
      {age >= 18 && !hasPartner && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            playSfx('click')
            findLove()
          }}
          style={({ pressed }) => [styles.bigButton, pressed && styles.bigButtonPressed]}
        >
          <Text style={styles.bigButtonText}>💘 Find Love</Text>
        </Pressable>
      )}
      {people.map((person) => (
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
      ))}

      {personId && <PersonModal personId={personId} onClose={() => setPersonId(null)} />}
      {phoneOpen && <PhoneModal onClose={() => setPhoneOpen(false)} />}
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
  bigButton: {
    backgroundColor: colors.cyan500,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  friendButton: {
    backgroundColor: colors.cyan600,
  },
  bigButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  bigButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
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
