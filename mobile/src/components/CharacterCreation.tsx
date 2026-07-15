import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { COUNTRIES, getCountry } from '../data/countries'
import { randomFirstName, randomGender, randomLastName } from '../data/names'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Gender } from '../types'
import { CountryPickerModal } from './CountryPickerModal'
import { Flag } from './Flag'
import { StatBar } from './StatBar'

function randomCountryCode(): string {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].code
}

export function CharacterCreation() {
  const stats = useGameStore((s) => s.stats)
  const year = useGameStore((s) => s.year)
  const rerollStats = useGameStore((s) => s.rerollStats)
  const startLife = useGameStore((s) => s.startLife)

  const [countryCode, setCountryCode] = useState(randomCountryCode)
  const [gender, setGender] = useState<Gender>(randomGender)
  const [first, setFirst] = useState(() => randomFirstName(countryCode, gender))
  const [last, setLast] = useState(() => randomLastName(countryCode))
  const [pickingCountry, setPickingCountry] = useState(false)
  const country = getCountry(countryCode) ?? COUNTRIES[0]

  const rollName = (code: string, g: Gender) => {
    setFirst(randomFirstName(code, g))
    setLast(randomLastName(code))
  }

  const changeCountry = (code: string) => {
    setCountryCode(code)
    rollName(code, gender)
  }

  const changeGender = (g: Gender) => {
    setGender(g)
    setFirst(randomFirstName(countryCode, g))
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Life</Text>
        <Text style={styles.headerSubtitle}>Who will you be? Born in {year}.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>NAME & GENDER</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => rollName(countryCode, gender)}
            style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
          >
            <Text style={styles.smallButtonText}>🎲 Randomize</Text>
          </Pressable>
        </View>
        <View style={styles.genderRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => changeGender('male')}
            style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
          >
            <Text style={styles.genderEmoji}>👦</Text>
            <Text style={[styles.genderLabel, gender === 'male' && styles.genderLabelActive]}>
              Male
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => changeGender('female')}
            style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
          >
            <Text style={styles.genderEmoji}>👧</Text>
            <Text style={[styles.genderLabel, gender === 'female' && styles.genderLabelActive]}>
              Female
            </Text>
          </Pressable>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>First name</Text>
            <TextInput
              value={first}
              onChangeText={setFirst}
              style={styles.input}
              testID="first-name"
            />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Last name</Text>
            <TextInput value={last} onChangeText={setLast} style={styles.input} testID="last-name" />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>COUNTRY</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => changeCountry(randomCountryCode())}
            style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
          >
            <Text style={styles.smallButtonText}>🎲 Random</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPickingCountry(true)}
          style={({ pressed }) => [styles.countryRow, pressed && styles.countryRowPressed]}
        >
          <Flag code={country.code} width={32} />
          <Text style={styles.countryName}>{country.name}</Text>
          <Text style={styles.countryChevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>BIRTH STATS</Text>
          <Pressable
            accessibilityRole="button"
            onPress={rerollStats}
            style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
          >
            <Text style={styles.smallButtonText}>🎲 Reroll</Text>
          </Pressable>
        </View>
        <StatBar label="Health" value={stats.health} color={colors.rose500} icon="❤️" />
        <StatBar label="Happiness" value={stats.happiness} color={colors.amber400} icon="😊" />
        <StatBar label="Smarts" value={stats.smarts} color={colors.sky500} icon="🧠" />
        <StatBar label="Looks" value={stats.looks} color={colors.violet500} icon="✨" />
      </View>

      <View style={styles.spacer} />

      <Pressable
        accessibilityRole="button"
        onPress={() => startLife(first, last, countryCode, gender)}
        style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
      >
        <Text style={styles.startButtonText}>Start Life 🍼</Text>
      </Pressable>

      {pickingCountry && (
        <CountryPickerModal
          selected={countryCode}
          onSelect={(c) => {
            changeCountry(c.code)
            setPickingCountry(false)
          }}
          onClose={() => setPickingCountry(false)}
        />
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
  },
  header: {
    backgroundColor: colors.cyan600,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.cyan100,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.slate400,
  },
  smallButton: {
    backgroundColor: colors.slate100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallButtonPressed: {
    backgroundColor: colors.slate200,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.slate600,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.slate100,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: colors.cyan50,
    borderColor: colors.cyan500,
  },
  genderEmoji: {
    fontSize: 18,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate500,
  },
  genderLabelActive: {
    color: colors.cyan600,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.slate500,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate800,
    backgroundColor: colors.white,
  },
  spacer: {
    flex: 1,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.slate100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  countryRowPressed: {
    backgroundColor: colors.slate200,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
  },
  countryChevron: {
    fontSize: 22,
    color: colors.slate400,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.cyan500,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.cyan500,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  startButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
})
