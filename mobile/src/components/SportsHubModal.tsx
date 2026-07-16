import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { getTeam } from '../data/leagues'
import {
  MAX_RAISE_PERCENT,
  annualSalary,
  getJob,
  jobTitle,
  useGameStore,
} from '../store/gameStore'
import { colors } from '../theme'
import { PersonAvatar } from './Avatar'
import { PersonModal } from './PersonModal'
import { Row } from './Row'

interface SportsHubModalProps {
  onClose: () => void
}

/** BitLife-style team hub for pro athletes: your team, season, and moves. */
export function SportsHubModal({ onClose }: SportsHubModalProps) {
  const jobId = useGameStore((s) => s.jobId)
  const jobTier = useGameStore((s) => s.jobTier)
  const raisePercent = useGameStore((s) => s.raisePercent)
  const countryCode = useGameStore((s) => s.countryCode)
  const usedActions = useGameStore((s) => s.usedActions)
  const relationships = useGameStore((s) => s.relationships)
  const sport = useGameStore((s) => s.sport)
  const trainAthlete = useGameStore((s) => s.trainAthlete)
  const askPlayingTime = useGameStore((s) => s.askPlayingTime)
  const requestTrade = useGameStore((s) => s.requestTrade)
  const askForRaise = useGameStore((s) => s.askForRaise)
  const quitJob = useGameStore((s) => s.quitJob)

  const [personId, setPersonId] = useState<string | null>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])

  const job = getJob(jobId)
  if (!job || !sport) return null

  const info = getTeam(sport.teamId)
  const teammates = relationships.filter((p) => p.role === 'coworker' && p.alive)
  const coach = relationships.find((p) => p.role === 'boss' && p.alive)
  const salary = annualSalary(job, jobTier, raisePercent, countryCode)
  const used = (k: string) => usedActions.includes(k)
  const playedSeason = sport.wins + sport.losses > 0

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {job.emoji} {info?.team.name ?? 'Free Agent'}
          </Text>
          <Text style={styles.subtitle}>
            {jobTitle(job, jobTier)} · {info?.league.name ?? ''} · $
            {salary.toLocaleString()}/yr
          </Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Skill</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${sport.skill}%` }]} />
            </View>
            <Text style={styles.statValue}>{sport.skill}</Text>
          </View>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>🏆 {sport.titles}</Text>
              <Text style={styles.badgeCap}>Titles</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>🌟 {sport.mvps}</Text>
              <Text style={styles.badgeCap}>MVPs</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeNum}>
                {playedSeason ? `${sport.wins}–${sport.losses}` : '—'}
              </Text>
              <Text style={styles.badgeCap}>Last season</Text>
            </View>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Row
              emoji="🏋️"
              title="Train hard"
              subtitle={used('train-athlete') ? 'Done this year' : '+ skill, + health'}
              onPress={() => trainAthlete()}
              disabled={used('train-athlete')}
              chevron
            />
            <Row
              emoji="🗣️"
              title="Ask coach for more playing time"
              subtitle={used('playing-time') ? 'Done this year' : 'Chance to sharpen your game'}
              onPress={() => askPlayingTime()}
              disabled={used('playing-time')}
              chevron
            />
            <Row
              emoji="🔁"
              title="Request a trade"
              subtitle={used('request-trade') ? 'Done this year' : 'Ask to join another team'}
              onPress={() => {
                requestTrade()
                onClose()
              }}
              disabled={used('request-trade')}
              chevron
            />
            <Row
              emoji="💰"
              title="Ask for a raise"
              subtitle={
                used('raise')
                  ? 'Done this year'
                  : raisePercent >= MAX_RAISE_PERCENT
                    ? 'Already maxed out'
                    : 'Negotiate a bigger contract'
              }
              onPress={() => askForRaise()}
              disabled={used('raise') || raisePercent >= MAX_RAISE_PERCENT}
              chevron
            />

            {coach && (
              <>
                <Text style={styles.sectionHeading}>🧑‍🏫 COACH</Text>
                <Row
                  emoji="🙂"
                  avatar={<PersonAvatar person={coach} />}
                  title={coach.name}
                  subtitle={`Bond ${coach.relationship}`}
                  onPress={() => {
                    playSfx('click')
                    setPersonId(coach.id)
                  }}
                  chevron
                />
              </>
            )}

            <Text style={styles.sectionHeading}>🤝 TEAMMATES</Text>
            {teammates.length === 0 && <Text style={styles.empty}>No teammates right now.</Text>}
            {teammates.map((p) => (
              <Row
                key={p.id}
                emoji="🙂"
                avatar={<PersonAvatar person={p} />}
                title={p.name}
                subtitle={`Bond ${p.relationship}`}
                onPress={() => {
                  playSfx('click')
                  setPersonId(p.id)
                }}
                chevron
              />
            ))}

            <Row
              emoji="🚪"
              title="Retire"
              subtitle="Hang up your jersey for good"
              onPress={() => {
                quitJob()
                onClose()
              }}
              chevron
            />
          </ScrollView>

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Close</Text>
          </Pressable>
        </View>
      </View>

      {personId && <PersonModal personId={personId} onClose={() => setPersonId(null)} />}
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
    maxHeight: '88%',
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.slate500 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  statLabel: { width: 36, fontSize: 12, fontWeight: '700', color: colors.slate600 },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.slate200,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.violet500 },
  statValue: {
    width: 28,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.slate500,
    fontVariant: ['tabular-nums'],
  },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  badgeNum: { fontSize: 15, fontWeight: '800', color: colors.slate800 },
  badgeCap: { fontSize: 11, color: colors.slate500, marginTop: 1 },
  list: { marginTop: 12 },
  listContent: { gap: 8, paddingBottom: 8 },
  sectionHeading: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.slate500,
  },
  empty: { fontSize: 13, color: colors.slate400, paddingVertical: 6 },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
