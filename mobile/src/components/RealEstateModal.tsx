import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { propertyResale } from '../data/realestate'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface RealEstateModalProps {
  onClose: () => void
}

/** Buy rental properties for passive income; sell them on later for a profit. */
export function RealEstateModal({ onClose }: RealEstateModalProps) {
  const money = useGameStore((s) => s.money)
  const year = useGameStore((s) => s.year)
  const properties = useGameStore((s) => s.properties)
  const listings = useGameStore((s) => s.rentalListings)
  const buyProperty = useGameStore((s) => s.buyProperty)
  const sellProperty = useGameStore((s) => s.sellProperty)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  const rentTotal = properties.reduce((sum, p) => sum + p.rentPerYear, 0)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🏘️ Real Estate</Text>
          <Text style={styles.subtitle}>
            Buy properties to collect rent every year. Some are better deals than others.
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Text style={styles.sectionHeading}>
              YOUR PROPERTIES{rentTotal > 0 ? ` · $${rentTotal.toLocaleString()}/yr RENT` : ''}
            </Text>
            {properties.length === 0 && (
              <Row emoji="📭" title="No properties yet" subtitle="Buy one from the market below" />
            )}
            {properties.map((p) => {
              const resale = propertyResale(p, year)
              return (
                <Row
                  key={p.id}
                  emoji={p.emoji}
                  title={p.name}
                  subtitle={`Rent $${p.rentPerYear.toLocaleString()}/yr · sell for $${resale.toLocaleString()}`}
                  onPress={act(() => sellProperty(p.id), 'cash')}
                  right={<Text style={styles.sell}>Sell</Text>}
                />
              )
            })}

            <Text style={styles.sectionHeading}>ON THE MARKET</Text>
            {listings.map((l) => {
              const tooPoor = money < l.price
              return (
                <Row
                  key={l.id}
                  emoji={l.emoji}
                  title={l.name}
                  subtitle={`$${l.price.toLocaleString()} · rent $${l.rentPerYear.toLocaleString()}/yr`}
                  onPress={act(() => buyProperty(l.id), 'cash')}
                  disabled={tooPoor}
                  right={
                    <View style={[styles.pill, tooPoor && styles.pillOff]}>
                      <Text style={styles.pillText}>{tooPoor ? '🔒' : 'Buy'}</Text>
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
  sectionHeading: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.slate400,
  },
  sell: { fontSize: 13, fontWeight: '700', color: colors.rose500, marginRight: 4 },
  pill: { backgroundColor: colors.cyan500, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  pillOff: { backgroundColor: colors.slate200 },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.onColor },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
