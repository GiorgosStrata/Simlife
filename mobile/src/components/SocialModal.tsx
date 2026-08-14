import { useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import {
  BUY_FOLLOWERS_COST,
  COLLAB_MIN_FOLLOWERS,
  COLLAB_MIN_SUBS,
  MONETIZE_MIN_FOLLOWERS,
  ONLYSTANS_MIN_SUBS,
  SOCIAL_APPS,
  useGameStore,
} from '../store/gameStore'
import { scaleByCountry } from '../data/countries'
import { colors } from '../theme'
import type { SocialApp } from '../types'
import { confirmAction } from './actionRunner'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

interface SocialModalProps {
  app: SocialApp
  onClose: () => void
}

/** A single social platform: post to grow followers, then cash them in. */
export function SocialModal({ app, onClose }: SocialModalProps) {
  const followers = useGameStore((s) => s.followers[app])
  const age = useGameStore((s) => s.age)
  const money = useGameStore((s) => s.money)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const socialPost = useGameStore((s) => s.socialPost)
  const monetizeSocial = useGameStore((s) => s.monetizeSocial)
  const socialEngage = useGameStore((s) => s.socialEngage)
  const socialCollab = useGameStore((s) => s.socialCollab)
  const socialBuyFollowers = useGameStore((s) => s.socialBuyFollowers)

  const meta = SOCIAL_APPS[app]
  // OnlyStans counts paying subscribers, not followers — and is 18+.
  const isSubs = app === 'onlystans'
  const audience = isSubs ? 'subscribers' : 'followers'
  const tooYoung = isSubs && age < 18
  const minAudience = isSubs ? ONLYSTANS_MIN_SUBS : MONETIZE_MIN_FOLLOWERS
  const collabMin = isSubs ? COLLAB_MIN_SUBS : COLLAB_MIN_FOLLOWERS
  const posted = usedActions.includes(`post-${app}`)
  const engaged = usedActions.includes(`engage-${app}`)
  const collabed = usedActions.includes(`collab-${app}`)
  const bought = usedActions.includes(`buy-${app}`)
  const monetized = usedActions.includes(`monetize-${app}`)
  const canMonetize = followers >= minAudience && !tooYoung
  const canCollab = followers >= collabMin && !tooYoung
  // The buy-followers pack scales with the local economy, like every price.
  const buyCost = scaleByCountry(BUY_FOLLOWERS_COST, countryCode)
  const canAffordBuy = money >= buyCost && !tooYoung
  useCloseOnAction(onClose)
  const act = confirmAction(onClose)

  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{meta.emoji}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{meta.name}</Text>
              <Text style={styles.meta}>
                {followers.toLocaleString()} {audience}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.actions} contentContainerStyle={styles.actionsContent}>
            <Text style={styles.groupLabel}>GROW YOUR {audience.toUpperCase()}</Text>
            <Row
              emoji="✏️"
              title={`Post ${meta.kind}`}
              subtitle={
                tooYoung
                  ? 'You must be 18 to post here'
                  : posted
                    ? 'Already posted this year'
                    : isSubs
                      ? 'Grow your subscriber base — looks are everything'
                      : 'Grow your following — you might go viral'
              }
              onPress={act(() => socialPost(app), null)}
              disabled={posted || tooYoung}
              chevron
            />
            <Row
              emoji="💬"
              title="Engage with fans"
              subtitle={
                tooYoung
                  ? 'You must be 18'
                  : engaged
                    ? 'Already engaged this year'
                    : 'Reply to comments and DMs — slow but steady, and a mood boost'
              }
              onPress={act(() => socialEngage(app), null)}
              disabled={engaged || tooYoung}
              chevron
            />
            <Row
              emoji="🤝"
              title="Collab with a creator"
              subtitle={
                collabed
                  ? 'Already collabed this year'
                  : canCollab
                    ? 'Swap shout-outs for a big boost — small risk of drama'
                    : tooYoung
                      ? 'You must be 18'
                      : `Needs ${collabMin.toLocaleString()}+ ${audience}`
              }
              onPress={act(() => socialCollab(app), null)}
              disabled={collabed || !canCollab}
              chevron
            />
            <Row
              emoji="🤖"
              title="Buy a follower pack"
              subtitle={
                bought
                  ? 'Already bought this year'
                  : tooYoung
                    ? 'You must be 18'
                    : canAffordBuy
                      ? `Instant reach for $${buyCost.toLocaleString()} — risky if you're caught`
                      : `Costs $${buyCost.toLocaleString()} — you can't afford it`
              }
              onPress={act(() => socialBuyFollowers(app), null)}
              disabled={bought || !canAffordBuy}
              chevron
            />

            <Text style={styles.groupLabel}>CASH IN</Text>
            <Row
              emoji="💰"
              title={isSubs ? 'Cash out subscriptions' : 'Monetize your following'}
              subtitle={
                monetized
                  ? 'Already cashed in this year'
                  : canMonetize
                    ? isSubs
                      ? 'Collect what your subscribers pay'
                      : 'Land some brand deals'
                    : tooYoung
                      ? 'You must be 18'
                      : `Needs ${minAudience.toLocaleString()}+ ${audience}`
              }
              onPress={act(() => monetizeSocial(app), null)}
              disabled={monetized || !canMonetize}
              chevron
            />
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.slate100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: { fontSize: 27 },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: colors.slate800 },
  meta: { fontSize: 13, color: colors.slate500, marginTop: 1 },
  actions: { marginTop: 14 },
  actionsContent: { gap: 8, paddingBottom: 4 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate400,
    marginTop: 4,
    marginBottom: 2,
  },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
