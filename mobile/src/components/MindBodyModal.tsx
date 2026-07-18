import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { scaleByCountry } from '../data/countries'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface MindBodyModalProps {
  onClose: () => void
}

/**
 * BitLife-style Mind & Body: one-off medical & self-care visits, one of each
 * per year. Deliberately medical/cosmetic only — the gym and meditation live
 * in Activities as ongoing pursuits, so nothing is duplicated here.
 */
export function MindBodyModal({ onClose }: MindBodyModalProps) {
  const stats = useGameStore((s) => s.stats)
  const age = useGameStore((s) => s.age)
  const money = useGameStore((s) => s.money)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const seeDoctor = useGameStore((s) => s.seeDoctor)
  const seeDentist = useGameStore((s) => s.seeDentist)
  const seeTherapist = useGameStore((s) => s.seeTherapist)
  const plasticSurgery = useGameStore((s) => s.plasticSurgery)
  const spaDay = useGameStore((s) => s.spaDay)

  useEffect(() => {
    playSfx('pop')
  }, [])

  useCloseOnAction(onClose)
  const act = confirmAction(onClose)
  const used = (k: string) => usedActions.includes(k)
  const price = (base: number) => scaleByCountry(base, countryCode)
  const money$ = (base: number) => `$${price(base).toLocaleString()}`

  // A cost/availability-aware subtitle so locked reasons are obvious.
  const sub = (opts: { key: string; cost?: number; minAge?: number; ready: string }): string => {
    if (used(opts.key)) return 'Done this year'
    if (opts.minAge && age < opts.minAge) return `Available at ${opts.minAge}`
    if (opts.cost && money < price(opts.cost)) return 'Not enough money'
    return opts.ready
  }

  const disabled = (opts: { key: string; cost?: number; minAge?: number }): boolean =>
    used(opts.key) ||
    (opts.minAge ? age < opts.minAge : false) ||
    (opts.cost ? money < price(opts.cost) : false)

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>🧘 Mind & Body</Text>
          <Text style={styles.subtitle}>
            Look after yourself. Staying healthy keeps you alive far longer.
          </Text>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>{Math.round(stats.health)}</Text>
              <Text style={styles.badgeCap}>❤️ Health</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>{Math.round(stats.happiness)}</Text>
              <Text style={styles.badgeCap}>😊 Happiness</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>{Math.round(stats.looks)}</Text>
              <Text style={styles.badgeCap}>✨ Looks</Text>
            </View>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Row
              emoji="🩺"
              title={`See a doctor (${money$(150)})`}
              subtitle={sub({ key: 'doctor', cost: 150, ready: 'A checkup and treatment to restore health' })}
              onPress={act(seeDoctor, 'success')}
              disabled={disabled({ key: 'doctor', cost: 150 })}
              chevron
            />
            <Row
              emoji="🦷"
              title={`See a dentist (${money$(120)})`}
              subtitle={sub({ key: 'dentist', cost: 120, ready: 'Cleaner teeth — a brighter smile' })}
              onPress={act(seeDentist, 'success')}
              disabled={disabled({ key: 'dentist', cost: 120 })}
              chevron
            />
            <Row
              emoji="🛋️"
              title={`See a therapist (${money$(250)})`}
              subtitle={sub({ key: 'therapist', cost: 250, ready: 'Work through things — big happiness boost' })}
              onPress={act(seeTherapist, 'success')}
              disabled={disabled({ key: 'therapist', cost: 250 })}
              chevron
            />
            <Row
              emoji="💆"
              title={`Spa day (${money$(200)})`}
              subtitle={sub({ key: 'spa', cost: 200, ready: '+ happiness and looks' })}
              onPress={act(spaDay, 'cash')}
              disabled={disabled({ key: 'spa', cost: 200 })}
              chevron
            />
            <Row
              emoji="💉"
              title={`Plastic surgery (${money$(7000)})`}
              subtitle={sub({ key: 'surgery', cost: 7000, minAge: 18, ready: 'Big looks boost — small risk it goes wrong' })}
              onPress={act(plasticSurgery, 'cash')}
              disabled={disabled({ key: 'surgery', cost: 7000, minAge: 18 })}
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
