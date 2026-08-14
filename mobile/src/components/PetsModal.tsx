import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { PetModal } from './PetModal'
import { PetShopModal } from './PetShopModal'
import { Row } from './Row'
import { SectionHeading } from './SectionHeading'
import { useCloseOnAction } from './useCloseOnAction'

interface PetsModalProps {
  onClose: () => void
}

/** Your pets: a hub to adopt new ones and care for the ones you have. */
export function PetsModal({ onClose }: PetsModalProps) {
  const pets = useGameStore((s) => s.pets)
  const [shopping, setShopping] = useState(false)
  const [petId, setPetId] = useState<string | null>(null)
  useCloseOnAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🐾 Pets</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Row
              emoji="🏠"
              title="Adopt a pet"
              subtitle="Dogs, cats, birds & more"
              onPress={() => {
                playSfx('click')
                setShopping(true)
              }}
              chevron
            />

            <SectionHeading color={colors.emerald700}>YOUR PETS</SectionHeading>
            {pets.length === 0 && <Text style={styles.empty}>No pets yet — adopt one above.</Text>}
            {pets.map((pet) => (
              <Row
                key={pet.id}
                emoji={pet.emoji}
                title={pet.name}
                subtitle={`${pet.breed} · age ${pet.age} · Bond ${pet.bond}`}
                onPress={() => {
                  playSfx('click')
                  setPetId(pet.id)
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

      {shopping && <PetShopModal onClose={() => setShopping(false)} />}
      {petId && <PetModal petId={petId} onClose={() => setPetId(null)} />}
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
  list: { marginTop: 12 },
  listContent: { gap: 8, paddingBottom: 8 },
  empty: { fontSize: 13, color: colors.slate400, paddingVertical: 6 },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
