import { ScrollView, StyleSheet, Text } from 'react-native'
import { playSfx } from '../audio/sfx'
import { ACTIVITIES } from '../data/activities'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import { Row } from './Row'

/** BitLife-style activities menu: one row per thing you can do this year. */
export function ActivitiesScreen() {
  const age = useGameStore((s) => s.age)
  const money = useGameStore((s) => s.money)
  const usedActions = useGameStore((s) => s.usedActions)
  const doActivity = useGameStore((s) => s.doActivity)

  const available = ACTIVITIES.filter((a) => age >= a.minAge)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>🎯 ACTIVITIES</Text>
      {available.length === 0 && (
        <Row emoji="🧸" title="Nothing yet" subtitle="More unlocks as you grow up" />
      )}
      {available.map((activity) => {
        const done = usedActions.includes(`activity-${activity.id}`)
        const tooPoor = money < activity.cost
        const costLabel = activity.cost > 0 ? `$${activity.cost.toLocaleString()}` : 'Free'
        return (
          <Row
            key={activity.id}
            emoji={activity.emoji}
            title={activity.name}
            subtitle={
              done
                ? 'Done this year'
                : tooPoor
                  ? `${costLabel} · not enough money`
                  : `${costLabel} · ${activity.description}`
            }
            onPress={() => {
              playSfx('click')
              doActivity(activity.id)
            }}
            disabled={done || tooPoor}
            chevron
          />
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 8,
    paddingBottom: 110,
  },
  sectionHeading: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate500,
  },
})
