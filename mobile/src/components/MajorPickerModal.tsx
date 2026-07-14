import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { MAJORS } from '../data/majors'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'

/** Pick a university major — top programs want top grades. */
export function MajorPickerModal() {
  const smarts = useGameStore((s) => s.stats.smarts)
  const applyToUniversity = useGameStore((s) => s.applyToUniversity)
  const cancel = useGameStore((s) => s.cancelUniversityApplication)

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={cancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>UNIVERSITY APPLICATION</Text>
          <Text style={styles.title}>Pick your major</Text>
          <Text style={styles.subtitle}>
            Your grades: {smarts} smarts. Programs above that bar will reject you.
          </Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {MAJORS.map((major) => {
              const qualified = smarts >= major.minSmarts
              return (
                <Row
                  key={major.id}
                  emoji={major.emoji}
                  title={major.name}
                  subtitle={`needs ${major.minSmarts} smarts${qualified ? '' : ' — out of reach'}`}
                  onPress={() => {
                    playSfx(qualified ? 'success' : 'fail')
                    applyToUniversity(major.id)
                  }}
                  right={<Text style={qualified ? styles.ok : styles.no}>{qualified ? '✓' : '✗'}</Text>}
                />
              )
            })}
          </ScrollView>
          <Pressable accessibilityRole="button" onPress={cancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Maybe later</Text>
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
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.slate100,
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.cyan600,
  },
  title: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate800,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.slate500,
  },
  list: {
    marginTop: 14,
  },
  listContent: {
    gap: 8,
  },
  ok: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.cyan600,
    marginRight: 6,
  },
  no: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.rose700,
    marginRight: 6,
  },
  cancel: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate500,
  },
})
