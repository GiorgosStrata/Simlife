import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { bondWarmth, textOptionsFor, textReply, type TextReply } from '../data/messages'
import { useGameStore } from '../store/gameStore'
import { colors } from '../theme'
import type { Person, PersonRole } from '../types'
import { PersonAvatar } from './Avatar'
import { roleLabel } from './PersonModal'
import { Row } from './Row'
import { useCloseOnAction } from './useCloseOnAction'

/** Roles you can text — no coworkers/classmates/teachers cluttering it up. */
const TEXTABLE: PersonRole[] = [
  'partner', 'ex', 'fling', 'mother', 'father', 'sibling', 'child', 'friend', 'enemy',
]

/** Kids this young don't have a phone yet, so you can't text them. */
const PHONE_AGE = 12

interface Bubble {
  from: 'me' | 'them'
  text: string
}

interface MessagesModalProps {
  onClose: () => void
}

/** A texting app: pick a contact, then send one of three messages. */
export function MessagesModal({ onClose }: MessagesModalProps) {
  const relationships = useGameStore((s) => s.relationships)
  const partnerStatus = useGameStore((s) => s.partnerStatus)
  const age = useGameStore((s) => s.age)
  const year = useGameStore((s) => s.year)
  const usedTexts = useGameStore((s) => s.usedTexts)
  const usedActions = useGameStore((s) => s.usedActions)
  const sendText = useGameStore((s) => s.sendText)
  const [openId, setOpenId] = useState<string | null>(null)
  const [thread, setThread] = useState<Bubble[]>([])
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])
  useCloseOnAction(onClose)

  const contacts = relationships.filter(
    (p) => p.alive && TEXTABLE.includes(p.role) && p.age >= PHONE_AGE,
  )
  const open = openId ? relationships.find((p) => p.id === openId) : null

  const openChat = (person: Person) => {
    playSfx('click')
    setThread([])
    setOpenId(person.id)
  }

  // This year's slate is fixed once the chat opens (it doesn't reshuffle as
  // you send), then we simply drop any line you've already used this life.
  const slate = useMemo(
    () =>
      open
        ? textOptionsFor(open.role, age, open.relationship, open.id, year, usedTexts, partnerStatus)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open?.id, year, partnerStatus],
  )
  const options = open
    ? slate.filter((o) => o.consumable === false || !usedTexts.includes(`${open.id}:${o.id}`))
    : []
  // The allowance ask is capped once a year; chit-chat isn't.
  const askedThisYear = open ? usedActions.includes(`text-util-${open.id}`) : false

  const send = (opt: (typeof options)[number]) => {
    if (!open) return
    if (opt.consumable === false && askedThisYear) return
    const reply: TextReply = textReply(open.role, open.relationship, opt.tone)
    setThread((t) => [...t, { from: 'me', text: opt.label }])
    playSfx('click')
    // Apply the reply's bond/mood nudge, and spend this line for the rest of
    // the life unless it's a utility ask (allowance).
    sendText(open.id, {
      bond: reply.bond,
      happiness: reply.happiness,
      money: reply.money,
      grantsPhone: reply.grantsPhone,
      messageId: opt.id,
      consumable: opt.consumable !== false,
    })
    // Their reply lands a beat later.
    setTimeout(() => {
      setThread((t) => [...t, { from: 'them', text: reply.text }])
      playSfx('pop')
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 550)
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {!open ? (
            <>
              <Text style={styles.title}>💬 Messages</Text>
              <Text style={styles.subtitle}>Tap a contact to start texting.</Text>
              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {contacts.length === 0 && (
                  <Row emoji="📭" title="No one to text yet" subtitle="Make some connections first" />
                )}
                {contacts.map((person) => (
                  <Row
                    key={person.id}
                    avatar={<PersonAvatar person={person} />}
                    emoji="🙂"
                    title={person.name}
                    subtitle={`${roleLabel(person, partnerStatus)} · ${bondWarmth(person.role, person.relationship)} · Bond ${person.relationship}`}
                    onPress={() => openChat(person)}
                    chevron
                  />
                ))}
              </ScrollView>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelText}>Close</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.chatHeader}>
                <Pressable accessibilityRole="button" onPress={() => setOpenId(null)}>
                  <Text style={styles.back}>‹ Contacts</Text>
                </Pressable>
                <View style={styles.chatTitleWrap}>
                  <Text style={styles.chatName} numberOfLines={1}>
                    {open.name}
                  </Text>
                  <Text style={styles.chatSub} numberOfLines={1}>
                    {roleLabel(open, partnerStatus)} · {bondWarmth(open.role, open.relationship)}
                  </Text>
                </View>
                <View style={{ width: 60 }} />
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.thread}
                contentContainerStyle={styles.threadContent}
              >
                {thread.length === 0 && (
                  <Text style={styles.hint}>Say something 👇</Text>
                )}
                {thread.map((b, i) => (
                  <View
                    key={i}
                    style={[styles.bubble, b.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}
                  >
                    <Text style={b.from === 'me' ? styles.bubbleMeText : styles.bubbleThemText}>
                      {b.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.options}>
                {options.length === 0 ? (
                  <Text style={styles.sentNote}>
                    You’ve said it all to {open.name.split(' ')[0]} — check back next year.
                  </Text>
                ) : (
                  options.map((opt) => {
                    const disabled = opt.consumable === false && askedThisYear
                    return (
                      <Pressable
                        key={opt.id}
                        accessibilityRole="button"
                        disabled={disabled}
                        onPress={() => send(opt)}
                        style={({ pressed }) => [
                          styles.optBtn,
                          pressed && styles.optBtnPressed,
                          disabled && styles.optBtnDisabled,
                        ]}
                      >
                        <Text style={[styles.optText, disabled && styles.optTextDisabled]}>
                          {opt.label}
                          {disabled ? '  · asked this year' : ''}
                        </Text>
                      </Pressable>
                    )
                  })
                )}
              </View>

              <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelText}>Close</Text>
              </Pressable>
            </>
          )}
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
    height: '80%',
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.slate500 },
  list: { marginTop: 12 },
  listContent: { gap: 8, paddingBottom: 8 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  back: { fontSize: 15, fontWeight: '700', color: colors.cyan500, width: 80 },
  chatTitleWrap: { flex: 1, alignItems: 'center' },
  chatName: { textAlign: 'center', fontSize: 17, fontWeight: '800', color: colors.slate800 },
  chatSub: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.slate400, marginTop: 1 },
  thread: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 12 },
  threadContent: { gap: 8, paddingBottom: 4 },
  hint: { textAlign: 'center', color: colors.slate400, fontSize: 13, marginTop: 20 },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.cyan500, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: colors.slate200, borderBottomLeftRadius: 4 },
  bubbleMeText: { color: colors.onColor, fontSize: 14 },
  bubbleThemText: { color: colors.slate800, fontSize: 14 },
  options: { gap: 8, marginTop: 12 },
  optBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optBtnPressed: { backgroundColor: colors.cyan50 },
  optBtnDisabled: { opacity: 0.5 },
  optText: { fontSize: 14, fontWeight: '600', color: colors.slate800 },
  optTextDisabled: { color: colors.slate400 },
  sentNote: {
    fontSize: 13,
    color: colors.slate500,
    textAlign: 'center',
    paddingVertical: 14,
    fontStyle: 'italic',
  },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
