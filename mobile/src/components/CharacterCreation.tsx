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
import {
  FACIAL_HAIR,
  FEMALE_TOPS,
  GLASSES,
  HAIR_COLORS,
  MALE_TOPS,
  SKIN_TONES,
  randomAvatarConfig,
  retargetGender,
  type AvatarConfig,
} from '../data/avatar'
import { COUNTRIES, getCountry } from '../data/countries'
import { randomFirstName, randomGender, randomLastName } from '../data/names'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Gender } from '../types'
import { Avatar } from './Avatar'
import { CountryPickerModal } from './CountryPickerModal'
import { Flag } from './Flag'
import { StatBar } from './StatBar'

function randomCountryCode(): string {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].code
}

/** A labelled ‹ › stepper for cycling an avatar option. */
function Stepper({
  label,
  onPrev,
  onNext,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} previous`} onPress={onPrev} style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}>
        <Text style={styles.stepperArrow}>‹</Text>
      </Pressable>
      <Text style={styles.stepperLabel}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} next`} onPress={onNext} style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}>
        <Text style={styles.stepperArrow}>›</Text>
      </Pressable>
    </View>
  )
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
  const [avatar, setAvatar] = useState<AvatarConfig>(() => randomAvatarConfig(gender))
  const country = getCountry(countryCode) ?? COUNTRIES[0]

  const tops = gender === 'male' ? MALE_TOPS : FEMALE_TOPS

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
    setAvatar((a) => retargetGender(a, g))
  }

  const setField = (patch: Partial<AvatarConfig>) => setAvatar((a) => ({ ...a, ...patch }))

  /** Step a value forward/back within a list (wrapping). */
  const cycle = (list: string[], current: string, dir: number): string => {
    const i = list.indexOf(current)
    const next = (i + dir + list.length) % list.length
    return list[next]
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Avatar config={avatar} size={64} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>New Life</Text>
          <Text style={styles.headerSubtitle}>Who will you be? Born in {year}.</Text>
        </View>
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
          <Text style={styles.cardHeading}>APPEARANCE</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAvatar(randomAvatarConfig(gender))}
            style={({ pressed }) => [styles.smallButton, pressed && styles.smallButtonPressed]}
          >
            <Text style={styles.smallButtonText}>🎲 Surprise me</Text>
          </Pressable>
        </View>

        <View style={styles.appearancePreview}>
          <Avatar config={avatar} size={104} />
        </View>

        <Text style={styles.fieldLabel}>Skin tone</Text>
        <View style={styles.swatchRow}>
          {SKIN_TONES.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Skin ${c}`}
              onPress={() => setField({ skinColor: c })}
              style={[
                styles.swatch,
                { backgroundColor: `#${c}` },
                avatar.skinColor === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Hair colour</Text>
        <View style={styles.swatchRow}>
          {HAIR_COLORS.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Hair ${c}`}
              onPress={() => setField({ hairColor: c })}
              style={[
                styles.swatch,
                { backgroundColor: `#${c}` },
                avatar.hairColor === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>

        <Stepper
          label="Hairstyle"
          onPrev={() => setField({ top: cycle(tops, avatar.top, -1) })}
          onNext={() => setField({ top: cycle(tops, avatar.top, 1) })}
        />
        <Stepper
          label={avatar.glasses ? 'Glasses' : 'No glasses'}
          onPrev={() => setField({ glasses: cycle(GLASSES, avatar.glasses, -1) })}
          onNext={() => setField({ glasses: cycle(GLASSES, avatar.glasses, 1) })}
        />
        {gender === 'male' && (
          <Stepper
            label={avatar.facialHair ? 'Facial hair' : 'Clean-shaven'}
            onPrev={() => setField({ facialHair: cycle(FACIAL_HAIR, avatar.facialHair, -1) })}
            onNext={() => setField({ facialHair: cycle(FACIAL_HAIR, avatar.facialHair, 1) })}
          />
        )}
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
        onPress={() => startLife(first, last, countryCode, gender, avatar)}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cyan600,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.cyan400,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onColor,
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
  appearancePreview: {
    alignSelf: 'center',
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: colors.cyan100,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate500,
    marginTop: 10,
    marginBottom: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.slate200,
  },
  swatchSelected: {
    borderColor: colors.cyan500,
    borderWidth: 3,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.slate100,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginTop: 10,
  },
  stepperBtn: {
    width: 40,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPressed: {
    backgroundColor: colors.cyan50,
  },
  stepperArrow: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.cyan600,
    lineHeight: 24,
  },
  stepperLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate800,
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
    color: colors.onColor,
  },
})
