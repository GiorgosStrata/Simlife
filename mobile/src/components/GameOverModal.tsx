import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { saveActiveSlot } from '../saves'
import { FREE_MAX_GENERATION, usePremiumStore } from '../store/premiumStore'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { PersonAvatar } from './Avatar'

interface GameOverModalProps {
  onWantPremium?: () => void
}

export function GameOverModal({ onWantPremium }: GameOverModalProps) {
  const alive = useGameStore((s) => s.alive)
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const money = useGameStore((s) => s.money)
  const generation = useGameStore((s) => s.generation)
  const relationships = useGameStore((s) => s.relationships)
  const startNewLife = useGameStore((s) => s.startNewLife)
  const continueAsChild = useGameStore((s) => s.continueAsChild)
  const premium = usePremiumStore((s) => s.premium)

  useEffect(() => {
    if (!alive) playSfx('death')
  }, [alive])

  const heirs = relationships.filter((p) => p.role === 'child' && p.alive)
  const share = money > 0 && heirs.length > 0 ? Math.floor(money / heirs.length) : 0
  // Free play continues the bloodline only up to a few generations.
  const canContinue = premium || generation < FREE_MAX_GENERATION

  return (
    <Modal visible={!alive} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.tombstone}>🪦</Text>
          <Text style={styles.title}>Rest in Peace</Text>
          <Text style={styles.subtitle}>
            {name} lived to the age of {age}.
          </Text>

          {heirs.length > 0 && canContinue && (
            <>
              <Text style={styles.heirHeading}>
                Continue your bloodline as one of your children
                {share > 0 ? ` (each inherits $${share.toLocaleString()})` : ''}:
              </Text>
              <ScrollView style={styles.heirList} contentContainerStyle={styles.heirListContent}>
                {heirs.map((child, i) => (
                  <Pressable
                    key={`${child.id}-${i}`}
                    accessibilityRole="button"
                    onPress={() => {
                      playSfx('baby')
                      continueAsChild(child.id)
                      saveActiveSlot()
                    }}
                    style={({ pressed }) => [styles.heirRow, pressed && styles.heirRowPressed]}
                  >
                    <PersonAvatar person={child} size={40} />
                    <View style={styles.heirInfo}>
                      <Text style={styles.heirName}>{child.name}</Text>
                      <Text style={styles.heirMeta}>
                        {child.gender === 'male' ? 'Son' : 'Daughter'} · age {child.age}
                      </Text>
                    </View>
                    <Text style={styles.heirGo}>▶</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {heirs.length > 0 && !canContinue && (
            <Pressable
              accessibilityRole="button"
              onPress={() => onWantPremium?.()}
              style={({ pressed }) => [styles.lockBox, pressed && styles.heirRowPressed]}
            >
              <Text style={styles.lockTitle}>👑 Continue the bloodline forever</Text>
              <Text style={styles.lockSub}>
                Free play ends after {FREE_MAX_GENERATION} generations. Go Premium for unlimited
                generations and keep your children's story going.
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              startNewLife()
              saveActiveSlot()
            }}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Start a New Life</Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  tombstone: {
    fontSize: 40,
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate800,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.slate600,
  },
  heirHeading: {
    marginTop: 18,
    alignSelf: 'stretch',
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
  },
  heirList: {
    alignSelf: 'stretch',
    marginTop: 10,
    maxHeight: 220,
  },
  heirListContent: {
    gap: 8,
  },
  heirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.slate100,
    borderRadius: 14,
    padding: 10,
  },
  heirRowPressed: {
    backgroundColor: colors.cyan50,
  },
  heirInfo: {
    flex: 1,
  },
  heirName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  heirMeta: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 1,
  },
  heirGo: {
    fontSize: 14,
    color: colors.cyan600,
    fontWeight: '800',
  },
  lockBox: {
    alignSelf: 'stretch',
    marginTop: 18,
    backgroundColor: colors.emerald50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.amber400,
    padding: 14,
  },
  lockTitle: { fontSize: 14, fontWeight: '800', color: colors.slate800 },
  lockSub: { fontSize: 12, color: colors.slate600, marginTop: 4, lineHeight: 17 },
  button: {
    marginTop: 20,
    alignSelf: 'stretch',
    backgroundColor: colors.cyan500,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.cyan400,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onColor,
  },
})
