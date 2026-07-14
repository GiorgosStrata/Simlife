import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

export function GameOverModal() {
  const alive = useGameStore((s) => s.alive)
  const name = useGameStore((s) => s.name)
  const age = useGameStore((s) => s.age)
  const startNewLife = useGameStore((s) => s.startNewLife)

  return (
    <Modal visible={!alive} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.tombstone}>🪦</Text>
          <Text style={styles.title}>Rest in Peace</Text>
          <Text style={styles.subtitle}>
            {name} lived to the age of {age}.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={startNewLife}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Start a New Life</Text>
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
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  tombstone: {
    fontSize: 40,
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: colors.slate800,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.slate600,
  },
  button: {
    marginTop: 20,
    alignSelf: 'stretch',
    backgroundColor: colors.cyan500,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.cyan400,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
})
