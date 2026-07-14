import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

export type TabKey = 'career' | 'life' | 'relationships'

const TABS: Array<{ key: TabKey; icon: string; label: string }> = [
  { key: 'career', icon: '💼', label: 'Career' },
  { key: 'life', icon: '📖', label: 'Life' },
  { key: 'relationships', icon: '❤️', label: 'Love' },
]

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityLabel={`${tab.label} tab`}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
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
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 7,
  },
  tabActive: {
    backgroundColor: colors.cyan50,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate400,
    marginTop: 1,
  },
  tabLabelActive: {
    color: colors.cyan600,
  },
})
