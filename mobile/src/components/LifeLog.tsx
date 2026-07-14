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
}

const KIND_WEIGHTS: Record<LogEntry['kind'], '400' | '600'> = {
  birthday: '600',
  event: '400',
  info: '400',
  death: '600',
  career: '400',
  relationship: '400',
}

export function LifeLog() {
  const log = useGameStore((s) => s.log)
  const listRef = useRef<FlatList<LogEntry>>(null)

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>LIFE STORY</Text>
      <FlatList
        ref={listRef}
        data={log}
        contentContainerStyle={styles.listContent}
        keyExtractor={(entry) => String(entry.id)}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <Text style={styles.entry}>
            <Text style={styles.age}>Age {item.age}  </Text>
            <Text style={{ color: KIND_COLORS[item.kind], fontWeight: KIND_WEIGHTS[item.kind] }}>
              {item.text}
            </Text>
          </Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.slate400,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 56,
  },
  entry: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  age: {
    fontSize: 11,
    color: colors.slate400,
    fontVariant: ['tabular-nums'],
  },
})
