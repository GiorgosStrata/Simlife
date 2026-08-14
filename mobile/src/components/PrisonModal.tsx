import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { scaleByCountry } from '../data/countries'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface PrisonModalProps {
  onClose: () => void
}

/** BitLife-style prison hub: do your time, or try to shorten it. */
export function PrisonModal({ onClose }: PrisonModalProps) {
  const prison = useGameStore((s) => s.prison)
  const money = useGameStore((s) => s.money)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const attemptEscape = useGameStore((s) => s.attemptEscape)
  const prisonBehave = useGameStore((s) => s.prisonBehave)
  const prisonWorkout = useGameStore((s) => s.prisonWorkout)
  const bribeGuard = useGameStore((s) => s.bribeGuard)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)

  if (!prison) return null

  const used = (k: string) => usedActions.includes(k)
  const bribe = scaleByCountry(5000, countryCode)
  const act = confirmAction(onClose)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🔒 Prison</Text>
          <Text style={styles.subtitle}>
            Serving {prison.sentence} year{prison.sentence === 1 ? '' : 's'} for {prison.crime.toLowerCase()}.
          </Text>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>{prison.yearsLeft}</Text>
              <Text style={styles.badgeCap}>Years left</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>{prison.behavior}</Text>
              <Text style={styles.badgeCap}>Behaviour</Text>
            </View>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Row
              emoji="🙏"
              title="Good behaviour"
              subtitle={used('behave') ? 'Done this year' : 'Behave well — a shot at early parole'}
              onPress={act(prisonBehave, 'success')}
              disabled={used('behave')}
              chevron
            />
            <Row
              emoji="💪"
              title="Work out in the yard"
              subtitle={used('prison-workout') ? 'Done this year' : '+ health'}
              onPress={act(prisonWorkout, null)}
              disabled={used('prison-workout')}
              chevron
            />
            <Row
              emoji="🤫"
              title={`Bribe a guard ($${bribe.toLocaleString()})`}
              subtitle={
                used('bribe')
                  ? 'Done this year'
                  : money < bribe
                    ? 'Not enough money'
                    : 'Pay to shave time off your sentence'
              }
              onPress={act(bribeGuard, 'cash')}
              disabled={used('bribe') || money < bribe}
              chevron
            />
            <Row
              emoji="🏃"
              title="Attempt escape"
              subtitle={used('escape') ? 'Done this year' : 'Risky — failure adds years'}
              onPress={() => {
                attemptEscape()
                onClose()
              }}
              disabled={used('escape')}
              chevron
            />
          </ScrollView>

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
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.slate500 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  badgeNum: { fontSize: 18, fontWeight: '800', color: colors.slate800 },
  badgeCap: { fontSize: 11, color: colors.slate500, marginTop: 1 },
  list: { marginTop: 12 },
  listContent: { gap: 8, paddingBottom: 8 },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
