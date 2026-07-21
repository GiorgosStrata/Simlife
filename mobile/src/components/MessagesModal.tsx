import { useEffect, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { TEXT_OPTIONS, textReply, type TextReply } from '../data/messages'
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
  const sendText = useGameStore((s) => s.sendText)
  const [openId, setOpenId] = useState<string | null>(null)
  const [thread, setThread] = useState<Bubble[]>([])
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    playSfx('pop')
  }, [])
  useCloseOnAction(onClose)

  const contacts = relationships.filter((p) => p.alive && TEXTABLE.includes(p.role))
  const open = openId ? relationships.find((p) => p.id === openId) : null

  const openChat = (person: Person) => {
    playSfx('click')
    setThread([])
    setOpenId(person.id)
  }

  const send = (toneIndex: number) => {
    if (!open) return
    const opt = TEXT_OPTIONS[toneIndex]
    const reply: TextReply = textReply(open.role, open.relationship, opt.tone)
    setThread((t) => [...t, { from: 'me', text: opt.label }])
    playSfx('click')
    // Apply the bond/mood nudge (gated to once per person per year in the store).
    sendText(open.id, reply.bond, reply.happiness)
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
                    subtitle={`${roleLabel(person, partnerStatus)} · Bond ${person.relationship}`}
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
                <Text style={styles.chatName} numberOfLines={1}>
                  {open.name}
                </Text>
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
                {TEXT_OPTIONS.map((opt, i) => (
                  <Pressable
                    key={opt.id}
                    accessibilityRole="button"
                    onPress={() => send(i)}
                    style={({ pressed }) => [styles.optBtn, pressed && styles.optBtnPressed]}
                  >
                    <Text style={styles.optText}>{opt.label}</Text>
                  </Pressable>
                ))}
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
  chatName: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: colors.slate800 },
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
  optText: { fontSize: 14, fontWeight: '600', color: colors.slate800 },
  cancel: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
