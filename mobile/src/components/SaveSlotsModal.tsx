import { useEffect, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import {
  addNewLifeSlot,
  canAddSlot,
  deleteSlot,
  saveActiveSlot,
  slotLimit,
  switchToSlot,
} from '../saves'
import { usePremiumStore } from '../store/premiumStore'
import { slotMeta, useSlotsStore } from '../store/slotsStore'
import { colors } from '../theme'
import { Flag } from './Flag'

interface SaveSlotsModalProps {
  onClose: () => void
  onWantPremium: () => void
}

/** "My Lives" — the saved-game slots you can switch between (capped by tier). */
export function SaveSlotsModal({ onClose, onWantPremium }: SaveSlotsModalProps) {
  const slots = useSlotsStore((s) => s.slots)
  const snapshots = useSlotsStore((s) => s.snapshots)
  const activeId = useSlotsStore((s) => s.activeId)
  const premium = usePremiumStore((s) => s.premium)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Freshen the active slot's snapshot so its card shows the current age etc.
  useEffect(() => {
    saveActiveSlot()
    playSfx('pop')
  }, [])

  const limit = slotLimit()
  const canAdd = canAddSlot()

  const pickSlot = (id: string) => {
    if (id === activeId) {
      onClose()
      return
    }
    playSfx('click')
    switchToSlot(id)
    onClose()
  }

  const addLife = () => {
    if (!canAdd) {
      onWantPremium()
      return
    }
    playSfx('click')
    addNewLifeSlot()
    onClose()
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>💾 My Lives</Text>
              <Text style={styles.sub}>
                {slots.length} of {limit} saved{!premium ? ' · free tier' : ' · premium'}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {slots.map((id) => {
              const meta = slotMeta(snapshots[id])
              const isActive = id === activeId
              const first = meta.name.split(' ')[0]
              return (
                <View key={id} style={[styles.slot, isActive && styles.slotActive]}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => pickSlot(id)}
                    style={styles.slotMain}
                  >
                    <View style={styles.slotFlag}>
                      <Flag code={meta.countryCode} width={26} />
                    </View>
                    <View style={styles.slotText}>
                      <Text style={styles.slotName} numberOfLines={1}>
                        {meta.screen === 'creation' ? 'New life' : meta.name}
                        {!meta.alive && meta.screen !== 'creation' ? ' †' : ''}
                      </Text>
                      <Text style={styles.slotMeta}>
                        {meta.screen === 'creation'
                          ? 'Not started yet'
                          : `Age ${meta.age} · Gen ${meta.generation}${isActive ? ' · Playing' : ''}`}
                      </Text>
                    </View>
                    {isActive ? (
                      <Text style={styles.playingTag}>▶</Text>
                    ) : (
                      <Text style={styles.chev}>›</Text>
                    )}
                  </Pressable>
                  {!isActive &&
                    (confirmDelete === id ? (
                      <View style={styles.confirmRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            playSfx('click')
                            deleteSlot(id)
                            setConfirmDelete(null)
                          }}
                          style={styles.confirmDelete}
                        >
                          <Text style={styles.confirmDeleteText}>Delete</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setConfirmDelete(null)}
                          style={styles.confirmCancel}
                        >
                          <Text style={styles.confirmCancelText}>Keep</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete life"
                        onPress={() => setConfirmDelete(id)}
                        style={styles.trash}
                      >
                        <Text style={styles.trashText}>🗑️</Text>
                      </Pressable>
                    ))}
                </View>
              )
            })}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={addLife}
            style={({ pressed }) => [
              styles.addBtn,
              !canAdd && styles.addBtnLocked,
              pressed && styles.addBtnPressed,
            ]}
          >
            <Text style={styles.addText}>
              {canAdd ? '+ New life' : '🔒 Upgrade for more lives'}
            </Text>
          </Pressable>

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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '800', color: colors.slate800 },
  sub: { fontSize: 13, color: colors.slate500, marginTop: 2 },
  list: { marginTop: 14 },
  listContent: { gap: 8, paddingBottom: 4 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  slotActive: { borderColor: colors.cyan500 },
  slotMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  slotFlag: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { flex: 1 },
  slotName: { fontSize: 15, fontWeight: '800', color: colors.slate800 },
  slotMeta: { fontSize: 12, color: colors.slate500, marginTop: 1 },
  playingTag: { fontSize: 14, color: colors.cyan600, fontWeight: '900' },
  chev: { fontSize: 22, color: colors.slate400, fontWeight: '600' },
  trash: { paddingHorizontal: 14, paddingVertical: 12 },
  trashText: { fontSize: 16 },
  confirmRow: { flexDirection: 'row', gap: 6, paddingRight: 10 },
  confirmDelete: {
    backgroundColor: colors.rose700,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confirmDeleteText: { color: colors.onColor, fontSize: 12, fontWeight: '800' },
  confirmCancel: {
    backgroundColor: colors.slate200,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confirmCancelText: { color: colors.slate600, fontSize: 12, fontWeight: '800' },
  addBtn: {
    marginTop: 12,
    backgroundColor: colors.cyan500,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addBtnLocked: { backgroundColor: colors.amber400 },
  addBtnPressed: { opacity: 0.9 },
  addText: { fontSize: 15, fontWeight: '800', color: colors.onColor },
  cancel: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14, fontWeight: '700', color: colors.slate500 },
})
