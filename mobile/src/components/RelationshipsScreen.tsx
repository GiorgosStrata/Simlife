import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  GIFT_COST,
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
}

function roleLabel(person: Person, partnerStatus: PartnerStatus | null): string {
  if (person.role === 'partner') {
    if (partnerStatus === 'married') return 'Spouse'
    if (partnerStatus === 'engaged') return 'Fiancé(e)'
    return 'Partner'
  }
  return person.role.charAt(0).toUpperCase() + person.role.slice(1)
}

function PersonCard({ person }: { person: Person }) {
  const money = useGameStore((s) => s.money)
  const partnerStatus = useGameStore((s) => s.partnerStatus)
  const spendTime = useGameStore((s) => s.spendTime)
  const giveGift = useGameStore((s) => s.giveGift)
  const propose = useGameStore((s) => s.propose)
  const marry = useGameStore((s) => s.marry)
  const breakUp = useGameStore((s) => s.breakUp)

  if (!person.alive) {
    return (
      <View style={[styles.card, styles.cardDeceased]}>
        <Text style={styles.personName}>
          🪦 {person.name} · {roleLabel(person, partnerStatus)}
        </Text>
        <Text style={styles.personMeta}>Passed away at age {person.age}</Text>
      </View>
    )
  }

  const isPartner = person.role === 'partner'
  const canPropose =
    isPartner && partnerStatus === 'dating' && person.relationship >= PROPOSAL_MIN_RELATIONSHIP
  const canMarry = isPartner && partnerStatus === 'engaged' && money >= WEDDING_COST

  return (
    <View style={styles.card}>
      <View style={styles.personHeader}>
        <Text style={styles.personName}>
          {ROLE_EMOJI[person.role]} {person.name}
        </Text>
        <Text style={styles.personMeta}>
          {roleLabel(person, partnerStatus)} · {person.age}
        </Text>
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
          onPress={() => spendTime(person.id)}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionText}>🕰️ Spend time</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => giveGift(person.id)}
          disabled={money < GIFT_COST}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
            money < GIFT_COST && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.actionText}>🎁 Gift (${GIFT_COST})</Text>
        </Pressable>
        {isPartner && partnerStatus === 'dating' && (
          <Pressable
            accessibilityRole="button"
            onPress={propose}
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
            onPress={marry}
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
            onPress={breakUp}
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
          Bond {PROPOSAL_MIN_RELATIONSHIP}+ needed to propose — spend time together.
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

export function RelationshipsScreen() {
  const age = useGameStore((s) => s.age)
  const relationships = useGameStore((s) => s.relationships)
  const findLove = useGameStore((s) => s.findLove)

  const hasPartner = relationships.some((p) => p.id === 'partner')

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {age >= 18 && !hasPartner && (
        <Pressable
          accessibilityRole="button"
          onPress={findLove}
          style={({ pressed }) => [styles.findLove, pressed && styles.findLovePressed]}
        >
          <Text style={styles.findLoveText}>💘 Find Love</Text>
        </Pressable>
      )}
      {relationships.map((person) => (
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
    gap: 12,
    paddingBottom: 64,
  },
  findLove: {
    backgroundColor: colors.cyan500,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  findLovePressed: {
    backgroundColor: colors.cyan400,
  },
  findLoveText: {
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
    justifyContent: 'space-between',
    marginBottom: 8,
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
