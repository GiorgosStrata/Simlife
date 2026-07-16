import { useEffect, useRef } from 'react'
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

/**
 * BitLife-style popup: slides up over the whole screen when an event is
 * pending, so the layout underneath (including Age Up) never moves.
 * There is no way to dismiss it without picking a choice.
 */
export function EventModal() {
  const currentEvent = useGameStore((s) => s.currentEvent)
  const chooseOption = useGameStore((s) => s.chooseOption)

  // Pop the illustration in with a little spring + wiggle each new event.
  const pop = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!currentEvent) return
    playSfx('pop')
    pop.setValue(0)
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start()
  }, [currentEvent, pop])

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] })
  const rotate = pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['-12deg', '6deg', '0deg'] })

  return (
    <Modal
      visible={currentEvent !== null}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        {currentEvent && (
          <View style={styles.card}>
            <Animated.View style={[styles.illustration, { transform: [{ scale }, { rotate }] }]}>
              <Text style={styles.illustrationEmoji}>{currentEvent.emoji}</Text>
            </Animated.View>
            <Text style={styles.title}>{currentEvent.title}</Text>
            <Text style={styles.description}>{currentEvent.description}</Text>
            <View style={styles.choices}>
              {currentEvent.choices.map((choice, i) => (
                <Pressable
                  key={choice.label}
                  accessibilityRole="button"
                  onPress={() => {
                    playSfx('click')
                    chooseOption(i)
                  }}
                  style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
                >
                  <Text style={styles.choiceText}>{choice.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
  },
  illustration: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cyan50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  illustrationEmoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate800,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.slate600,
  },
  choices: {
    marginTop: 18,
    gap: 10,
  },
  choice: {
    backgroundColor: colors.cyan50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  choicePressed: {
    backgroundColor: colors.cyan100,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cyan900,
  },
})
