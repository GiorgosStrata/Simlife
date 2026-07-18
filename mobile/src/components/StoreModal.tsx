import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { ASSET_CATEGORIES, ASSETS, type AssetCategory } from '../data/assets'
import { phonesForYear } from '../data/phones'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface StoreModalProps {
  onClose: () => void
}

/** BitLife-style shop: pick a category, browse, buy what you can afford. */
export function StoreModal({ onClose }: StoreModalProps) {
  const money = useGameStore((s) => s.money)
  const year = useGameStore((s) => s.year)
  const ownedAssetIds = useGameStore((s) => s.ownedAssetIds)
  const buyAsset = useGameStore((s) => s.buyAsset)

  const [category, setCategory] = useState<AssetCategory>('car')
  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const items =
    category === 'phone' ? phonesForYear(year) : ASSETS.filter((a) => a.category === category)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🛍️ Shop</Text>
          <Text style={styles.subtitle}>Balance: ${money.toLocaleString()}</Text>

          <View style={styles.tabs}>
            {ASSET_CATEGORIES.map((cat) => {
              const active = cat.key === category
              return (
                <Pressable
                  key={cat.key}
                  accessibilityRole="button"
                  onPress={() => {
                    playSfx('click')
                    setCategory(cat.key)
                  }}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={styles.tabEmoji}>{cat.emoji}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{cat.label}</Text>
                </Pressable>
              )
            })}
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {items.map((asset) => {
              const owned = ownedAssetIds.includes(asset.id)
              const tooPoor = money < asset.price
              return (
                <Row
                  key={asset.id}
                  emoji={asset.emoji}
                  title={asset.name}
                  subtitle={`$${asset.price.toLocaleString()}`}
                  onPress={act(() => buyAsset(asset.id), null)}
                  disabled={owned || tooPoor}
                  right={
                    <View style={[styles.pill, (owned || tooPoor) && styles.pillOff]}>
                      <Text style={styles.pillText}>{owned ? 'Owned' : tooPoor ? '🔒' : 'Buy'}</Text>
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
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.slate100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate800,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: colors.emerald700,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.cyan50,
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate400,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.cyan600,
  },
  list: {
    marginTop: 12,
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingBottom: 8,
  },
  pill: {
    backgroundColor: colors.cyan500,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillOff: {
    backgroundColor: colors.slate200,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onColor,
  },
  cancel: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate500,
  },
})
