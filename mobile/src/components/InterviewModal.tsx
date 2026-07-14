import { useEffect } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playSfx } from '../audio/sfx'
import { colors } from '../theme'
import type { Job, JobQuestion } from '../types'

interface InterviewModalProps {
  job: Job
  question: JobQuestion
  onAnswer: (correct: boolean) => void
  onCancel: () => void
}

/** One quick, obvious interview question — answer right, get the job. */
export function InterviewModal({ job, question, onAnswer, onCancel }: InterviewModalProps) {
  useEffect(() => {
    playSfx('pop')
  }, [])

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>
            INTERVIEW · {job.emoji} {job.title.toUpperCase()}
          </Text>
          <Text style={styles.question}>{question.q}</Text>
          <View style={styles.choices}>
            {question.options.map((option, i) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => onAnswer(i === question.answer)}
                style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
              >
                <Text style={styles.choiceText}>{option}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Walk out of the interview</Text>
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
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.cyan600,
  },
  question: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate800,
    lineHeight: 25,
  },
  choices: {
    marginTop: 16,
    gap: 10,
  },
  choice: {
    backgroundColor: colors.cyan50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  choicePressed: {
    backgroundColor: colors.cyan100,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cyan900,
  },
  cancel: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 13,
    color: colors.slate500,
  },
})
