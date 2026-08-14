import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { colors } from '../theme'

interface TutorialModalProps {
  onClose: () => void
}

interface Slide {
  emoji: string
  title: string
  body: string
}

/** A tiny, skippable intro shown the first time someone plays. */
const SLIDES: Slide[] = [
  {
    emoji: '👶',
    title: 'Welcome to GitLife',
    body: 'You’ll live a whole life — from birth to death — one year at a time. Every choice shapes who you become.',
  },
  {
    emoji: '💗',
    title: 'Mind your stats',
    body: 'The five rings are Health, Mood, Smarts, Looks and Stress. Keep them healthy — and keep Stress low. A red Stress ring means it’s running hot.',
  },
  {
    emoji: '⏩',
    title: 'Advance the years',
    body: 'Tap “Advance Year” to grow older. Life events pop up along the way — how you respond changes everything.',
  },
  {
    emoji: '🧭',
    title: 'Explore the tabs',
    body: 'Career for school & jobs, Social for friends & family, and Lifestyle for activities, shopping, health — and some less-legal pursuits.',
  },
  {
    emoji: '🌟',
    title: 'It’s your life',
    body: 'Build a career, fall in love, start a family, get rich — or chase chaos. There’s no wrong way to live it. Ready?',
  },
]

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [i, setI] = useState(0)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const last = i === SLIDES.length - 1
  const next = () => {
    playSfx('click')
    if (last) onClose()
    else setI(i + 1)
  }
  const slide = SLIDES[i]

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.skip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>

          <View style={styles.dots}>
            {SLIDES.map((_, d) => (
              <View key={d} style={[styles.dot, d === i && styles.dotActive]} />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={next}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>{last ? 'Start living →' : 'Next'}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  skip: { position: 'absolute', top: 14, right: 16, padding: 4 },
  skipText: { fontSize: 13, fontWeight: '700', color: colors.slate400 },
  emoji: { fontSize: 52, marginTop: 8 },
  title: { fontSize: 21, fontWeight: '800', color: colors.slate800, textAlign: 'center' },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.slate500,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  dots: { flexDirection: 'row', gap: 7, marginTop: 6, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.slate200 },
  dotActive: { backgroundColor: colors.cyan500, width: 20 },
  cta: {
    alignSelf: 'stretch',
    backgroundColor: colors.cyan500,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaPressed: { opacity: 0.88 },
  ctaText: { fontSize: 16, fontWeight: '800', color: colors.onColor },
})
