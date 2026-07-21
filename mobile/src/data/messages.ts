import type { PersonRole } from '../types'

/**
 * The Messages app: the three texts you can send depend on who the contact is
 * to you (and, for parents, whether you're still a kid), and their reply is
 * written for that relationship and how strong your bond is. Children can ask
 * their parents for allowance or a new phone right from here.
 */

export type TextTone =
  | 'casual'
  | 'warm'
  | 'bold'
  | 'flirt'
  | 'rude'
  | 'truce'
  | 'ask-money'
  | 'ask-phone'

export interface TextOption {
  id: string
  /** The message you send. */
  label: string
  tone: TextTone
}

/** The three texts available for a given contact. */
export function textOptionsFor(role: PersonRole, age: number): TextOption[] {
  const isParent = role === 'mother' || role === 'father'
  const romance = role === 'partner' || role === 'ex' || role === 'fling'
  if (isParent && age < 18) {
    return [
      { id: 'ask-money', label: 'Can I have some allowance? 🙏', tone: 'ask-money' },
      { id: 'ask-phone', label: 'Can I get a new phone? 📱', tone: 'ask-phone' },
      { id: 'love-parent', label: 'Love you! ❤️', tone: 'bold' },
    ]
  }
  if (role === 'enemy') {
    return [
      { id: 'insult', label: 'You’re the actual worst. 😒', tone: 'rude' },
      { id: 'threat', label: 'This isn’t over.', tone: 'rude' },
      { id: 'truce', label: 'Can we just call a truce?', tone: 'truce' },
    ]
  }
  if (romance) {
    return [
      { id: 'flirt', label: 'Thinking about you 😘', tone: 'flirt' },
      { id: 'date', label: 'Wanna go out this weekend?', tone: 'warm' },
      { id: 'love-romance', label: 'You mean everything to me ❤️', tone: 'bold' },
    ]
  }
  // Adult family & friends.
  return [
    { id: 'checkin', label: 'Hey, how have you been? 😊', tone: 'casual' },
    { id: 'hangout', label: 'We should hang out soon!', tone: 'warm' },
    { id: 'love', label: 'You mean a lot to me ❤️', tone: 'bold' },
  ]
}

export interface TextReply {
  text: string
  bond: number
  happiness: number
  /** Base dollars a parent hands over (country-scaled in the store). */
  money?: number
  /** A parent agreed to buy you a phone. */
  grantsPhone?: boolean
}

type Bucket = 'family' | 'romance' | 'friend' | 'enemy'
type Tier = 'high' | 'mid' | 'low'

function bucketFor(role: PersonRole): Bucket {
  if (role === 'mother' || role === 'father' || role === 'sibling' || role === 'child') return 'family'
  if (role === 'partner' || role === 'ex' || role === 'fling') return 'romance'
  if (role === 'enemy') return 'enemy'
  return 'friend'
}

