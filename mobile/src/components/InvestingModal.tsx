import { useEffect } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { colors } from '../theme'

interface InvestingModalProps {
  onClose: () => void
}

/** Placeholder investing app — real markets are coming in a future update. */
export function InvestingModal({ onClose }: InvestingModalProps) {
  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>📈 Vestr</Text>
          <View style={styles.box}>
            <Text style={styles.emoji}>🚧</Text>
            <Text style={styles.heading}>Markets open soon</Text>
            <Text style={styles.text}>
              Stocks, crypto, and get-rich-quick schemes are on the way. Check back in a future
              update to start building your portfolio.
            </Text>
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
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800, marginBottom: 12 },
  box: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 10 },
  emoji: { fontSize: 56 },
  heading: { fontSize: 17, fontWeight: '800', color: colors.slate800, marginTop: 12 },
  text: { fontSize: 14, color: colors.slate500, textAlign: 'center', marginTop: 8 },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
