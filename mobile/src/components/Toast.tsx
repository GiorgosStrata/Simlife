import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

/**
 * BitLife-style confirmation bubble. When an action reports an outcome via
 * showToast, this floats it up over the main screen, then fades away on its
 * own after a moment (or when tapped).
 */
export function Toast() {
  const toast = useGameStore((s) => s.toast)
  const dismissToast = useGameStore((s) => s.dismissToast)
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!toast) return
    anim.setValue(0)
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 80 }).start()
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        // Only clear if this is still the same toast (guard against races).
        if (useGameStore.getState().toast === toast) dismissToast()
      })
    }, 2100)
    return () => clearTimeout(timer)
  }, [toast, anim, dismissToast])

  if (!toast) return null

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] })

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { opacity: anim, transform: [{ translateY }] }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={dismissToast}
        style={styles.bubble}
      >
        <Text style={styles.text}>{toast.text}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '32%',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  bubble: {
    backgroundColor: colors.slate800,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 21,
  },
})
