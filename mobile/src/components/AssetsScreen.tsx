import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getAsset, resaleValue } from '../data/assets'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'
import { StoreModal } from './StoreModal'

/** BitLife-style belongings: your stuff + a shortcut into the shop. */
export function AssetsScreen() {
  const ownedAssetIds = useGameStore((s) => s.ownedAssetIds)
  const sellAsset = useGameStore((s) => s.sellAsset)

  const [shopping, setShopping] = useState(false)

  const owned = ownedAssetIds.map((id) => getAsset(id)).filter((a): a is NonNullable<typeof a> => !!a)
  const netWorth = owned.reduce((sum, a) => sum + resaleValue(a), 0)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Row
        emoji="🛍️"
        title="Go shopping"
        subtitle="Cars, phones, homes, and luxury"
        onPress={() => {
          playSfx('click')
          setShopping(true)
        }}
        chevron
      />

      <Text style={styles.sectionHeading}>
        🧾 YOUR BELONGINGS{owned.length > 0 ? ` · WORTH $${netWorth.toLocaleString()}` : ''}
      </Text>
      {owned.length === 0 && (
        <Row emoji="📭" title="Nothing yet" subtitle="Buy something from the shop above" />
      )}
      {owned.map((asset) => (
        <Row
          key={asset.id}
          emoji={asset.emoji}
          title={asset.name}
          subtitle={`Sell for $${resaleValue(asset).toLocaleString()}`}
          onPress={() => {
            playSfx('click')
            sellAsset(asset.id)
          }}
          right={<Text style={styles.sell}>Sell</Text>}
        />
      ))}

      {shopping && <StoreModal onClose={() => setShopping(false)} />}
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
  sectionHeading: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate500,
  },
  sell: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.rose700,
    marginRight: 4,
  },
})
