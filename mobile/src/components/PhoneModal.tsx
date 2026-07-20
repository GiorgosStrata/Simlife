import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { SOCIAL_APPS, useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { SocialApp } from '../types'
import { DatingModal } from './DatingModal'
import { GRADIENTS, GradientFill } from './Gradient'
import { InvestingModal } from './InvestingModal'
import { OneNightModal } from './OneNightModal'
import { SocialModal } from './SocialModal'
import { useCloseOnAction } from './useCloseOnAction'

interface PhoneModalProps {
  onClose: () => void
}

type OpenApp = SocialApp | 'cinder' | 'vestr' | 'prowl' | null

type Launch = { kind: 'app'; app: OpenApp } | { kind: 'soon'; name: string }

interface AppTile {
  key: string
  emoji: string
  name: string
  color: string
  launch: Launch
}

/** The character's phone home screen — a real-looking device full of apps. */
export function PhoneModal({ onClose }: PhoneModalProps) {
  const followers = useGameStore((s) => s.followers)
  const [open, setOpen] = useState<OpenApp>(null)
  const [soon, setSoon] = useState<string | null>(null)
  useCloseOnAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const social = (key: SocialApp): AppTile => ({
    key,
    emoji: SOCIAL_APPS[key].emoji,
    name: SOCIAL_APPS[key].name,
    color: SOCIAL_COLORS[key],
    launch: { kind: 'app', app: key },
  })

  const apps: AppTile[] = [
    social('flicktok'),
    social('rizzgram'),
    social('youtube'),
    { key: 'cinder', emoji: '🔥', name: 'Cinder', color: '#f97316', launch: { kind: 'app', app: 'cinder' } },
    { key: 'prowl', emoji: '😈', name: 'Prowl', color: '#be123c', launch: { kind: 'app', app: 'prowl' } },
    { key: 'onlystans', emoji: '💎', name: 'OnlyStans', color: '#0ea5e9', launch: { kind: 'app', app: 'onlystans' } },
    { key: 'vestr', emoji: '📈', name: 'Vestr', color: '#16a34a', launch: { kind: 'app', app: 'vestr' } },
    { key: 'messages', emoji: '💬', name: 'Messages', color: '#2563eb', launch: { kind: 'soon', name: 'Messages' } },
  ]

  const press = (tile: AppTile) => () => {
    playSfx('click')
    if (tile.launch.kind === 'soon') setSoon(tile.launch.name)
    else setOpen(tile.launch.app)
  }

  const followerLabel = (key: string): string | null => {
    if (key in SOCIAL_APPS) {
      const n = followers[key as SocialApp]
      return n > 0 ? `${abbrev(n)}` : null
    }
    return null
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.phone}>
          <GradientFill from={GRADIENTS.primary[0]} to="#0b0d17" />

          {/* Status bar */}
          <View style={styles.statusBar}>
            <Text style={styles.statusTime}>9:41</Text>
            <View style={styles.statusRight}>
              <Text style={styles.statusIcons}>📶</Text>
              <Text style={styles.statusIcons}>🔋</Text>
            </View>
          </View>

          <Text style={styles.wallpaperLabel}>My Phone</Text>

          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {apps.map((tile) => {
              const badge = followerLabel(tile.key)
              return (
                <Pressable
                  key={tile.key}
                  accessibilityRole="button"
                  accessibilityLabel={tile.name}
                  onPress={press(tile)}
                  style={({ pressed }) => [styles.app, pressed && styles.appPressed]}
                >
                  <View style={[styles.icon, { backgroundColor: tile.color }]}>
                    <Text style={styles.iconEmoji}>{tile.emoji}</Text>
                    {badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.appName} numberOfLines={1}>
                    {tile.name}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Home indicator doubles as the close gesture */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close phone"
            onPress={onClose}
            style={styles.homeBarHit}
          >
            <View style={styles.homeBar} />
          </Pressable>
        </View>
      </View>

      {(open === 'rizzgram' || open === 'flicktok' || open === 'youtube' || open === 'onlystans') && (
        <SocialModal app={open} onClose={() => setOpen(null)} />
      )}
      {open === 'cinder' && <DatingModal onClose={() => setOpen(null)} />}
      {open === 'prowl' && <OneNightModal onClose={() => setOpen(null)} />}
      {open === 'vestr' && <InvestingModal onClose={() => setOpen(null)} />}

      {soon && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSoon(null)}>
          <Pressable style={styles.soonBackdrop} onPress={() => setSoon(null)}>
            <View style={styles.soonCard}>
              <Text style={styles.soonTitle}>{soon}</Text>
              <Text style={styles.soonBody}>This app is coming soon. 🚧</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSoon(null)}
                style={styles.soonButton}
              >
                <Text style={styles.soonButtonText}>OK</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </Modal>
  )
}

/** Brand-ish tile colours for each social platform. */
const SOCIAL_COLORS: Record<SocialApp, string> = {
  rizzgram: '#d6336c',
  flicktok: '#111827',
  youtube: '#e11d48',
  onlystans: '#0ea5e9',
}

/** Compact follower counts: 1200 → 1.2K, 3_400_000 → 3.4M. */
function abbrev(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return `${n}`
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  phone: {
    width: '100%',
    maxWidth: 340,
    height: '86%',
    maxHeight: 680,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#05060d',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  statusTime: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusIcons: { color: '#ffffff', fontSize: 11 },
  wallpaperLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 12,
    rowGap: 20,
  },
  app: {
    width: '23%',
    alignItems: 'center',
    gap: 6,
  },
  appPressed: { opacity: 0.6 },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  iconEmoji: { fontSize: 30 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  appName: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  homeBarHit: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 'auto',
  },
  homeBar: {
    width: 120,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  soonBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  soonCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  soonTitle: { fontSize: 18, fontWeight: '800', color: colors.slate800 },
  soonBody: { fontSize: 14, color: colors.slate500, marginTop: 6, textAlign: 'center' },
  soonButton: {
    marginTop: 16,
    backgroundColor: colors.cyan500,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  soonButtonText: { color: colors.onColor, fontSize: 15, fontWeight: '700' },
})
