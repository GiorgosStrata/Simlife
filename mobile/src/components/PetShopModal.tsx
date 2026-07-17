import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { PET_CATALOG } from '../data/pets'
import { scaleByCountry } from '../data/countries'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'

interface PetShopModalProps {
  onClose: () => void
}

/** Adopt a pet from the shop. */
export function PetShopModal({ onClose }: PetShopModalProps) {
  const money = useGameStore((s) => s.money)
  const countryCode = useGameStore((s) => s.countryCode)
  const adoptPet = useGameStore((s) => s.adoptPet)

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🐾 Adopt a Pet</Text>
          <Text style={styles.subtitle}>Every pet needs food and vet care each year.</Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {PET_CATALOG.map((opt) => {
              const tooPoor = money < opt.price
              const upkeep = scaleByCountry(opt.upkeep, countryCode)
              return (
                <Row
                  key={opt.id}
                  emoji={opt.emoji}
                  title={`${opt.breed}`}
                  subtitle={`${opt.species} · $${opt.price.toLocaleString()} · upkeep $${upkeep.toLocaleString()}/yr`}
                  onPress={() => {
                    adoptPet(opt.id)
                    onClose()
                  }}
                  disabled={tooPoor}
                  right={
                    <View style={[styles.pill, tooPoor && styles.pillOff]}>
                      <Text style={styles.pillText}>{tooPoor ? '🔒' : 'Adopt'}</Text>
                    </View>
                  }
                />
              )
            })}
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
  pill: { backgroundColor: colors.emerald700, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillOff: { backgroundColor: colors.slate200 },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.onColor },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
