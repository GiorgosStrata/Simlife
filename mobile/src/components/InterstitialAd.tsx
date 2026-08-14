import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { GRADIENTS, GradientFill } from './Gradient'
import { colors } from '../theme'

interface InterstitialAdProps {
  onClose: () => void
}

const COUNTDOWN = 5

/**
 * A full-screen interstitial shown periodically during play. This is a
 * house-ad placeholder; the native builds swap the body for an AdMob
 * InterstitialAd (loaded ahead of time and `.show()`n here) — see
 * docs/ADS_AND_AUTH.md. The countdown-then-close flow mirrors a real rewarded
 * interstitial so the UX is identical when the real SDK is wired in.
 */
export function InterstitialAd({ onClose }: InterstitialAdProps) {
  const [left, setLeft] = useState(COUNTDOWN)

  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  const canClose = left <= 0

  return (
    <Modal visible transparent animationType="fade" onRequestClose={canClose ? onClose : undefined}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <GradientFill from={GRADIENTS.primary[0]} to="#0b0d17" />

          <View style={styles.topRow}>
            <View style={styles.adTag}>
              <Text style={styles.adTagText}>AD</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close ad"
              onPress={canClose ? onClose : undefined}
              disabled={!canClose}
              style={[styles.close, !canClose && styles.closeDisabled]}
            >
              <Text style={styles.closeText}>{canClose ? '✕' : left}</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.logo}>🌱</Text>
            <Text style={styles.headline}>Go Premium</Text>
            <Text style={styles.copy}>
              Remove ads, support the game, and play uninterrupted.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={canClose ? onClose : undefined}
            disabled={!canClose}
            style={[styles.cta, !canClose && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>
              {canClose ? 'Continue playing' : `Continue in ${left}s`}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 22,
    minHeight: 420,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adTag: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  adTagText: { fontSize: 11, fontWeight: '900', color: '#ffffff', letterSpacing: 1 },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDisabled: { opacity: 0.7 },
  closeText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  body: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  logo: { fontSize: 64 },
  headline: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  copy: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  cta: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.55 },
  ctaText: { fontSize: 16, fontWeight: '800', color: colors.cyan600 },
})
