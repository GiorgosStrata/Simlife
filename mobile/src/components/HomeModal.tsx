import { useEffect } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getAsset, homeRent, resaleValue } from '../data/assets'
import { assetUpkeep } from '../data/economy'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface HomeModalProps {
  assetId: string
  onClose: () => void
}

/** Decide what to do with a home you own: live in it, or rent it out & sell. */
export function HomeModal({ assetId, onClose }: HomeModalProps) {
  const residenceId = useGameStore((s) => s.residenceId)
  const setResidence = useGameStore((s) => s.setResidence)
  const sellAsset = useGameStore((s) => s.sellAsset)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  const home = getAsset(assetId)
  if (!home) return null
  const isResidence = residenceId === assetId
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
                onPress={act(() => setResidence(assetId))}
                chevron
              />
            )}
            <Row
              emoji="💵"
              title={`Sell for $${resaleValue(home).toLocaleString()}`}
              subtitle={isResidence ? "You'll need somewhere else to live" : 'Cash it in'}
              onPress={act(() => sellAsset(assetId), 'cash')}
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
