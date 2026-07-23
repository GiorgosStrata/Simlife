import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { saveActiveSlot } from '../saves'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import { usePremiumStore } from '../store/premiumStore'
import { colors } from '../theme'
import { SectionHeading } from './SectionHeading'

const APP_VERSION = '0.1.0'

const VOLUME_LEVELS = [
  { label: 'Off', value: 0, emoji: '🔇' },
  { label: 'Low', value: 0.33, emoji: '🔈' },
  { label: 'Medium', value: 0.66, emoji: '🔉' },
  { label: 'High', value: 1, emoji: '🔊' },
]

interface SettingsModalProps {
  onClose: () => void
  onOpenLives?: () => void
  onOpenPremium?: () => void
}

const THEME_OPTIONS = [
  { label: '☀️ Light', value: 'light' as const },
  { label: '🌙 Dark', value: 'dark' as const },
]

export function SettingsModal({ onClose, onOpenLives, onOpenPremium }: SettingsModalProps) {
  const premium = usePremiumStore((s) => s.premium)
  const sfxVolume = useGameStore((s) => s.sfxVolume)
  const setSfxVolume = useGameStore((s) => s.setSfxVolume)
  const theme = useGameStore((s) => s.theme)
  const setTheme = useGameStore((s) => s.setTheme)
  const startNewLife = useGameStore((s) => s.startNewLife)
  const generation = useGameStore((s) => s.generation)
  const currentEmail = useAuthStore((s) => s.currentEmail)
  const accountName = useAuthStore((s) => s.currentName)
  const logOut = useAuthStore((s) => s.logOut)
  const [confirmingReset, setConfirmingReset] = useState(false)

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>⚙️</Text>
              </View>
              <Text style={styles.title}>Settings</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.group}>
              <SectionHeading color={colors.violet500}>APPEARANCE</SectionHeading>
              <Text style={styles.groupHint}>Pick a light or dark look.</Text>
              <View style={styles.optionRow}>
                {THEME_OPTIONS.map((opt) => {
                  const active = theme === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      accessibilityRole="button"
                      accessibilityLabel={`${opt.value} theme`}
                      onPress={() => {
                        setTheme(opt.value)
                        playSfx('click')
                      }}
                      style={[styles.optionButton, active && styles.optionButtonActive]}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={styles.group}>
              <SectionHeading color={colors.sky500}>SOUND EFFECTS</SectionHeading>
              <Text style={styles.groupHint}>Tap a level to preview and set the volume.</Text>
              <View style={styles.optionRow}>
                {VOLUME_LEVELS.map((level) => {
                  const active = Math.abs(sfxVolume - level.value) < 0.01
                  return (
                    <Pressable
                      key={level.label}
                      accessibilityRole="button"
                      onPress={() => {
                        setSfxVolume(level.value)
                        // Play a sample at the new level so you can hear it.
                        if (level.value > 0) playSfx('pop')
                      }}
                      style={[styles.optionButton, active && styles.optionButtonActive]}
                    >
                      <Text style={[styles.optionEmoji, active && styles.optionTextActive]}>
                        {level.emoji}
                      </Text>
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {level.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={styles.group}>
              <SectionHeading color={colors.cyan500}>GAME</SectionHeading>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  playSfx('click')
                  onOpenLives?.()
                }}
                style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
              >
                <Text style={styles.linkText}>💾 My Lives</Text>
                <Text style={styles.linkChev}>›</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  playSfx('click')
                  onOpenPremium?.()
                }}
                style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
              >
                <Text style={styles.linkText}>
                  {premium ? '👑 Premium' : '👑 Get Premium'}
                </Text>
                <Text style={[styles.linkChev, premium && styles.ownedTag]}>
                  {premium ? 'Active' : '›'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.group}>
              <SectionHeading color={colors.emerald700}>ABOUT</SectionHeading>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutKey}>GitLife</Text>
                <Text style={styles.aboutVal}>v{APP_VERSION}</Text>
              </View>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutKey}>Generation</Text>
                <Text style={styles.aboutVal}>#{generation}</Text>
              </View>
              <Text style={styles.tagline}>A life, one year at a time. 🌱</Text>
            </View>

            <View style={styles.group}>
              <SectionHeading color={colors.emerald700}>ACCOUNT</SectionHeading>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutKey}>{accountName ?? 'Signed in'}</Text>
                <Text style={styles.aboutVal} numberOfLines={1}>
                  {currentEmail}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  playSfx('click')
                  logOut()
                }}
                style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]}
              >
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>

            <View style={styles.group}>
              <SectionHeading color={colors.rose500}>DANGER ZONE</SectionHeading>
              {confirmingReset ? (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmText}>
                    Abandon this life and start over? This cannot be undone.
                  </Text>
                  <View style={styles.confirmRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        playSfx('fail')
                        startNewLife()
                        // Keep the current save slot pointed at the restarted life.
                        saveActiveSlot()
                        onClose()
                      }}
                      style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
                    >
                      <Text style={styles.resetButtonText}>Yes, reset</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setConfirmingReset(false)}
                      style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                    >
                      <Text style={styles.cancelButtonText}>Keep living</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setConfirmingReset(true)}
                  style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]}
                >
                  <Text style={styles.dangerButtonText}>🔄 Reset character</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
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
    padding: 20,
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.cyan50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate800,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: colors.slate600,
  },
  body: {
    marginTop: 6,
  },
  bodyContent: {
    gap: 6,
    paddingBottom: 4,
  },
  group: {
    backgroundColor: colors.slate100,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  groupHint: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 6,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  optionButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: colors.cyan50,
    borderColor: colors.cyan500,
  },
  optionEmoji: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate600,
  },
  optionTextActive: {
    color: colors.cyan600,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  aboutKey: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate600,
  },
  aboutVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate800,
  },
  tagline: {
    fontSize: 12,
    color: colors.slate400,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dangerButton: {
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 11,
    marginTop: 10,
    alignItems: 'center',
  },
  dangerButtonPressed: {
    backgroundColor: colors.slate200,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.rose700,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate600,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  linkRowPressed: { backgroundColor: colors.cyan50 },
  linkText: { fontSize: 14, fontWeight: '700', color: colors.slate800 },
  linkChev: { fontSize: 18, fontWeight: '700', color: colors.slate400 },
  ownedTag: { fontSize: 12, fontWeight: '800', color: colors.emerald700 },
  confirmBox: {
    borderRadius: 12,
    backgroundColor: colors.slate100,
    padding: 14,
    marginTop: 8,
  },
  confirmText: {
    fontSize: 13,
    color: colors.slate600,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  resetButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: colors.rose700,
    paddingVertical: 9,
    alignItems: 'center',
  },
  resetButtonPressed: {
    opacity: 0.85,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onColor,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingVertical: 9,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    backgroundColor: colors.slate200,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
  },
})
