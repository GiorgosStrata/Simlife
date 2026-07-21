import { JOBS } from './jobs'

/**
 * Achievements are account-wide badges that, once earned, stay unlocked
 * across every life you play. Some fire on a one-off milestone ("your first
 * child"), others need something done within a single life ("5 languages in
 * one run"). The store owns the unlock logic; this file is just the catalogue
 * and its display grouping.
 */

export type AchievementCategory =
  | 'career'
  | 'life'
  | 'family'
  | 'love'
  | 'crime'
  | 'wealth'
  | 'property'
  | 'fame'
  | 'health'
  | 'growth'

export interface Achievement {
  id: string
  emoji: string
  title: string
  description: string
  category: AchievementCategory
}

/** One "retire as a …" achievement for every degree-gated career. */
const careerAchievements: Achievement[] = JOBS.filter(
  (j) => j.requiresDegree || j.requiredMajor,
).map((j) => ({
  id: `career-${j.id}`,
  emoji: j.emoji,
  title: j.title,
  description: `Retire from your career as a ${j.title}.`,
  category: 'career',
}))

const otherAchievements: Achievement[] = [
  // Life
  { id: 'live-90', emoji: '🎂', title: 'Nonagenarian', description: 'Live to the age of 90.', category: 'life' },
  { id: 'live-100', emoji: '🎉', title: 'Centenarian', description: 'Live to the age of 100.', category: 'life' },
  { id: 'live-110', emoji: '🕰️', title: 'Supercentenarian', description: 'Live to the age of 110.', category: 'life' },

  // Family
  { id: 'first-child', emoji: '👶', title: 'First Child', description: 'Have your first child.', category: 'family' },
  { id: 'children-3', emoji: '👨‍👩‍👧‍👦', title: 'Full House', description: 'Have 3 children in a single life.', category: 'family' },
  { id: 'children-10', emoji: '🍼', title: 'Big Family', description: 'Have 10 children in a single life.', category: 'family' },
  { id: 'children-50', emoji: '👑', title: 'Dynasty', description: 'Have 50 children in a single life.', category: 'family' },

  // Love
  { id: 'married', emoji: '💍', title: 'I Do', description: 'Get married.', category: 'love' },
  { id: 'divorce', emoji: '💔', title: 'Splitsville', description: 'Get a divorce.', category: 'love' },
  { id: 'cheat', emoji: '😈', title: 'Unfaithful', description: 'Cheat on your partner.', category: 'love' },
  { id: 'swipe-right', emoji: '🔥', title: 'Swipe Right', description: 'Swipe right on a dating app for the first time.', category: 'love' },

  // Crime
  { id: 'kill-1', emoji: '🔪', title: 'Blood on Your Hands', description: 'Kill someone.', category: 'crime' },
  { id: 'kill-5', emoji: '☠️', title: 'Serial Killer', description: 'Kill 5 people in a single life.', category: 'crime' },
  { id: 'jail', emoji: '⛓️', title: 'Behind Bars', description: 'Get sent to prison.', category: 'crime' },
  { id: 'bribe', emoji: '🤫', title: 'Greased Palms', description: 'Bribe your way out of trouble.', category: 'crime' },
  { id: 'try-drugs', emoji: '💊', title: 'Experimental Phase', description: 'Try drugs for the first time.', category: 'crime' },

  // Wealth
  { id: 'money-100k', emoji: '💵', title: 'Six Figures', description: 'Have $100,000 to your name.', category: 'wealth' },
  { id: 'money-1m', emoji: '💰', title: 'Millionaire', description: 'Have $1,000,000 to your name.', category: 'wealth' },
  { id: 'money-10m', emoji: '🤑', title: 'Multi-Millionaire', description: 'Have $10,000,000 to your name.', category: 'wealth' },
  { id: 'money-100m', emoji: '🏦', title: 'Mega Rich', description: 'Have $100,000,000 to your name.', category: 'wealth' },
  { id: 'money-1b', emoji: '💎', title: 'Billionaire', description: 'Have $1,000,000,000 to your name.', category: 'wealth' },
  { id: 'debt-first', emoji: '📉', title: 'In the Red', description: 'Go into debt for the first time.', category: 'wealth' },
  { id: 'debt-100k', emoji: '🕳️', title: 'Deep in Debt', description: 'Go $100,000 into debt.', category: 'wealth' },
  { id: 'lottery-win', emoji: '🎰', title: 'Jackpot', description: 'Win money on the lottery.', category: 'wealth' },
  { id: 'invest-2x', emoji: '📈', title: 'Double Down', description: 'Double your money on a single investment.', category: 'wealth' },

  // Property
  { id: 'buy-phone', emoji: '📱', title: 'Connected', description: 'Buy your first phone.', category: 'property' },
  { id: 'buy-car', emoji: '🚗', title: 'New Wheels', description: 'Buy your first car.', category: 'property' },
  { id: 'buy-apartment', emoji: '🏠', title: 'Homeowner', description: 'Buy your first home.', category: 'property' },
  { id: 'buy-luxury', emoji: '💎', title: 'Finer Things', description: 'Buy your first luxury item.', category: 'property' },
  { id: 'realestate-1m', emoji: '🏘️', title: 'Property Ladder', description: 'Own $1,000,000 in real estate.', category: 'property' },
  { id: 'realestate-10m', emoji: '🏙️', title: 'Real Estate Mogul', description: 'Own $10,000,000 in real estate.', category: 'property' },
  { id: 'realestate-100m', emoji: '🌆', title: 'Property Tycoon', description: 'Own $100,000,000 in real estate.', category: 'property' },

  // Fame
  { id: 'followers-rizzgram', emoji: '📸', title: 'Rizzgram Famous', description: 'Reach 100,000 followers on Rizzgram.', category: 'fame' },
  { id: 'followers-flicktok', emoji: '🎵', title: 'FlickTok Star', description: 'Reach 100,000 followers on FlickTok.', category: 'fame' },
  { id: 'followers-youtube', emoji: '▶️', title: 'Streamly Sensation', description: 'Reach 100,000 subscribers on Streamly.', category: 'fame' },
  { id: 'followers-onlystans', emoji: '💎', title: 'Top Creator', description: 'Reach 100,000 subscribers on OnlyStans.', category: 'fame' },

  // Health
  { id: 'survive-cancer', emoji: '🎗️', title: 'Survivor', description: 'Beat cancer.', category: 'health' },
  { id: 'std', emoji: '🦠', title: 'Unlucky in Love', description: 'Catch an STD.', category: 'health' },

  // Growth
  { id: 'max-smarts', emoji: '🧠', title: 'Big Brain', description: 'Max out your Smarts.', category: 'growth' },
  { id: 'max-happiness', emoji: '😄', title: 'Blissful', description: 'Max out your Mood.', category: 'growth' },
  { id: 'max-looks', emoji: '✨', title: 'Stunning', description: 'Max out your Looks.', category: 'growth' },
  { id: 'max-health', emoji: '❤️', title: 'Peak Condition', description: 'Max out your Health.', category: 'growth' },
  { id: 'max-all', emoji: '🌟', title: 'Perfect Specimen', description: 'Max out all four core stats at once.', category: 'growth' },
  { id: 'language-1', emoji: '🗣️', title: 'Bilingual', description: 'Learn a new language.', category: 'growth' },
  { id: 'language-5', emoji: '🌍', title: 'Polyglot', description: 'Learn 5 languages in a single life.', category: 'growth' },
]

export const ACHIEVEMENTS: Achievement[] = [...otherAchievements, ...careerAchievements]

export const ACHIEVEMENTS_BY_ID: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)

/** Ordered category groups for the achievements screen. */
export const ACHIEVEMENT_GROUPS: { key: AchievementCategory; label: string }[] = [
  { key: 'life', label: 'Life' },
  { key: 'family', label: 'Family' },
  { key: 'love', label: 'Love' },
  { key: 'career', label: 'Careers' },
  { key: 'wealth', label: 'Wealth' },
  { key: 'property', label: 'Property' },
  { key: 'fame', label: 'Fame' },
  { key: 'crime', label: 'Crime' },
  { key: 'health', label: 'Health' },
  { key: 'growth', label: 'Growth' },
]
