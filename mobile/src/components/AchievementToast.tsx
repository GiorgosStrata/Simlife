import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { ACHIEVEMENTS_BY_ID } from '../data/achievements'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

const SHOW_MS = 2600

/**
 * A small celebratory banner that slides down from the top whenever an
 * achievement is earned, then auto-dismisses. Multiple unlocks queue up and
 * show one after another, so it never blocks play the way the OK-card does.
 */
export function AchievementToast() {
  const id = useGameStore((s) => s.achievementQueue[0] ?? null)
  const dismissAchievement = useGameStore((s) => s.dismissAchievement)
  const anim = useRef(new Animated.Value(0)).current
  const achievement = id ? ACHIEVEMENTS_BY_ID[id] : null

  useEffect(() => {
    if (!id) return
    anim.setValue(0)
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }).start()
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        dismissAchievement()
      })
    }, SHOW_MS)
    return () => clearTimeout(timer)
  }, [id, anim, dismissAchievement])

  if (!achievement) return null

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-120, 0] })

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Animated.View style={[styles.banner, { opacity: anim, transform: [{ translateY }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Achievement unlocked: ${achievement.title}`}
          onPress={dismissAchievement}
          style={styles.press}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{achievement.emoji}</Text>
          </View>
          <View style={styles.text}>
            <Text style={styles.kicker}>🏆 ACHIEVEMENT UNLOCKED</Text>
            <Text style={styles.title} numberOfLines={1}>
              {achievement.title}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 12,
    zIndex: 50,
  },
  banner: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.amber400,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  press: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.amber400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 24 },
  text: { flex: 1 },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.amber400,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate800,
    marginTop: 2,
  },
})
