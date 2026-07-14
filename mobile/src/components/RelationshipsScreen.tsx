import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import {
  DATE_COST,
  GIFT_COST,
  MAX_FRIENDS,
  PROPOSAL_MIN_RELATIONSHIP,
  WEDDING_COST,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import type { PartnerStatus, Person } from '../types'

const ROLE_EMOJI: Record<Person['role'], string> = {
  mother: '👩',
  father: '👨',
  sibling: '🧑',
  partner: '❤️',
  friend: '😎',
}

function roleLabel(person: Person, partnerStatus: PartnerStatus | null): string {
  if (person.role === 'partner') {
    if (partnerStatus === 'married') return 'Spouse'
    if (partnerStatus === 'engaged') return 'Fiancé(e)'
    return 'Boyfriend/Girlfriend'
  }
  return person.role.charAt(0).toUpperCase() + person.role.slice(1)
}

function PersonCard({ person }: { person: Person }) {
  const age = useGameStore((s) => s.age)
  const money = useGameStore((s) => s.money)
  const usedActions = useGameStore((s) => s.usedActions)
  const partnerStatus = useGameStore((s) => s.partnerStatus)
  const spendTime = useGameStore((s) => s.spendTime)
  const giveGift = useGameStore((s) => s.giveGift)
  const askForMoney = useGameStore((s) => s.askForMoney)
  const goOnDate = useGameStore((s) => s.goOnDate)
  const propose = useGameStore((s) => s.propose)
  const marry = useGameStore((s) => s.marry)
  const breakUp = useGameStore((s) => s.breakUp)

  if (!person.alive) {
    return (
      <View style={[styles.card, styles.cardDeceased]}>
        <View style={styles.personHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🪦</Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personMeta}>
              {roleLabel(person, partnerStatus)} · passed away at {person.age}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const isPartner = person.role === 'partner'
  const isParent = person.role === 'mother' || person.role === 'father'
  const canPropose =
    isPartner && partnerStatus === 'dating' && person.relationship >= PROPOSAL_MIN_RELATIONSHIP
  const canMarry = isPartner && partnerStatus === 'engaged' && money >= WEDDING_COST
  const askedThisYear = usedActions.includes(`ask-money-${person.id}`)

  const tap = (run: () => void, sfx: 'click' | 'success' | 'fail' = 'click') => () => {
    playSfx(sfx)
    run()
  }

  return (
    <View style={styles.card}>
      <View style={styles.personHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>{ROLE_EMOJI[person.role]}</Text>
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.personMeta}>
            {roleLabel(person, partnerStatus)} · age {person.age}
          </Text>
        </View>
      </View>

      <View style={styles.bondRow}>
        <Text style={styles.bondLabel}>Bond</Text>
        <View
          style={styles.bondTrack}
          accessibilityRole="progressbar"
          accessibilityLabel={`Bond with ${person.name}`}
          accessibilityValue={{ min: 0, max: 100, now: person.relationship }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={person.relationship}
        >
          <View style={[styles.bondFill, { width: `${person.relationship}%` }]} />
        </View>
        <Text style={styles.bondValue}>{person.relationship}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={tap(() => spendTime(person.id))}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionText}>🕰️ Spend time</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={tap(() => giveGift(person.id))}
          disabled={money < GIFT_COST}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
            money < GIFT_COST && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.actionText}>🎁 Gift (${GIFT_COST})</Text>
        </Pressable>
        {isParent && age < 18 && (
          <Pressable
            accessibilityRole="button"
            onPress={tap(() => askForMoney(person.id))}
            disabled={askedThisYear}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
              askedThisYear && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.actionText}>🪙 Ask for pocket money</Text>
          </Pressable>
        )}
        {isPartner && (
          <Pressable
            accessibilityRole="button"
            onPress={tap(goOnDate)}
            disabled={money < DATE_COST}
            style={({ pressed }) => [
              styles.actionButton,
              styles.loveButton,
              pressed && styles.actionButtonPressed,
              money < DATE_COST && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.actionText}>🌹 Go on a date (${DATE_COST})</Text>
          </Pressable>
        )}
        {isPartner && partnerStatus === 'dating' && (
          <Pressable
            accessibilityRole="button"
            onPress={tap(propose, 'success')}
            disabled={!canPropose}
            style={({ pressed }) => [
              styles.actionButton,
              styles.loveButton,
              pressed && styles.actionButtonPressed,
              !canPropose && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.actionText}>💍 Propose</Text>
          </Pressable>
        )}
        {isPartner && partnerStatus === 'engaged' && (
          <Pressable
            accessibilityRole="button"
            onPress={tap(marry, 'success')}
            disabled={!canMarry}
            style={({ pressed }) => [
              styles.actionButton,
              styles.loveButton,
              pressed && styles.actionButtonPressed,
              !canMarry && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.actionText}>💒 Marry (${WEDDING_COST.toLocaleString()})</Text>
          </Pressable>
        )}
        {isPartner && (
          <Pressable
            accessibilityRole="button"
            onPress={tap(breakUp, 'fail')}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={[styles.actionText, styles.dangerText]}>
              {partnerStatus === 'married' ? '💔 Divorce' : '💔 Break up'}
            </Text>
          </Pressable>
        )}
      </View>

      {isPartner && partnerStatus === 'dating' && person.relationship < PROPOSAL_MIN_RELATIONSHIP && (
        <Text style={styles.hint}>
          Bond {PROPOSAL_MIN_RELATIONSHIP}+ needed to propose — spend time and go on dates.
        </Text>
      )}
      {isPartner && partnerStatus === 'engaged' && money < WEDDING_COST && (
        <Text style={styles.hint}>
          The wedding costs ${WEDDING_COST.toLocaleString()} — save up first.
        </Text>
      )}
    </View>
  )
}

const SECTION_ORDER: Person['role'][] = ['partner', 'mother', 'father', 'sibling', 'friend']

export function RelationshipsScreen() {
  const age = useGameStore((s) => s.age)
  const relationships = useGameStore((s) => s.relationships)
  const usedActions = useGameStore((s) => s.usedActions)
  const findLove = useGameStore((s) => s.findLove)
  const makeFriend = useGameStore((s) => s.makeFriend)

  const hasPartner = relationships.some((p) => p.id === 'partner')
  const livingFriends = relationships.filter((p) => p.role === 'friend' && p.alive).length
  const canMakeFriend =
    age >= 5 && livingFriends < MAX_FRIENDS && !usedActions.includes('make-friend')

  const sorted = [...relationships].sort(
    (a, b) => SECTION_ORDER.indexOf(a.role) - SECTION_ORDER.indexOf(b.role),
  )

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {age >= 18 && !hasPartner && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            playSfx('click')
            findLove()
          }}
          style={({ pressed }) => [styles.bigButton, pressed && styles.bigButtonPressed]}
        >
          <Text style={styles.bigButtonText}>💘 Find Love</Text>
        </Pressable>
      )}
      {age >= 5 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            playSfx('click')
            makeFriend()
          }}
          disabled={!canMakeFriend}
          style={({ pressed }) => [
            styles.bigButton,
            styles.friendButton,
            pressed && styles.bigButtonPressed,
            !canMakeFriend && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.bigButtonText}>
            🤝 Make a new friend ({livingFriends}/{MAX_FRIENDS})
          </Text>
        </Pressable>
      )}
      {sorted.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 10,
    paddingBottom: 110,
  },
  bigButton: {
    backgroundColor: colors.cyan500,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  friendButton: {
    backgroundColor: colors.cyan600,
  },
  bigButtonPressed: {
    backgroundColor: colors.cyan400,
  },
  bigButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  cardDeceased: {
    opacity: 0.6,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 22,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate800,
    flexShrink: 1,
  },
  personMeta: {
    fontSize: 12,
    color: colors.slate500,
    marginTop: 1,
  },
  bondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bondLabel: {
    width: 34,
    fontSize: 12,
    fontWeight: '500',
    color: colors.slate600,
  },
  bondTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  bondFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.pink600,
  },
  bondValue: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: colors.slate100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loveButton: {
    backgroundColor: colors.cyan50,
  },
  actionButtonPressed: {
    backgroundColor: colors.slate200,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate600,
  },
  dangerText: {
    color: colors.rose700,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.slate500,
  },
})
