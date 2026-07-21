import { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { randomFirstName, randomLastName } from '../data/names'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Gender } from '../types'
import { Avatar } from './Avatar'
import { useCloseOnAction } from './useCloseOnAction'

interface DatingModalProps {
  onClose: () => void
}

interface Profile {
  name: string
  gender: Gender
  age: number
  looks: number
  seed: string
  bio: string
}

const BIOS = [
  'Coffee addict, dog person, terrible at texting back.',
  'Looking for someone to split appetizers with.',
  'Gym, travel, and questionable playlists.',
  'Professional overthinker. Amateur chef.',
  'Swipe right if you like bad puns.',
  'Just here for the free Wi-Fi and maybe love.',
  'Sunsets, spontaneous road trips, and tacos.',
  'I will beat you at Mario Kart. Non-negotiable.',
  'Plant parent looking for a co-parent.',
  'Fluent in sarcasm and three other languages.',
]

/** Tinder-style swiping. Like someone and, if it's mutual, you're dating. */
export function DatingModal({ onClose }: DatingModalProps) {
  const countryCode = useGameStore((s) => s.countryCode)
  const playerGender = useGameStore((s) => s.gender)
  const playerAge = useGameStore((s) => s.age)
  const playerLooks = useGameStore((s) => s.stats.looks)
  const hasPartner = useGameStore((s) =>
    s.relationships.some((p) => p.id === 'partner' && p.alive),
  )
  const beginRelationship = useGameStore((s) => s.beginRelationship)

  // Heterosexual matching for now; sexuality options come later.
  const targetGender: Gender = playerGender === 'male' ? 'female' : 'male'

  const makeProfile = useMemo(
    () => (): Profile => {
      const age = Math.max(18, playerAge + Math.floor(Math.random() * 11) - 5)
      const looks = 25 + Math.floor(Math.random() * 71)
      const name = `${randomFirstName(countryCode, targetGender)} ${randomLastName(countryCode)}`
      return {
        name,
        gender: targetGender,
        age,
        looks,
        // Seed on the name so the face carries over if you match and date them.
        seed: name,
        bio: BIOS[Math.floor(Math.random() * BIOS.length)],
      }
    },
    [countryCode, targetGender, playerAge],
  )

  const [profile, setProfile] = useState<Profile>(() => makeProfile())
  const [matched, setMatched] = useState<Profile | null>(null)
  useCloseOnAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const pass = () => {
    playSfx('whoosh')
    setProfile(makeProfile())
  }

  const like = () => {
    // First right-swipe ever earns a badge.
    useGameStore.getState().unlockAchievement('swipe-right')
    // Mutual-match chance rises with both people's looks.
    const chance = 0.25 + (playerLooks + profile.looks) / 400
    if (Math.random() < chance) {
      playSfx('match')
      setMatched(profile)
    } else {
      playSfx('whoosh')
      setProfile(makeProfile())
    }
  }

  const startDating = () => {
    if (!matched) return
    const before = useGameStore.getState().log.length
    beginRelationship(matched.name, matched.gender, matched.age)
    const st = useGameStore.getState()
    if (st.log.length > before) st.showToast(st.log[st.log.length - 1].text)
    st.closeModals()
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🔥 Cinder</Text>

          {hasPartner ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>💑</Text>
              <Text style={styles.emptyText}>
                You're already seeing someone. Break up first if you want to swipe again.
              </Text>
            </View>
          ) : matched ? (
            <View style={styles.matchBox}>
              <Avatar seed={matched.seed} gender={matched.gender} age={matched.age} size={96} />
              <Text style={styles.matchTitle}>It's a match!</Text>
              <Text style={styles.matchName}>
                {matched.name}, {matched.age}
              </Text>
              <Pressable accessibilityRole="button" onPress={startDating} style={styles.startBtn}>
                <Text style={styles.startBtnText}>Start dating 💕</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.profileCard}>
                <View style={styles.photo}>
                  <Avatar seed={profile.seed} gender={profile.gender} age={profile.age} size={120} />
                </View>
                <Text style={styles.profileName}>
                  {profile.name}, {profile.age}
                </Text>
                <View style={styles.looksRow}>
                  <Text style={styles.looksLabel}>Looks</Text>
                  <View style={styles.looksTrack}>
                    <View style={[styles.looksFill, { width: `${profile.looks}%` }]} />
                  </View>
                </View>
                <Text style={styles.bio}>{profile.bio}</Text>
              </View>

              <View style={styles.swipeRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pass"
                  onPress={pass}
                  style={({ pressed }) => [styles.circle, styles.pass, pressed && styles.pressed]}
                >
                  <Text style={styles.circleText}>👎</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Like"
                  onPress={like}
                  style={({ pressed }) => [styles.circle, styles.likeBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.circleText}>❤️</Text>
                </Pressable>
              </View>
            </>
          )}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
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
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800, marginBottom: 12 },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cyan50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: { fontSize: 64 },
  profileName: { fontSize: 20, fontWeight: '800', color: colors.slate800, marginTop: 14 },
  looksRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, width: '100%' },
  looksLabel: { width: 44, fontSize: 12, fontWeight: '700', color: colors.slate600 },
  looksTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  looksFill: { height: '100%', borderRadius: 999, backgroundColor: colors.pink600 },
  bio: { fontSize: 14, color: colors.slate600, marginTop: 12, textAlign: 'center' },
  swipeRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginTop: 20 },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  pass: { borderWidth: 2, borderColor: colors.slate200 },
  likeBtn: { borderWidth: 2, borderColor: colors.pink600 },
  pressed: { opacity: 0.7 },
  circleText: { fontSize: 30 },
  matchBox: { alignItems: 'center', paddingVertical: 20 },
  matchEmoji: { fontSize: 64 },
  matchTitle: { fontSize: 22, fontWeight: '800', color: colors.pink600, marginTop: 8 },
  matchName: { fontSize: 16, fontWeight: '700', color: colors.slate800, marginTop: 6 },
  startBtn: {
    marginTop: 18,
    backgroundColor: colors.pink600,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  startBtnText: { fontSize: 15, fontWeight: '800', color: colors.onColor },
  emptyBox: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 10 },
  emptyEmoji: { fontSize: 52 },
  emptyText: { fontSize: 14, color: colors.slate500, textAlign: 'center', marginTop: 12 },
  cancel: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
