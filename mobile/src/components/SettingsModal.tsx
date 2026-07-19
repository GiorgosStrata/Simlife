import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { SectionHeading } from './SectionHeading'

const VOLUME_LEVELS = [
  { label: 'Off', value: 0 },
  { label: 'Low', value: 0.33 },
  { label: 'Medium', value: 0.66 },
  { label: 'High', value: 1 },
]

interface SettingsModalProps {
  onClose: () => void
}

const THEME_OPTIONS = [
  { label: '☀️ Light', value: 'light' as const },
  { label: '🌙 Dark', value: 'dark' as const },
]

export function SettingsModal({ onClose }: SettingsModalProps) {
  const sfxVolume = useGameStore((s) => s.sfxVolume)
  const setSfxVolume = useGameStore((s) => s.setSfxVolume)
  const theme = useGameStore((s) => s.theme)
  const setTheme = useGameStore((s) => s.setTheme)
  const startNewLife = useGameStore((s) => s.startNewLife)
  const [confirmingReset, setConfirmingReset] = useState(false)

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Settings</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <SectionHeading color={colors.violet500}>APPEARANCE</SectionHeading>
          <View style={styles.volumeRow}>
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
                  style={[styles.volumeButton, active && styles.volumeButtonActive]}
                >
                  <Text style={[styles.volumeText, active && styles.volumeTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <SectionHeading color={colors.sky500}>SOUND EFFECTS</SectionHeading>
          <View style={styles.volumeRow}>
            {VOLUME_LEVELS.map((level) => {
              const active = Math.abs(sfxVolume - level.value) < 0.01
              return (
                <Pressable
                  key={level.label}
                  accessibilityRole="button"
                  onPress={() => {
                    setSfxVolume(level.value)
                    playSfx('click')
                  }}
                  style={[styles.volumeButton, active && styles.volumeButtonActive]}
                >
                  <Text style={[styles.volumeText, active && styles.volumeTextActive]}>
                    {level.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
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
  volumeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  volumeButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: colors.slate100,
    paddingVertical: 9,
    alignItems: 'center',
  },
  volumeButtonActive: {
    backgroundColor: colors.cyan500,
  },
  volumeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
  },
  volumeTextActive: {
    color: colors.onColor,
  },
  dangerButton: {
    borderRadius: 12,
    backgroundColor: colors.slate100,
    paddingVertical: 11,
    marginTop: 8,
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
