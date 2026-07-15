import { useRef } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { LogEntry } from '../types'

const KIND_COLORS: Record<LogEntry['kind'], string> = {
  birthday: colors.slate800,
  event: colors.slate600,
  info: colors.indigo700,
  death: colors.rose700,
  career: colors.sky600,
  relationship: colors.pink600,
  money: colors.emerald700,
}

const KIND_EMOJI: Partial<Record<LogEntry['kind'], string>> = {
  info: '👶',
  death: '🪦',
  money: '💰',
}

/** BitLife-style journal: bold "Age N" headers with the year's lines under them. */
export function LifeLog() {
  const log = useGameStore((s) => s.log)
  const listRef = useRef<FlatList<LogEntry>>(null)

  return (
    <View style={styles.card}>
      <FlatList
        ref={listRef}
        data={log}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyExtractor={(entry) => String(entry.id)}
        renderItem={({ item }) =>
          item.kind === 'birthday' ? (
            <View style={styles.ageHeader}>
              <Text style={styles.ageHeaderText}>
                Age {item.age} · {item.year}
              </Text>
              <View style={styles.ageHeaderLine} />
            </View>
          ) : (
            <Text style={[styles.entry, { color: KIND_COLORS[item.kind] }]}>
              {KIND_EMOJI[item.kind] ? `${KIND_EMOJI[item.kind]} ` : ''}
              {item.text}
            </Text>
          )
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 110,
    paddingTop: 4,
  },
  ageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  ageHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate800,
  },
  ageHeaderLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.slate200,
  },
  entry: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 5,
  },
})
