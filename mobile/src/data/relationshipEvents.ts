import type { EventChoice, GameEvent, Person, PersonRole } from '../types'

/**
 * Random events that involve a specific person in your life. The engine
 * picks an eligible living relation and builds a GameEvent from a matching
 * template, filling in their name. Choices affect your stats/money and,
 * via `bond`, that person's relationship with you.
 */

interface RelChoice {
  label: string
  outcome: (name: string) => string
  effects: EventChoice['effects']
  bond?: number
  action?: EventChoice['action']
  sfx?: EventChoice['sfx']
}

interface RelTemplate {
  id: string
  roles: PersonRole[]
  emoji: string
  /** Bounds on YOUR age. */
  minAge?: number
  maxAge?: number
  /** Bounds on the other PERSON's age (e.g. kids stop asking for allowance at 18). */
  personMinAge?: number
  personMaxAge?: number
  title: (name: string) => string
  description: (name: string) => string
  choices: RelChoice[]
}

const TEMPLATES: RelTemplate[] = [
  // ---------------- Parents ----------------
  {
    id: 'parent-advice',
    roles: ['mother', 'father'],
    emoji: '🦉',
    title: (n) => `${n}'s Wisdom`,
    description: (n) => `${n} sits you down to share some hard-earned life advice.`,
    choices: [
      { label: 'Listen closely', outcome: (n) => `You took ${n}'s advice to heart.`, effects: { smarts: 3, happiness: 2 }, bond: 6 },
      { label: 'Nod and ignore it', outcome: () => `You tuned it out. In one ear, out the other.`, effects: { happiness: 1 }, bond: -4 },
    ],
  },
  {
    id: 'parent-gift',
    roles: ['mother', 'father'],
    emoji: '🎁',
    title: (n) => `A Surprise From ${n}`,
    description: (n) => `${n} surprises you with a gift for no particular reason.`,
    choices: [
      { label: 'Hug them', outcome: (n) => `You thanked ${n} with a big hug. They teared up a little.`, effects: { happiness: 6, money: 100 }, bond: 8 },
      { label: 'Barely react', outcome: (n) => `You mumbled thanks. ${n} looked a bit hurt.`, effects: { money: 100 }, bond: -3 },
    ],
  },
  {
    id: 'parent-chores',
    roles: ['mother', 'father'],
    emoji: '🧹',
    maxAge: 25,
    title: (n) => `${n} Needs a Hand`,
    description: (n) => `${n} asks you to help with the chores around the house this weekend.`,
    choices: [
      { label: 'Happily help out', outcome: (n) => `You spent the day helping ${n}. They appreciated it.`, effects: { happiness: -1 }, bond: 7 },
      { label: 'Make an excuse', outcome: () => `You wriggled out of it and hid in your room.`, effects: { happiness: 2 }, bond: -6 },
    ],
  },
  {
    id: 'parent-nag',
    roles: ['mother', 'father'],
    emoji: '😤',
    minAge: 14,
    maxAge: 40,
    title: (n) => `${n} Is Nagging`,
    description: (n) => `${n} won't stop pestering you about sorting out your future.`,
    choices: [
      { label: 'Promise to try harder', outcome: () => `You promised to get it together. It bought you some peace.`, effects: { smarts: 2 }, bond: 3 },
      { label: 'Snap back', outcome: (n) => `You snapped at ${n}. The house was tense for weeks.`, effects: { happiness: -4 }, bond: -8 },
    ],
  },

  // ---------------- Siblings ----------------
  {
    id: 'sib-borrow',
    roles: ['sibling'],
    emoji: '💸',
    minAge: 10,
    title: (n) => `${n} Needs a Loan`,
    description: (n) => `Your sibling ${n} asks to borrow some money and swears they'll pay it back.`,
    choices: [
      { label: 'Lend it ($200)', outcome: (n) => `You lent ${n} $200. Whether you see it again is another story.`, effects: { money: -200 }, bond: 7 },
      { label: "Say you're broke", outcome: (n) => `You told ${n} you were broke. They didn't buy it.`, effects: {}, bond: -5 },
    ],
  },
  {
    id: 'sib-blame',
    roles: ['sibling'],
    emoji: '🏺',
    minAge: 6,
    maxAge: 20,
    title: (n) => `${n} Broke It`,
    description: (n) => `${n} smashed something and is begging you to take the blame with your parents.`,
    choices: [
      { label: 'Cover for them', outcome: (n) => `You took the fall for ${n}. You owe each other now.`, effects: { happiness: -3 }, bond: 10 },
      { label: 'Tell your parents', outcome: (n) => `You told on ${n}. They're furious with you.`, effects: {}, bond: -9 },
    ],
  },
  {
    id: 'sib-goodnews',
    roles: ['sibling'],
    emoji: '🎉',
    minAge: 16,
    title: (n) => `${n}'s Big News`,
    description: (n) => `${n} calls, buzzing with some exciting personal news.`,
    choices: [
      { label: 'Celebrate with them', outcome: (n) => `You were genuinely thrilled for ${n}.`, effects: { happiness: 5 }, bond: 8 },
      { label: 'Feel a little jealous', outcome: (n) => `You forced a smile, quietly envious of ${n}.`, effects: { happiness: -2 }, bond: -2 },
    ],
  },

  // ---------------- Friends ----------------
  {
    id: 'friend-party',
    roles: ['friend'],
    emoji: '🎊',
    minAge: 14,
    title: (n) => `${n}'s Party`,
    description: (n) => `${n} invites you to a party this weekend. It's going to be a big one.`,
    choices: [
      { label: 'Go and have fun', outcome: (n) => `You partied with ${n} till late. Worth it.`, effects: { happiness: 7, health: -2 }, bond: 7 },
      { label: 'Stay home', outcome: (n) => `You bailed on ${n}. They noticed you weren't there.`, effects: { happiness: -1 }, bond: -5 },
    ],
  },
  {
    id: 'friend-homework',
    roles: ['friend', 'classmate'],
    emoji: '📝',
    minAge: 7,
    maxAge: 18,
    title: (n) => `${n} Wants Your Homework`,
    description: (n) => `${n} forgot to do the assignment and asks to copy yours.`,
    choices: [
      { label: 'Let them copy', outcome: (n) => `You let ${n} copy. Risky, but they owe you.`, effects: {}, bond: 6 },
      { label: 'Refuse', outcome: (n) => `You said no. ${n} had to face the music alone.`, effects: { smarts: 1 }, bond: -4 },
    ],
  },
  {
    id: 'friend-cry',
    roles: ['friend'],
    emoji: '😢',
    title: (n) => `${n} Is Struggling`,
    description: (n) => `${n} calls you late at night, going through a really hard time.`,
    choices: [
      { label: 'Be there for them', outcome: (n) => `You stayed on the phone with ${n} for hours. True friendship.`, effects: { happiness: -2 }, bond: 12 },
      { label: "Say you're busy", outcome: (n) => `You told ${n} you couldn't talk. They stopped calling.`, effects: {}, bond: -10 },
    ],
  },
  {
    id: 'friend-invest',
    roles: ['friend'],
    emoji: '📈',
    minAge: 20,
    title: (n) => `${n}'s Big Idea`,
    description: (n) => `${n} is starting a business and wants you to invest $1,000.`,
    choices: [
      { label: 'Invest in them', outcome: (n) => `You backed ${n}'s dream. Fingers crossed.`, effects: { money: -1000 }, bond: 8 },
      { label: 'Politely decline', outcome: (n) => `You passed on ${n}'s pitch. They understood — mostly.`, effects: {}, bond: -3 },
    ],
  },

  // ---------------- Classmates ----------------
  {
    id: 'class-rumor',
    roles: ['classmate'],
    emoji: '🗣️',
    minAge: 8,
    maxAge: 18,
    title: (n) => `${n} Started a Rumor`,
    description: (n) => `Word gets back to you that ${n} has been spreading a rumor about you.`,
    choices: [
      { label: 'Confront them', outcome: (n) => `You confronted ${n} in the hallway. It got heated.`, effects: { happiness: 1 }, bond: -6 },
      { label: 'Rise above it', outcome: () => `You ignored the whispers and kept your head high.`, effects: { happiness: -3, smarts: 1 }, bond: -2 },
      { label: 'Make an enemy of them', outcome: (n) => `You declared war on ${n}. They're your rival now.`, effects: { happiness: 2 }, bond: -20, action: 'makeEnemy', sfx: 'punch' },
    ],
  },
  {
    id: 'class-dance',
    roles: ['classmate'],
    emoji: '💃',
    minAge: 13,
    maxAge: 18,
    title: (n) => `${n} Asks You Out`,
    description: (n) => `${n} nervously asks if you'd go to the school dance with them.`,
    choices: [
      { label: 'Say yes', outcome: (n) => `You went to the dance with ${n}. A night to remember.`, effects: { happiness: 6 }, bond: 12 },
      { label: 'Let them down gently', outcome: (n) => `You turned ${n} down kindly. Still a bit awkward after.`, effects: {}, bond: -3 },
    ],
  },
  {
    id: 'class-fight',
    roles: ['classmate'],
    emoji: '🥊',
    minAge: 8,
    maxAge: 18,
    title: (n) => `${n} Wants a Fight`,
    description: (n) => `${n} squares up to you after class, spoiling for a fight.`,
    choices: [
      { label: 'Fight back', outcome: (n) => `You traded blows with ${n}. Now you're rivals for life.`, effects: { health: -8, happiness: 3 }, bond: -25, action: 'makeEnemy', sfx: 'punch' },
      { label: 'Walk away', outcome: (n) => `You walked away from ${n}. Smart, if a little bruising to the ego.`, effects: { happiness: -3, smarts: 1 }, bond: -4 },
    ],
  },

  // ---------------- Partner ----------------
  {
    id: 'partner-surprise',
    roles: ['partner'],
    emoji: '🌹',
    title: (n) => `${n}'s Surprise`,
    description: (n) => `${n} has planned a surprise date night, just for the two of you.`,
    choices: [
      { label: 'Love it', outcome: (n) => `You had a wonderful evening with ${n}.`, effects: { happiness: 8 }, bond: 10 },
      { label: "You're too tired", outcome: (n) => `You cancelled on ${n}. They were disappointed.`, effects: { happiness: -2 }, bond: -8 },
    ],
  },
  {
    id: 'partner-argument',
    roles: ['partner'],
    emoji: '💢',
    title: (n) => `A Fight With ${n}`,
    description: (n) => `You and ${n} get into a heated argument over something small.`,
    choices: [
      { label: 'Apologize first', outcome: (n) => `You made the first move to patch things up with ${n}.`, effects: { happiness: 2 }, bond: 6 },
      { label: 'Give them the silent treatment', outcome: (n) => `You froze ${n} out for days. It festered.`, effects: { happiness: -4 }, bond: -10 },
    ],
  },

  // ---------------- Children ----------------
  {
    id: 'child-report',
    roles: ['child'],
    emoji: '🎒',
    personMaxAge: 17,
    title: (n) => `${n}'s Report Card`,
    description: (n) => `${n} comes home with a report card — and it's not great.`,
    choices: [
      { label: 'Encourage them', outcome: (n) => `You gently encouraged ${n} to keep trying.`, effects: { happiness: 1 }, bond: 8 },
      { label: 'Ground them', outcome: (n) => `You grounded ${n}. They slammed their door.`, effects: {}, bond: -6 },
    ],
  },
  {
    id: 'child-allowance',
    roles: ['child'],
    emoji: '🪙',
    personMaxAge: 17,
    title: (n) => `${n} Wants a Raise`,
    description: (n) => `${n} argues, quite persuasively, that they deserve a bigger allowance.`,
    choices: [
      { label: 'Give a little more ($50/yr)', outcome: (n) => `You bumped ${n}'s allowance. They beamed.`, effects: { money: -50 }, bond: 7 },
      { label: 'Denied', outcome: (n) => `You said money doesn't grow on trees. ${n} sulked.`, effects: {}, bond: -4 },
    ],
  },
  {
    id: 'child-award',
    roles: ['child'],
    emoji: '🏅',
    personMaxAge: 17,
    title: (n) => `${n} Wins an Award`,
    description: (n) => `${n} won an award at school and can't wait to show you.`,
    choices: [
      { label: 'Celebrate them', outcome: (n) => `You made a huge deal of ${n}'s award. They glowed.`, effects: { happiness: 6 }, bond: 10 },
      { label: '"Thats nice"', outcome: (n) => `You barely looked up. ${n}'s smile faded.`, effects: {}, bond: -6 },
    ],
  },

  // ---------------- Enemies ----------------
  {
    id: 'enemy-rumor',
    roles: ['enemy'],
    emoji: '😠',
    title: (n) => `${n} Strikes Again`,
    description: (n) => `Your rival ${n} is badmouthing you to anyone who'll listen.`,
    choices: [
      { label: 'Clap back', outcome: (n) => `You gave ${n} a taste of their own medicine.`, effects: { happiness: 2 }, bond: -6, sfx: 'punch' },
      { label: 'Ignore them', outcome: (n) => `You refused to sink to ${n}'s level.`, effects: { happiness: -2, smarts: 1 } },
      { label: 'Try to make peace', outcome: (n) => `You offered ${n} an olive branch.`, effects: { happiness: 1 }, bond: 25, action: 'reconcile', sfx: 'success' },
    ],
  },
  {
    id: 'enemy-prank',
    roles: ['enemy'],
    emoji: '🥴',
    title: (n) => `${n}'s Prank`,
    description: (n) => `${n} pulls a nasty prank on you and posts it online.`,
    choices: [
      { label: 'Plot revenge', outcome: (n) => `You started planning your revenge on ${n}.`, effects: { happiness: 1 }, bond: -8, sfx: 'crime' },
      { label: 'Laugh it off', outcome: () => `You laughed it off. The internet moved on by lunch.`, effects: { happiness: -2 } },
    ],
  },
  {
    id: 'enemy-olive',
    roles: ['enemy'],
    emoji: '🕊️',
    title: (n) => `${n} Reaches Out`,
    description: (n) => `Surprisingly, ${n} reaches out and says they're tired of the feud.`,
    choices: [
      { label: 'Bury the hatchet', outcome: (n) => `You and ${n} made peace. Maybe even friends now.`, effects: { happiness: 5 }, bond: 30, action: 'reconcile', sfx: 'success' },
      { label: 'Reject the offer', outcome: (n) => `You told ${n} where to shove their olive branch.`, effects: { happiness: 1 }, bond: -5 },
    ],
  },
]

