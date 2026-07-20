import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getAsset, homeRent, resaleValue } from '../data/assets'
import { assetUpkeep } from '../data/economy'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { HomeModal } from './HomeModal'
import { Row } from './Row'
import { SectionHeading } from './SectionHeading'
import { useCloseOnAction } from './useCloseOnAction'

interface BelongingsModalProps {
  onClose: () => void
}

/** Everything you own, tucked into a sheet so it doesn't fill the screen. */
export function BelongingsModal({ onClose }: BelongingsModalProps) {
  const ownedAssetIds = useGameStore((s) => s.ownedAssetIds)
  const homes = useGameStore((s) => s.homes)
  const residenceId = useGameStore((s) => s.residenceId)
  const sellAsset = useGameStore((s) => s.sellAsset)
  const [homeId, setHomeId] = useState<string | null>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)

  const owned = ownedAssetIds
    .map((id) => getAsset(id))
    .filter((a): a is NonNullable<typeof a> => !!a)
  const netWorth =
    owned.reduce((sum, a) => sum + resaleValue(a), 0) +
    homes.reduce((sum, h) => sum + Math.round(h.price / 2), 0)
  const rentTotal = homes.reduce(
    (sum, h) => (h.id !== residenceId ? sum + homeRent(h.price) : sum),
    0,
  )
  const hasStuff = owned.length > 0 || homes.length > 0

  const tap = (fn: () => void) => () => {
    playSfx('click')
    fn()
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Belongings</Text>
          <Text style={styles.subtitle}>
            {hasStuff
              ? `Worth ~$${netWorth.toLocaleString()}${rentTotal > 0 ? ` · $${rentTotal.toLocaleString()}/yr in rent` : ''}`
              : 'You don’t own anything yet — hit the shop.'}
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {homes.length > 0 && <SectionHeading color={colors.sky500}>PROPERTY</SectionHeading>}
            {homes.map((home) => (
              <Row
                key={home.id}
                emoji={home.emoji}
                title={home.name}
                subtitle={
                  home.id === residenceId
                    ? '🏠 You live here · tap to manage'
                    : `💰 Rented · $${homeRent(home.price).toLocaleString()}/yr · tap to manage`
                }
                onPress={tap(() => setHomeId(home.id))}
                chevron
              />
            ))}

            {owned.length > 0 && <SectionHeading color={colors.amber400}>ITEMS</SectionHeading>}
            {owned.map((asset) => {
              const upkeep = assetUpkeep(asset.price, asset.category)
              return (
                <Row
                  key={asset.id}
                  emoji={asset.emoji}
                  title={asset.name}
                  subtitle={`Sell for $${resaleValue(asset).toLocaleString()}${upkeep > 0 ? ` · upkeep $${upkeep.toLocaleString()}/yr` : ''}`}
                  onPress={tap(() => sellAsset(asset.id))}
                  right={<Text style={styles.sell}>Sell</Text>}
                />
              )
            })}

            {!hasStuff && (
              <Row emoji="📭" title="Nothing yet" subtitle="Buy something from the shop" />
            )}
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>

      {homeId && <HomeModal homeId={homeId} onClose={() => setHomeId(null)} />}
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
  subtitle: { marginTop: 2, fontSize: 13, color: colors.slate500, marginBottom: 8 },
  list: { marginTop: 4 },
  listContent: { gap: 8, paddingBottom: 8 },
  sell: { fontSize: 13, fontWeight: '700', color: colors.rose500, marginRight: 4 },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
