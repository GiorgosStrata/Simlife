import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getActivity } from '../data/activities'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { ActivityCategory } from '../types'
import { CrimeModal } from './CrimeModal'
import { PursuitModal } from './PursuitModal'
import { Row } from './Row'

/** BitLife-style activities menu: pick a category, then an activity. */
export function ActivitiesScreen() {
  const pursuits = useGameStore((s) => s.pursuits)
  const [category, setCategory] = useState<ActivityCategory | null>(null)
  const [crime, setCrime] = useState(false)

  const activeLabel = (cat: ActivityCategory): string => {
    const active = pursuits[cat]
    if (!active) return 'Nothing yet — tap to start'
    const a = getActivity(active.id)
    if (active.label) return `Learning ${active.label} · ${active.years}/${a?.durationYears} yrs`
    return `Currently: ${a?.name ?? '...'}`
  }

  const open = (cat: ActivityCategory) => () => {
    playSfx('click')
    setCategory(cat)
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>🎯 ACTIVITIES</Text>
      <Row emoji="🏅" title="Sport" subtitle={activeLabel('sport')} onPress={open('sport')} chevron />
      <Row emoji="🧠" title="Mind" subtitle={activeLabel('mind')} onPress={open('mind')} chevron />
      <Row emoji="🎨" title="Hobbies" subtitle={activeLabel('hobby')} onPress={open('hobby')} chevron />
      <Row
        emoji="🦹"
        title="Crime"
        subtitle="Risky one-off jobs — you might get caught"
        onPress={() => {
          playSfx('click')
          setCrime(true)
        }}
        chevron
      />

      {category && <PursuitModal category={category} onClose={() => setCategory(null)} />}
      {crime && <CrimeModal onClose={() => setCrime(false)} />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 8, paddingBottom: 110 },
  sectionHeading: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate500,
  },
})