function tierFor(bond: number): Tier {
  return bond >= 70 ? 'high' : bond >= 40 ? 'mid' : 'low'
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// General replies for the everyday tones, keyed by relationship bucket.
const REPLIES: Record<Bucket, Partial<Record<TextTone, Record<Tier, string[]>>>> = {
  family: {
    casual: {
      high: ['So good to hear from you! ❤️ All well here.', 'Aw, was just thinking about you!'],
      mid: ['Hey! Been alright, you know how it is.', 'Oh hi! Keeping busy.'],
      low: ['Oh. Hi. Been a while.', 'Everything okay? You never text.'],
    },
    warm: {
      high: ['Yes!! Come over this weekend? 🥰', 'I’d love that. Missed you.'],
      mid: ['Sure, sounds nice. Let’s find a date.', 'Yeah, we should. It’s been too long.'],
      low: ['Maybe... things have been tense lately.', 'Hm. We’ll see. No promises.'],
    },
    bold: {
      high: ['Love you too, always. 🥹', 'You’re going to make me cry. Love you.'],
      mid: ['Aw. Love you too, kiddo.', 'That’s sweet. Love you.'],
      low: ['...That means something. Thank you.', 'That’s unexpected. But thank you.'],
    },
  },
  romance: {
    flirt: {
      high: ['Come over and tell me in person 😏', 'Stop it, you’re making me blush 😘'],
      mid: ['Oh yeah? 😊 Tell me more.', 'Smooth. I’m listening.'],
      low: ['Um. That’s forward.', 'Oh. Hi. Wasn’t expecting that.'],
    },
    warm: {
      high: ['Yes! Pick me up at 8? 💕', 'Absolutely, I’ll clear my whole night.'],
      mid: ['I’d like that. When were you thinking?', 'Sure, could be fun.'],
      low: ['I’m... not sure that’s a good idea.', 'Maybe. Let me think about it.'],
    },
    bold: {
      high: ['You mean everything to me too. 💖', 'Stop it, you’re perfect. I adore you.'],
      mid: ['That’s really sweet of you. 😊', 'Aw. That caught me off guard, in a good way.'],
      low: ['That’s... a lot. We’re not really there.', 'I don’t know what to say to that.'],
    },
  },
  friend: {
    casual: {
      high: ['Yooo! Perfect timing, was gonna text you.', 'Legend! Doing great, you?'],
      mid: ['Hey! All good. What’s new?', 'Oh hey! Been a minute. Good though.'],
      low: ['Oh, hey. Long time.', 'Do I still have your number saved? Kidding. Hi.'],
    },
    warm: {
      high: ['100%! I’m free this weekend, let’s go 🎉', 'Say when — I’m in.'],
      mid: ['Yeah for sure, let’s sort something.', 'I’m down, ping me a day.'],
      low: ['Eh, kinda busy lately, but maybe.', 'We’ll see how things go.'],
    },
    bold: {
      high: ['Bro. You’re the best. Right back at you 🤝', 'Awww okay I’m not crying you are.'],
      mid: ['Haha that’s sweet, appreciate you.', 'You good? But yeah, likewise 😄'],
      low: ['That’s... random, but okay, thanks?', 'Uh. Sure. Thanks, I guess.'],
    },
  },
  enemy: {
    rude: {
      high: ['...Wow. And here I thought we’d moved on.', 'Charming as ever. Goodbye.'],
      mid: ['The feeling is entirely mutual.', 'Lose my number.'],
      low: ['Blocked. Again.', 'You’re not worth the reply. (But here it is.)'],
    },
    truce: {
      high: ['Fine. A truce. Don’t make me regret it.', 'I... suppose the feud is exhausting. Deal.'],
      mid: ['A truce? I’ll think about it.', 'Hah. We’re not there yet.'],
      low: ['Absolutely not.', 'You have got to be joking.'],
    },
  },
}

/** How a contact answers your text — reply line plus any effects. */
export function textReply(role: PersonRole, bond: number, tone: TextTone): TextReply {
  const tier = tierFor(bond)
  const yes = tier === 'high' || (tier === 'mid' && Math.random() < 0.6)

  // Children asking a parent for things.
  if (tone === 'ask-money') {
    if (yes) {
      const amount = tier === 'high' ? 120 : 60
      return { text: pick(['Of course, sending it now 💸', 'Sure, don’t spend it all at once!']), bond: 1, happiness: 2, money: amount }
    }
    return { text: pick(['Money doesn’t grow on trees. Not this week.', 'Ask me again after you tidy your room.']), bond: -1, happiness: -1 }
  }
  if (tone === 'ask-phone') {
    if (tier === 'high') {
      return { text: pick(['You’ve earned it — go pick one out 📱', 'Alright, a new phone it is. Look after it!']), bond: 1, happiness: 4, grantsPhone: true }
    }
    if (tier === 'mid' && Math.random() < 0.5) {
      return { text: 'Fine, but just a basic one, okay?', bond: 1, happiness: 3, grantsPhone: true }
    }
    return { text: pick(['Your old phone works fine.', 'Maybe for your birthday. We’ll see.']), bond: 0, happiness: -1 }
  }

  const bucket = bucketFor(role)
  const pool = REPLIES[bucket][tone] ?? REPLIES[bucket].casual ?? REPLIES.friend.casual!
  const text = pick(pool[tier])

  // Warmer texts move the needle more; enemies invert; bold-to-a-weak-bond flops.
  const toneWeight = tone === 'bold' ? 3 : tone === 'warm' || tone === 'flirt' ? 2 : 1
  let bondDelta: number
  if (bucket === 'enemy') {
    bondDelta = tone === 'truce' ? (tier === 'high' ? 4 : tier === 'mid' ? 1 : -1) : -2
  } else if (tier === 'low' && tone === 'bold') {
    bondDelta = -1
  } else {
    bondDelta = toneWeight + (tier === 'high' ? 1 : tier === 'low' ? -1 : 0)
  }
  const happiness = bondDelta > 0 ? 1 : bondDelta < 0 ? -1 : 0
  return { text, bond: bondDelta, happiness }
}
