import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import {
  PREMIUM_PRICE,
  PREMIUM_SAVE_SLOTS,
  usePremiumStore,
} from '../store/premiumStore'
import { useAuthStore } from '../store/authStore'
import { colors } from '../theme'
import { GRADIENTS, GradientFill } from './Gradient'

interface PremiumModalProps {
  onClose: () => void
}

const PERKS: { emoji: string; title: string; sub: string }[] = [
  { emoji: '🚫', title: 'Remove all ads', sub: 'No banners, no interstitials — ever.' },
  { emoji: '💾', title: `Save up to ${PREMIUM_SAVE_SLOTS} lives`, sub: 'Keep more bloodlines going at once.' },
  { emoji: '👶', title: 'Switch to your kids anytime', sub: 'Hand over the story while you’re still alive.' },
  { emoji: '♾️', title: 'Unlimited generations', sub: 'Continue the family line forever.' },
  { emoji: '🎚️', title: 'Edit stats before birth', sub: 'Shape your character’s starting stats.' },
  { emoji: '🎁', title: 'All future DLC included', sub: 'Every upcoming expansion, unlocked forever.' },
]

/** One-time purchase paywall for GitLife Premium. */
export function PremiumModal({ onClose }: PremiumModalProps) {
  const premium = usePremiumStore((s) => s.premium)
  const purchase = usePremiumStore((s) => s.purchase)
  const restorePurchase = usePremiumStore((s) => s.restorePurchase)
  // Guests (no account) can play, but purchases need a real account so the
  // entitlement can follow them across devices.
  const hasAccount = useAuthStore((s) => s.currentEmail !== null)
  const exitGuest = useAuthStore((s) => s.exitGuest)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const buy = () => {
    playSfx('cash')
    purchase()
  }

  const createAccount = () => {
    playSfx('click')
    onClose()
    exitGuest()
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <GradientFill from={GRADIENTS.primary[0]} to="#0b0d17" />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.title}>GitLife Premium</Text>
            <Text style={styles.tagline}>Everything, unlocked. One payment.</Text>
          </View>

          <ScrollView style={styles.perks} contentContainerStyle={styles.perksContent}>
            {PERKS.map((p) => (
              <View key={p.title} style={styles.perk}>
                <Text style={styles.perkEmoji}>{p.emoji}</Text>
                <View style={styles.perkText}>
                  <Text style={styles.perkTitle}>{p.title}</Text>
                  <Text style={styles.perkSub}>{p.sub}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {premium ? (
            <View style={styles.ownedBox}>
              <Text style={styles.ownedText}>✓ Premium unlocked — thank you! 💜</Text>
            </View>
          ) : hasAccount ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={buy}
                style={({ pressed }) => [styles.buy, pressed && styles.buyPressed]}
              >
                <Text style={styles.buyText}>Unlock Premium · {PREMIUM_PRICE}</Text>
              </Pressable>
              <Text style={styles.restore} onPress={restorePurchase}>
                Restore purchase
              </Text>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={createAccount}
                style={({ pressed }) => [styles.buy, pressed && styles.buyPressed]}
              >
                <Text style={styles.buyText}>Create a free account to unlock</Text>
              </Pressable>
              <Text style={styles.restore}>
                Premium follows your account across devices — your progress is saved.
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    padding: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  header: { alignItems: 'center', gap: 4, marginBottom: 16 },
  crown: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  perks: { flexGrow: 0 },
  perksContent: { gap: 10, paddingBottom: 6 },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
  },
  perkEmoji: { fontSize: 24 },
  perkText: { flex: 1 },
  perkTitle: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  perkSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  buy: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  buyPressed: { opacity: 0.9 },
  buyText: { fontSize: 17, fontWeight: '900', color: colors.cyan600 },
  restore: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 14,
  },
  ownedBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  ownedText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
})
