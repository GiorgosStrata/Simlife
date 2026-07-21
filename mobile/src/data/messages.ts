import type { PersonRole } from '../types'

/**
 * The Messages app: pick one of three texts to send a contact, and they
 * reply based on who they are to you and how strong your bond is.
 */

export interface TextOption {
  id: string
  /** The message you send. */
  label: string
  /** How affectionate the text is — shapes the reply and the bond nudge. */
  tone: 'casual' | 'warm' | 'bold'
}

export const TEXT_OPTIONS: TextOption[] = [
  { id: 'checkin', label: 'Hey, how have you been? 😊', tone: 'casual' },
  { id: 'hangout', label: 'We should hang out soon!', tone: 'warm' },
  { id: 'love', label: 'You mean a lot to me ❤️', tone: 'bold' },
]

export interface TextReply {
  text: string
  /** Bond change applied (only the first text per person each year counts). */
  bond: number
  happiness: number
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

// [bucket][tone][tier] → a pool of replies.
const REPLIES: Record<Bucket, Record<TextOption['tone'], Record<Tier, string[]>>> = {
  family: {
    casual: {
      high: ['So good to hear from you! ❤️ All well here.', 'Aw, was just thinking about you! Doing great.'],
      mid: ['Hey! Been alright, you know how it is.', 'Oh hi! Not bad, keeping busy.'],
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
      low: ['...I know things are hard. That means something.', 'That’s unexpected. But thank you.'],
    },
  },
  romance: {
    casual: {
      high: ['Hey you 😍 was hoping you’d text.', 'Missing you already, honestly.'],
      mid: ['Hey! Nice to hear from you.', 'Oh hey, been thinking about you a little.'],
      low: ['Oh. Hi. Wasn’t expecting that.', 'Um, hey. What’s up?'],
    },
    warm: {
      high: ['Yes! Pick me up at 8? 💕', 'Absolutely, I’ll clear my whole night.'],
      mid: ['I’d like that. When were you thinking?', 'Sure, could be fun.'],
      low: ['I’m... not sure that’s a good idea.', 'Maybe. Let me think about it.'],
    },
    bold: {
      high: ['You mean everything to me too. 💖', 'Stop it, you’re perfect. I adore you.'],
      mid: ['That’s really sweet of you. 😊', 'Aw. That caught me off guard, in a good way.'],
      low: ['That’s... a lot. We’re not really there.', 'I don’t know what to say to that, honestly.'],
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
      mid: ['Haha that’s sweet man, appreciate you.', 'You good? But yeah, likewise 😄'],
      low: ['That’s... random, but okay, thanks?', 'Uh. Sure. Thanks, I guess.'],
    },
  },
  enemy: {
    casual: {
      high: ['...Truce still holding, I see. What do you want?', 'Huh. Didn’t expect civility from you.'],
      mid: ['Lose my number.', 'What could you possibly want?'],
      low: ['Bold of you to text me. Blocked.', 'Ha. No. Never.'],
    },
    warm: {
      high: ['I... suppose we could be civil. Once.', 'Fine. One coffee. Don’t make it weird.'],
      mid: ['Absolutely not.', 'Hang out? With you? That’s a hard no.'],
      low: ['Delete this chat and my number.', 'I’d rather eat glass. 🙂'],
    },
    bold: {
      high: ['Don’t push it. But... the feud’s exhausting, agreed.', 'Careful. You almost sound sincere.'],
      mid: ['This is a joke, right?', 'Nice try. I don’t buy it.'],
      low: ['Gross. Blocked and reported.', 'Is this a prank? Pathetic.'],
    },
  },
}

/** How a contact answers your text — reply line plus the bond/mood nudge. */
export function textReply(role: PersonRole, bond: number, tone: TextOption['tone']): TextReply {
  const bucket = bucketFor(role)
  const tier = tierFor(bond)
  const text = pick(REPLIES[bucket][tone][tier])

  // Warmer texts move the needle more; enemies invert; bold texts to a weak
  // bond land awkwardly.
  const toneWeight = tone === 'bold' ? 3 : tone === 'warm' ? 2 : 1
  let bondDelta: number
  if (bucket === 'enemy') {
    bondDelta = tier === 'high' ? toneWeight : -toneWeight
  } else if (tier === 'low' && tone === 'bold') {
    bondDelta = -1 // too much, too soon
  } else {
    bondDelta = toneWeight + (tier === 'high' ? 1 : tier === 'low' ? -1 : 0)
  }
  const happiness = bondDelta > 0 ? 1 : bondDelta < 0 ? -1 : 0
  return { text, bond: bondDelta, happiness }
}
