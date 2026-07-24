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
  | 'pets'
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
  { id: 'language-10', emoji: '🗺️', title: 'Renaissance Soul', description: 'Learn 10 languages in a single life.', category: 'growth' },

  // Collectors — cars, homes, luxury
  { id: 'cars-5', emoji: '🚗', title: 'Small Garage', description: 'Own 5 or more cars at once.', category: 'property' },
  { id: 'cars-10', emoji: '🏎️', title: 'Car Collector', description: 'Own 10 or more cars at once.', category: 'property' },
  { id: 'cars-50', emoji: '🏁', title: 'Auto Baron', description: 'Own 50 or more cars at once.', category: 'property' },
  { id: 'homes-5', emoji: '🏘️', title: 'Landlord', description: 'Own 5 or more homes at once.', category: 'property' },
  { id: 'homes-10', emoji: '🌆', title: 'Real Estate Empire', description: 'Own 10 or more homes at once.', category: 'property' },
  { id: 'luxury-5', emoji: '💍', title: 'Jewelry Box', description: 'Own 5 or more luxury items at once.', category: 'property' },
  { id: 'luxury-15', emoji: '👑', title: 'Treasure Hoard', description: 'Own 15 or more luxury items at once.', category: 'property' },
  { id: 'own-yacht', emoji: '🛥️', title: 'Set Sail', description: 'Own a luxury yacht.', category: 'property' },
  { id: 'own-jet', emoji: '✈️', title: 'Jet Setter', description: 'Own a private jet.', category: 'property' },

  // Pets
  { id: 'pets-5', emoji: '🐾', title: 'Animal Lover', description: 'Own 5 or more pets at once.', category: 'pets' },
  { id: 'pets-10', emoji: '🐕', title: 'Full Menagerie', description: 'Own 10 or more pets at once.', category: 'pets' },
  { id: 'pets-30', emoji: '🦁', title: 'Zoo Keeper', description: 'Own 30 or more pets at once.', category: 'pets' },
  { id: 'pet-oldage', emoji: '❤️', title: 'Best Friend', description: 'Keep a pet until it passes of old age.', category: 'pets' },

  // Rise from poverty (rich from a low-income country)
  { id: 'poor-100k', emoji: '🌅', title: 'Rags to Riches', description: 'Reach $100,000 while living in a low-income country.', category: 'wealth' },
  { id: 'poor-1m', emoji: '🌄', title: 'Local Legend', description: 'Become a millionaire from a low-income country.', category: 'wealth' },
  { id: 'poor-10m', emoji: '🏆', title: 'Against All Odds', description: 'Reach $10,000,000 from a low-income country.', category: 'wealth' },
  { id: 'poor-100m', emoji: '💎', title: 'Homegrown Tycoon', description: 'Reach $100,000,000 from a low-income country.', category: 'wealth' },
  { id: 'comeback', emoji: '📈', title: 'Comeback', description: 'Climb from $100,000 in debt to millionaire in one life.', category: 'wealth' },
  { id: 'invest-10x', emoji: '💠', title: 'Diamond Hands', description: 'Make 10× on a single investment.', category: 'wealth' },
  { id: 'lottery-jackpot', emoji: '🎲', title: 'High Roller', description: 'Win the lottery jackpot.', category: 'wealth' },

  // More career
  { id: 'top-tier', emoji: '🪜', title: 'Top of the Ladder', description: 'Reach the highest rank at any job.', category: 'career' },
  { id: 'work-50yr', emoji: '⏳', title: 'Lifer', description: 'Work 50 years across your life.', category: 'career' },
  { id: 'fame-career', emoji: '🌟', title: 'Made It', description: 'Land a fame career — athlete, singer or actor.', category: 'career' },
  { id: 'fired', emoji: '📄', title: 'Pink Slip', description: 'Get fired from a job.', category: 'career' },
  { id: 'retired', emoji: '🌴', title: 'Golden Years', description: 'Retire with a pension.', category: 'career' },
  { id: 'degree', emoji: '🎓', title: 'Overachiever', description: 'Earn a university degree.', category: 'career' },

  // More family & love
  { id: 'twins', emoji: '👯', title: 'Twins!', description: 'Have twins (or triplets).', category: 'family' },
  { id: 'late-baby', emoji: '🍼', title: 'Late Bloomer', description: 'Have a child after the age of 50.', category: 'family' },
  { id: 'generation-5', emoji: '🩸', title: 'Bloodline', description: 'Reach the 5th generation of a dynasty.', category: 'family' },
  { id: 'married-50yr', emoji: '💛', title: 'Golden Anniversary', description: 'Stay married for 50 years.', category: 'love' },
  { id: 'married-3', emoji: '💒', title: 'Serial Monogamist', description: 'Get married 3 times in one life.', category: 'love' },
  { id: 'ex-and-partner', emoji: '🎭', title: 'It’s Complicated', description: 'Have an ex and a current partner at the same time.', category: 'love' },

  // More crime
  { id: 'bank-heist', emoji: '🏦', title: 'Big Score', description: 'Successfully rob a bank.', category: 'crime' },
  { id: 'prison-escape', emoji: '🏃', title: 'Prison Break', description: 'Escape from prison.', category: 'crime' },
  { id: 'jailed-3', emoji: '🚔', title: 'Repeat Offender', description: 'Go to prison 3 times.', category: 'crime' },
  { id: 'kingpin', emoji: '😈', title: 'Kingpin', description: 'Commit every type of crime.', category: 'crime' },
  { id: 'steal-car', emoji: '🚙', title: 'Grand Theft Auto', description: 'Steal a car and get away with it.', category: 'crime' },

  // More health
  { id: 'doctor-10', emoji: '🩺', title: 'Picture of Health', description: 'See the doctor 10 times in one life.', category: 'health' },
  { id: 'survive-heart-attack', emoji: '🎗️', title: 'Nine Lives', description: 'Survive a heart attack or stroke.', category: 'health' },
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
  { key: 'pets', label: 'Pets' },
  { key: 'fame', label: 'Fame' },
  { key: 'crime', label: 'Crime' },
  { key: 'health', label: 'Health' },
  { key: 'growth', label: 'Growth' },
]
