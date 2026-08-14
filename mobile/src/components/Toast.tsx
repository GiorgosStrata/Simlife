import { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

/**
 * BitLife-style result card. When an action reports an outcome via showToast,
 * this pops a big, centered card over a dimmed screen. You tap OK (or the
 * backdrop) to dismiss it and carry on — which, since the submenu already
 * closed, lands you back on the main screen.
 */
export function Toast() {
  const toast = useGameStore((s) => s.toast)
  const dismissToast = useGameStore((s) => s.dismissToast)
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!toast) return
    anim.setValue(0)
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }).start()
  }, [toast, anim])

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] })

  return (
    <Modal visible={toast !== null} transparent animationType="fade" onRequestClose={dismissToast}>
      <View style={styles.backdrop} pointerEvents="auto">
        <Pressable style={styles.backdropPress} accessibilityLabel="Dismiss" onPress={dismissToast} />
        <Animated.View style={[styles.card, { opacity: anim, transform: [{ scale }] }]}>
          <Text style={styles.text}>{toast?.text}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={dismissToast}
            style={({ pressed }) => [styles.okButton, pressed && styles.okButtonPressed]}
          >
            <Text style={styles.okText}>OK</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdropPress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 26,
    paddingBottom: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
    textAlign: 'center',
    lineHeight: 26,
  },
  okButton: {
    marginTop: 22,
    alignSelf: 'stretch',
    backgroundColor: colors.cyan500,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  okButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  okText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onColor,
  },
})
