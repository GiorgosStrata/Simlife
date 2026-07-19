import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'

export type TabKey = 'career' | 'life' | 'relationships' | 'activities'

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

type IconName = 'dashboard' | 'career' | 'social' | 'lifestyle'

const ICON_PATHS: Record<IconName, string> = {
  dashboard: 'M3 11 L12 4 L21 11 M5 9.5 V20 H19 V9.5',
  career: 'M3 8 H21 V19 H3 Z M8 8 V6 H16 V8 M3 13 H21',
  social: 'M12 20 C4 14 4 9 4 9 A4 4 0 0 1 12 8 A4 4 0 0 1 20 9 C20 9 20 14 12 20 Z',
  lifestyle: 'M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z',
}

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d={ICON_PATHS[name]}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}

/** Four flat hubs with outline icons — no BitLife five-tab copy. */
export function TabBar({ active, onChange }: TabBarProps) {
  const age = useGameStore((s) => s.age)
  const careerLabel = age < 16 ? 'School' : 'Career'

  const tabs: Array<{ key: TabKey; icon: IconName; label: string; color: string }> = [
    { key: 'life', icon: 'dashboard', label: 'Dashboard', color: colors.cyan500 },
    { key: 'career', icon: 'career', label: careerLabel, color: colors.sky500 },
    { key: 'relationships', icon: 'social', label: 'Social', color: colors.pink600 },
    { key: 'activities', icon: 'lifestyle', label: 'Lifestyle', color: colors.emerald700 },
  ]

  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        const tint = isActive ? tab.color : colors.slate400
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityLabel={`${tab.label} tab`}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <TabIcon name={tab.icon} color={tint} />
            <Text style={[styles.tabLabel, isActive && { color: tab.color }]}>{tab.label}</Text>
            {isActive && <View style={[styles.activeMark, { backgroundColor: tab.color }]} />}
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
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.slate400,
  },
  activeMark: {
    position: 'absolute',
    bottom: -8,
    width: 18,
    height: 2.5,
    borderRadius: 999,
  },
})