/** Build a relationship event for a specific person, or null if none fits. */
export function buildRelationshipEvent(
  person: Person,
  age: number,
  usedIds: string[] = [],
): GameEvent | null {
  const eligible = TEMPLATES.filter(
    (t) =>
      t.roles.includes(person.role) &&
      (t.minAge === undefined || age >= t.minAge) &&
      (t.maxAge === undefined || age <= t.maxAge) &&
      (t.personMinAge === undefined || person.age >= t.personMinAge) &&
      (t.personMaxAge === undefined || person.age <= t.personMaxAge) &&
      // Never the same scenario twice with the same person in one life.
      !usedIds.includes(`rel-${t.id}-${person.id}`),
  )
  if (eligible.length === 0) return null
  const t = eligible[Math.floor(Math.random() * eligible.length)]
  return {
    id: `rel-${t.id}-${person.id}`,
    emoji: t.emoji,
    title: t.title(person.name),
    description: t.description(person.name),
    minAge: 0,
    maxAge: 120,
    personId: person.id,
    choices: t.choices.map((c) => ({
      label: c.label,
      outcome: c.outcome(person.name),
      effects: c.effects,
      ...(c.bond !== undefined ? { bond: c.bond } : {}),
      ...(c.action ? { action: c.action } : {}),
      ...(c.sfx ? { sfx: c.sfx } : {}),
    })),
  }
}

/** Roles that can trigger a relationship event. */
export const REL_EVENT_ROLES: PersonRole[] = [
  'mother',
  'father',
  'sibling',
  'partner',
  'child',
  'friend',
  'classmate',
  'enemy',
]
