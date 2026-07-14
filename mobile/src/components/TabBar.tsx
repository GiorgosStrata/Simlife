import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

export type TabKey = 'career' | 'life' | 'relationships'

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  const age = useGameStore((s) => s.age)
  // "Education" until you're old enough to work; "Career" after.
  const careerTab =
    age < 16 ? { icon: '🎓', label: 'Education' } : { icon: '💼', label: 'Career' }

  const tabs: Array<{ key: TabKey; icon: string; label: string }> = [
    { key: 'career', ...careerTab },
    { key: 'life', icon: '📖', label: 'Life' },
    { key: 'relationships', icon: '❤️', label: 'Love' },
  ]

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityLabel={`${tab.label} tab`}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 13,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: colors.cyan50,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate400,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.cyan600,
  },
})
