import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getPetOption } from '../data/pets'
import { scaleByCountry } from '../data/countries'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'

interface PetModalProps {
  petId: string
  onClose: () => void
}

/** A single pet: care for it, play, teach tricks, or rehome. */
export function PetModal({ petId, onClose }: PetModalProps) {
  const pet = useGameStore((s) => s.pets.find((p) => p.id === petId))
  const money = useGameStore((s) => s.money)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const playWithPet = useGameStore((s) => s.playWithPet)
  const feedPet = useGameStore((s) => s.feedPet)
  const walkPet = useGameStore((s) => s.walkPet)
  const vetPet = useGameStore((s) => s.vetPet)
  const teachTrick = useGameStore((s) => s.teachTrick)
  const rehomePet = useGameStore((s) => s.rehomePet)

  useEffect(() => {
    playSfx('pop')
  }, [])

  if (!pet) return null

  const opt = getPetOption(pet.optionId)
  const used = (k: string) => usedActions.includes(`${k}-${petId}`)
  const vetCost = scaleByCountry(150, countryCode)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{pet.emoji}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.meta}>
                {pet.breed} · age {pet.age}
              </Text>
            </View>
          </View>

          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Bond</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pet.bond}%`, backgroundColor: colors.pink600 }]} />
            </View>
            <Text style={styles.barValue}>{pet.bond}</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Mood</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pet.happiness}%`, backgroundColor: colors.amber400 }]} />
            </View>
            <Text style={styles.barValue}>{pet.happiness}</Text>
          </View>

          <ScrollView style={styles.actions} contentContainerStyle={styles.actionsContent}>
            <Row
              emoji="🎾"
              title="Play together"
              subtitle={used('pet-play') ? 'Done this year' : '+ bond, + mood, + happiness'}
              onPress={() => playWithPet(petId)}
              disabled={used('pet-play')}
              chevron
            />
            <Row
              emoji="🦴"
              title="Give a treat ($10)"
              subtitle={used('pet-feed') ? 'Done this year' : money < 10 ? 'Not enough money' : '+ mood, + bond'}
              onPress={() => feedPet(petId)}
              disabled={used('pet-feed') || money < 10}
              chevron
            />
            {opt?.walkable && (
              <Row
                emoji="🐾"
                title="Go for a walk"
                subtitle={used('pet-walk') ? 'Done this year' : '+ your health, + bond'}
                onPress={() => walkPet(petId)}
                disabled={used('pet-walk')}
                chevron
              />
            )}
            <Row
              emoji="🩺"
              title={`Vet visit ($${vetCost.toLocaleString()})`}
              subtitle={used('pet-vet') ? 'Done this year' : money < vetCost ? 'Not enough money' : 'Restores mood/health'}
              onPress={() => vetPet(petId)}
              disabled={used('pet-vet') || money < vetCost}
              chevron
            />
            <Row
              emoji="🎓"
              title="Teach a trick"
              subtitle={used('pet-trick') ? 'Done this year' : '60% it sticks · + bond'}
              onPress={() => teachTrick(petId)}
              disabled={used('pet-trick')}
              chevron
            />
            <Row
              emoji="📦"
              title="Rehome"
              subtitle="Give your pet away"
              onPress={() => {
                rehomePet(petId)
                onClose()
              }}
              chevron
            />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 27 },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: colors.slate800 },
  meta: { fontSize: 13, color: colors.slate500, marginTop: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  barLabel: { width: 40, fontSize: 12, fontWeight: '700', color: colors.slate600 },
  track: { flex: 1, height: 12, borderRadius: 999, backgroundColor: colors.slate200, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  barValue: {
    width: 28,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
  actions: { marginTop: 14 },
  actionsContent: { gap: 8, paddingBottom: 4 },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
