import { useEffect } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { homeRent } from '../data/assets'
import { assetUpkeep } from '../data/economy'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface HomeModalProps {
  homeId: string
  onClose: () => void
}

/** Decide what to do with a house you own: live in it, or rent it out & sell. */
export function HomeModal({ homeId, onClose }: HomeModalProps) {
  const home = useGameStore((s) => s.homes.find((h) => h.id === homeId))
  const residenceId = useGameStore((s) => s.residenceId)
  const setResidence = useGameStore((s) => s.setResidence)
  const sellHome = useGameStore((s) => s.sellHome)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  if (!home) return null
  const isResidence = residenceId === home.id
  const upkeep = assetUpkeep(home.price, 'home')

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {home.emoji} {home.name}
          </Text>
          <Text style={styles.subtitle}>
            {isResidence ? '🏠 You live here' : `💰 Rented out · $${homeRent(home.price).toLocaleString()}/yr`}
            {home.size ? ` · houses ${home.size}` : ''} · upkeep ${upkeep.toLocaleString()}/yr
          </Text>

          <View style={styles.list}>
            {!isResidence && (
              <Row
                emoji="🏠"
                title="Live here"
                subtitle="Move in — you'll rent out your old place instead"
                onPress={act(() => setResidence(home.id))}
                chevron
              />
            )}
            <Row
              emoji="💵"
              title={`Sell for $${Math.round(home.price / 2).toLocaleString()}`}
              subtitle={isResidence ? "You'll need somewhere else to live" : 'Cash it in'}
              onPress={act(() => sellHome(home.id), 'cash')}
              chevron
            />
          </View>

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
  list: { marginTop: 14, gap: 8 },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
