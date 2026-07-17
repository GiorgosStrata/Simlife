import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import {
  DATE_COST,
  GETAWAY_COST,
  GIFT_COST,
  LUNCH_COST,
  MAX_FRIENDS,
  MOVIE_COST,
  PROPOSAL_MIN_RELATIONSHIP,
  WEDDING_COST,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import type { PartnerStatus, Person } from '../types'
import { confirmAction } from './actionRunner'
import { PersonAvatar } from './Avatar'
import { Row } from './Row'

export function personEmoji(person: Person): string {
  const male = person.gender === 'male'
  switch (person.role) {
    case 'mother':
      return '👩'
    case 'father':
      return '👨'
    case 'sibling':
      return male ? '👦' : '👧'
    case 'child':
      return male ? '👦' : '👧'
    case 'partner':
      return male ? '👨' : '👩'
    case 'friend':
      return male ? '🙋‍♂️' : '🙋‍♀️'
    case 'classmate':
      return male ? '👨‍🎓' : '👩‍🎓'
    case 'teacher':
      return male ? '👨‍🏫' : '👩‍🏫'
    case 'coworker':
      return male ? '👨‍💼' : '👩‍💼'
    case 'boss':
      return male ? '🤵' : '🤵‍♀️'
    case 'enemy':
      return '😠'
  }
}

export function roleLabel(person: Person, partnerStatus: PartnerStatus | null): string {
  const male = person.gender === 'male'
  if (person.role === 'partner') {
    if (partnerStatus === 'married') return male ? 'Husband' : 'Wife'
    if (partnerStatus === 'engaged') return male ? 'Fiancé' : 'Fiancée'
    return male ? 'Boyfriend' : 'Girlfriend'
  }
  if (person.role === 'sibling') return male ? 'Brother' : 'Sister'
  if (person.role === 'child') return male ? 'Son' : 'Daughter'
  if (person.role === 'enemy') return 'Enemy'
  return person.role.charAt(0).toUpperCase() + person.role.slice(1)
}

interface PersonModalProps {
  personId: string
  onClose: () => void
}

/** BitLife-style person sheet: tap a person, then pick an interaction. */
export function PersonModal({ personId, onClose }: PersonModalProps) {
  const person = useGameStore((s) => s.relationships.find((p) => p.id === personId))
  const age = useGameStore((s) => s.age)
  const money = useGameStore((s) => s.money)
  const usedActions = useGameStore((s) => s.usedActions)
  const partnerStatus = useGameStore((s) => s.partnerStatus)
  const relationships = useGameStore((s) => s.relationships)
  const spendTime = useGameStore((s) => s.spendTime)
  const giveGift = useGameStore((s) => s.giveGift)
  const compliment = useGameStore((s) => s.compliment)
  const insult = useGameStore((s) => s.insult)
  const askForMoney = useGameStore((s) => s.askForMoney)
  const askForAdvice = useGameStore((s) => s.askForAdvice)
  const prankSibling = useGameStore((s) => s.prankSibling)
  const watchMovie = useGameStore((s) => s.watchMovie)
  const studyTogether = useGameStore((s) => s.studyTogether)
  const grabLunch = useGameStore((s) => s.grabLunch)
  const weekendGetaway = useGameStore((s) => s.weekendGetaway)
  const askTeacherHelp = useGameStore((s) => s.askTeacherHelp)
  const befriendClassmate = useGameStore((s) => s.befriendClassmate)
  const goOnDate = useGameStore((s) => s.goOnDate)
  const propose = useGameStore((s) => s.propose)
  const marry = useGameStore((s) => s.marry)
  const breakUp = useGameStore((s) => s.breakUp)
  const tryForBaby = useGameStore((s) => s.tryForBaby)
  const makePeace = useGameStore((s) => s.makePeace)

  useEffect(() => {
    playSfx('pop')
  }, [])

  if (!person) return null

  const used = (key: string) => usedActions.includes(key)
  const act = confirmAction(onClose)

  const isParent = person.role === 'mother' || person.role === 'father'
  const isPartner = person.role === 'partner'
  const isSibling = person.role === 'sibling'
  const isFriend = person.role === 'friend'
  const isClassmate = person.role === 'classmate'
  const isTeacher = person.role === 'teacher'
  const isWorkPerson = person.role === 'coworker' || person.role === 'boss'
  const isEnemy = person.role === 'enemy'
  const livingFriends = relationships.filter((p) => p.role === 'friend' && p.alive).length
  const canPropose =
    isPartner && partnerStatus === 'dating' && person.relationship >= PROPOSAL_MIN_RELATIONSHIP
  const canMarry = isPartner && partnerStatus === 'engaged' && money >= WEDDING_COST

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <PersonAvatar person={person} size={52} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.meta}>
                {roleLabel(person, partnerStatus)} ·{' '}
                {person.alive ? `age ${person.age}` : `passed away at ${person.age}`}
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

          {person.alive && (
            <ScrollView style={styles.actions} contentContainerStyle={styles.actionsContent}>
              <Row
                emoji="🕰️"
                title="Spend time together"
                subtitle={used(`time-${person.id}`) ? 'Done this year' : '+ bond, + happiness'}
                onPress={act(() => spendTime(person.id))}
                disabled={used(`time-${person.id}`)}
                chevron
              />
              <Row
                emoji="😊"
                title="Compliment"
                subtitle={used(`compliment-${person.id}`) ? 'Done this year' : '+ bond'}
                onPress={act(() => compliment(person.id))}
                disabled={used(`compliment-${person.id}`)}
                chevron
              />
              <Row
                emoji="🎁"
                title={`Give a gift ($${GIFT_COST})`}
                subtitle={
                  used(`gift-${person.id}`)
                    ? 'Done this year'
                    : money < GIFT_COST
                      ? 'Not enough money'
                      : '+ + bond'
                }
                onPress={act(() => giveGift(person.id))}
                disabled={used(`gift-${person.id}`) || money < GIFT_COST}
                chevron
              />
              {isParent && age < 18 && (
                <Row
                  emoji="🪙"
                  title="Ask for pocket money"
                  subtitle={used(`ask-money-${person.id}`) ? 'Done this year' : 'Works better with a good bond'}
                  onPress={act(() => askForMoney(person.id))}
                  disabled={used(`ask-money-${person.id}`)}
                  chevron
                />
              )}
              {isParent && (
                <Row
                  emoji="🦉"
                  title="Ask for life advice"
                  subtitle={used(`advice-${person.id}`) ? 'Done this year' : '+ smarts, + bond'}
                  onPress={act(() => askForAdvice(person.id))}
                  disabled={used(`advice-${person.id}`)}
                  chevron
                />
              )}
              {isSibling && (
                <Row
                  emoji="🪤"
                  title="Pull a prank"
                  subtitle={used(`prank-${person.id}`) ? 'Done this year' : '50/50 it lands or backfires'}
                  onPress={act(() => prankSibling(person.id))}
                  disabled={used(`prank-${person.id}`)}
                  chevron
                />
              )}
              {isFriend && (
                <Row
                  emoji="🎬"
                  title={`Go to the movies ($${MOVIE_COST})`}
                  subtitle={
                    used(`movie-${person.id}`)
                      ? 'Done this year'
                      : money < MOVIE_COST
                        ? 'Not enough money'
                        : '+ bond, + happiness'
                  }
                  onPress={act(() => watchMovie(person.id))}
                  disabled={used(`movie-${person.id}`) || money < MOVIE_COST}
                  chevron
                />
              )}
              {isClassmate && (
                <Row
                  emoji="📚"
                  title="Study together"
                  subtitle={used(`study-with-${person.id}`) ? 'Done this year' : '+ smarts, + bond'}
                  onPress={act(() => studyTogether(person.id))}
                  disabled={used(`study-with-${person.id}`)}
                  chevron
                />
              )}
              {isWorkPerson && (
                <Row
                  emoji="🥪"
                  title={`Grab lunch ($${LUNCH_COST})`}
                  subtitle={
                    used(`lunch-${person.id}`)
                      ? 'Done this year'
                      : money < LUNCH_COST
                        ? 'Not enough money'
                        : '+ bond, + happiness'
                  }
                  onPress={act(() => grabLunch(person.id))}
                  disabled={used(`lunch-${person.id}`) || money < LUNCH_COST}
                  chevron
                />
              )}
              {isTeacher && (
                <Row
                  emoji="🍎"
                  title="Ask for extra help"
                  subtitle={used(`teacher-help-${person.id}`) ? 'Done this year' : '+ smarts, + bond'}
                  onPress={act(() => askTeacherHelp(person.id))}
                  disabled={used(`teacher-help-${person.id}`)}
                  chevron
                />
              )}
              {isClassmate && (
                <Row
                  emoji="🤝"
                  title="Become friends"
                  subtitle={
                    person.relationship < 60
                      ? 'Needs 60+ bond — hang out first'
                      : livingFriends >= MAX_FRIENDS
                        ? 'Your friend list is full'
                        : 'Make it official'
                  }
                  onPress={act(() => befriendClassmate(person.id), 'success')}
                  disabled={person.relationship < 60 || livingFriends >= MAX_FRIENDS}
                  chevron
                />
              )}
              {isPartner && (
                <>
                  <Row
                    emoji="🌹"
                    title={`Go on a date ($${DATE_COST})`}
                    subtitle={used('date') ? 'Done this year' : '+ bond, + happiness'}
                    onPress={act(goOnDate)}
                    disabled={used('date') || money < DATE_COST}
                    chevron
                  />
                  <Row
                    emoji="🏝️"
                    title={`Weekend getaway ($${GETAWAY_COST})`}
                    subtitle={
                      used('getaway')
                        ? 'Done this year'
                        : money < GETAWAY_COST
                          ? 'Not enough money'
                          : '+ + bond, + + happiness'
                    }
                    onPress={act(weekendGetaway)}
                    disabled={used('getaway') || money < GETAWAY_COST}
                    chevron
                  />
                  <Row
                    emoji="👶"
                    title="Try for a baby"
                    subtitle={
                      used('try-baby')
                        ? 'Done this year'
                        : age < 18 || age > 55
                          ? 'Not the right time in life'
                          : partnerStatus === 'married'
                            ? 'Good odds'
                            : 'Possible, but harder unmarried'
                    }
                    onPress={act(tryForBaby, 'baby')}
                    disabled={used('try-baby') || age < 18 || age > 55}
                    chevron
                  />
                  {partnerStatus === 'dating' && (
                    <Row
                      emoji="💍"
                      title="Propose"
                      subtitle={
                        canPropose
                          ? 'Pop the question'
                          : `Needs ${PROPOSAL_MIN_RELATIONSHIP}+ bond`
                      }
                      onPress={act(propose, 'success')}
                      disabled={!canPropose}
                      chevron
                    />
                  )}
                  {partnerStatus === 'engaged' && (
                    <Row
                      emoji="💒"
                      title={`Get married ($${WEDDING_COST.toLocaleString()})`}
                      subtitle={canMarry ? 'Tie the knot' : 'Save up for the wedding'}
                      onPress={act(marry, 'wedding')}
                      disabled={!canMarry}
                      chevron
                    />
                  )}
                  <Row
                    emoji="💔"
                    title={partnerStatus === 'married' ? 'Divorce' : 'Break up'}
                    subtitle={partnerStatus === 'married' ? 'They take half of everything' : 'End it'}
                    onPress={() => {
                      playSfx('heartbreak')
                      breakUp()
                      onClose()
                    }}
                    chevron
                  />
                </>
              )}
              {isEnemy && (
                <Row
                  emoji="🕊️"
                  title="Make peace"
                  subtitle={used(`peace-${person.id}`) ? 'Done this year' : '55% chance to end the feud'}
                  onPress={act(() => makePeace(person.id), 'success')}
                  disabled={used(`peace-${person.id}`)}
                  chevron
                />
              )}
              <Row
                emoji="🤬"
                title="Insult"
                subtitle={used(`insult-${person.id}`) ? 'Done this year' : '- - bond. They may clap back'}
                onPress={act(() => insult(person.id), 'punch')}
                disabled={used(`insult-${person.id}`)}
                chevron
              />
            </ScrollView>
          )}

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
    backgroundColor: colors.slate100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 27,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate800,
  },
  meta: {
    fontSize: 13,
    color: colors.slate500,
    marginTop: 1,
  },
  bondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  bondLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate600,
  },
  bondTrack: {
    flex: 1,
    height: 12,
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
    fontWeight: '700',
    textAlign: 'right',
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    marginTop: 14,
  },
  actionsContent: {
    gap: 8,
    paddingBottom: 4,
  },
  cancel: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate500,
  },
})
