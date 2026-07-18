import type { Major } from '../types'

/**
 * University majors. `minSmarts` is the grade bar to get admitted —
 * top programs like Medicine want top grades. Jobs can require a
 * specific major via `requiredMajor` in jobs.ts.
 */
export const MAJORS: Major[] = [
  { id: 'medicine', name: 'Medicine', emoji: '🩺', minSmarts: 85 },
  { id: 'law', name: 'Law', emoji: '⚖️', minSmarts: 80 },
  { id: 'engineering', name: 'Engineering', emoji: '🛠️', minSmarts: 75 },
  { id: 'physics', name: 'Physics', emoji: '🔭', minSmarts: 78 },
  { id: 'mathematics', name: 'Mathematics', emoji: '🔢', minSmarts: 74 },
  { id: 'architecture', name: 'Architecture', emoji: '📐', minSmarts: 72 },
  { id: 'computer-science', name: 'Computer Science', emoji: '💻', minSmarts: 70 },
  { id: 'economics', name: 'Economics', emoji: '💹', minSmarts: 70 },
  { id: 'science', name: 'Science', emoji: '🔬', minSmarts: 65 },
  { id: 'psychology', name: 'Psychology', emoji: '🧠', minSmarts: 65 },
  { id: 'political-science', name: 'Political Science', emoji: '🏛️', minSmarts: 64 },
  { id: 'business', name: 'Business', emoji: '📈', minSmarts: 60 },
  { id: 'nursing', name: 'Nursing', emoji: '💉', minSmarts: 60 },
  { id: 'education', name: 'Education', emoji: '🏫', minSmarts: 55 },
  { id: 'sports-science', name: 'Sports Science', emoji: '🏅', minSmarts: 50 },
  { id: 'communications', name: 'Communications', emoji: '📰', minSmarts: 50 },
  { id: 'arts', name: 'Arts & Media', emoji: '🎨', minSmarts: 40 },
  { id: 'music', name: 'Music', emoji: '🎼', minSmarts: 40 },
]

export function getMajor(majorId: string | null): Major | null {
  return majorId ? (MAJORS.find((m) => m.id === majorId) ?? null) : null
}
