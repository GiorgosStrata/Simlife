import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { SOCIAL_APPS, useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { SocialApp } from '../types'
import { DatingModal } from './DatingModal'
import { InvestingModal } from './InvestingModal'
import { SocialModal } from './SocialModal'

interface PhoneModalProps {
  onClose: () => void
}

type OpenApp = SocialApp | 'cinder' | 'vestr' | null

/** The home screen of the character's phone — a grid of app icons. */
export function PhoneModal({ onClose }: PhoneModalProps) {
  const followers = useGameStore((s) => s.followers)
  const [open, setOpen] = useState<OpenApp>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const launch = (app: OpenApp) => () => {
    playSfx('click')
    setOpen(app)
  }

  const apps: Array<{ key: OpenApp; emoji: string; name: string; sub: string }> = [
    {
      key: 'rizzgram',
      emoji: SOCIAL_APPS.rizzgram.emoji,
      name: SOCIAL_APPS.rizzgram.name,
      sub: `${followers.rizzgram.toLocaleString()} followers`,
    },
    {
      key: 'flicktok',
      emoji: SOCIAL_APPS.flicktok.emoji,
      name: SOCIAL_APPS.flicktok.name,
      sub: `${followers.flicktok.toLocaleString()} followers`,
    },
    { key: 'cinder', emoji: '🔥', name: 'Cinder', sub: 'Dating' },
    { key: 'vestr', emoji: '📈', name: 'Vestr', sub: 'Investing' },
  ]

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>📱 Your Phone</Text>
          <Text style={styles.subtitle}>Tap an app to open it.</Text>

          <View style={styles.grid}>
            {apps.map((app) => (
              <Pressable
                key={app.key}
                accessibilityRole="button"
                onPress={launch(app.key)}
                style={({ pressed }) => [styles.app, pressed && styles.appPressed]}
              >
                <View style={styles.icon}>
                  <Text style={styles.iconEmoji}>{app.emoji}</Text>
                </View>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appSub}>{app.sub}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>

      {(open === 'rizzgram' || open === 'flicktok') && (
        <SocialModal app={open} onClose={() => setOpen(null)} />
      )}
      {open === 'cinder' && <DatingModal onClose={() => setOpen(null)} />}
      {open === 'vestr' && <InvestingModal onClose={() => setOpen(null)} />}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  app: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  appPressed: { backgroundColor: colors.cyan50 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 30 },
  appName: { fontSize: 15, fontWeight: '800', color: colors.slate800, marginTop: 8 },
  appSub: { fontSize: 12, color: colors.slate500, marginTop: 1 },
  cancel: { marginTop: 14, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
