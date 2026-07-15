import { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { COUNTRIES } from '../data/countries'
import { colors } from '../theme'
import type { Country } from '../types'

interface CountryPickerModalProps {
  selected: string
  onSelect: (country: Country) => void
  onClose: () => void
}

/** BitLife-style country list: every country, flags and all, searchable. */
export function CountryPickerModal({ selected, onSelect, onClose }: CountryPickerModalProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return COUNTRIES
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(needle))
  }, [query])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Where are you born?</Text>
          <Text style={styles.subtitle}>Your country sets the salaries you can earn.</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="🔍 Search countries..."
            placeholderTextColor={colors.slate400}
            style={styles.search}
            testID="country-search"
          />
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.code}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  playSfx('click')
                  onSelect(item)
                }}
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                  item.code === selected && styles.rowSelected,
                ]}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.name}>{item.name}</Text>
                {item.code === selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            )}
          />
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
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
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.slate800,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.slate500,
  },
  search: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate800,
    backgroundColor: colors.slate100,
  },
  list: {
    marginTop: 10,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowPressed: {
    backgroundColor: colors.cyan50,
  },
  rowSelected: {
    backgroundColor: colors.cyan50,
  },
  flag: {
    fontSize: 24,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate800,
  },
  check: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.cyan600,
  },
  cancel: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate500,
  },
})
