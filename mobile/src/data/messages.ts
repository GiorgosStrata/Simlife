import type { PersonRole } from '../types'

/**
 * The Messages app. Every relationship has a deep catalogue of things you
 * might text (40+ lines each). Each year a fresh handful is offered, drawn
 * from the lines that suit how close you are — and once you've sent a line,
 * it's gone for the rest of this life, so the conversation keeps moving.
 * Children can still ask a parent for allowance any year (a utility line
 * that never runs out).
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

type Tier = 'high' | 'mid' | 'low'

export interface TextOption {
  id: string
  /** The message you send. */
  label: string
  tone: TextTone
  /**
   * Bond tiers this line is appropriate for. Omitted means "any bond" — the
   * warmest, most affectionate lines are gated to closer relationships.
   */
  tiers?: Tier[]
  /**
   * Whether sending this line spends it for the rest of the life. Utility
   * lines (asking a parent for allowance) are never consumed.
   */
  consumable?: boolean
}

type MsgGroup = 'parent' | 'sibling' | 'friend' | 'partner' | 'flingex' | 'enemy' | 'child'

function groupFor(role: PersonRole): MsgGroup {
  if (role === 'mother' || role === 'father') return 'parent'
  if (role === 'sibling') return 'sibling'
  if (role === 'child') return 'child'
  if (role === 'partner') return 'partner'
  if (role === 'ex' || role === 'fling') return 'flingex'
  if (role === 'enemy') return 'enemy'
  return 'friend'
}

function tierFor(bond: number): Tier {
  return bond >= 70 ? 'high' : bond >= 40 ? 'mid' : 'low'
}

const MID_HIGH: Tier[] = ['mid', 'high']
const HIGH: Tier[] = ['high']

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Small deterministic RNG so a contact's offered texts stay stable within a
// year (they don't reshuffle on every render) but refresh the next year.
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

let _uid = 0
/** Shorthand builder: c() casual, w() warm (mid+high), b() bold love (high). */
const c = (label: string, tiers?: Tier[]): TextOption => ({ id: `m${_uid++}`, label, tone: 'casual', tiers })
const w = (label: string, tiers: Tier[] = MID_HIGH): TextOption => ({ id: `m${_uid++}`, label, tone: 'warm', tiers })
const b = (label: string, tiers: Tier[] = MID_HIGH): TextOption => ({ id: `m${_uid++}`, label, tone: 'bold', tiers })
const f = (label: string, tiers?: Tier[]): TextOption => ({ id: `m${_uid++}`, label, tone: 'flirt', tiers })

const MESSAGE_POOL: Record<MsgGroup, TextOption[]> = {
  parent: [
    c('Hey, how have you been? 😊'),
    c('What’s for dinner? 👀'),
    c('Can you pick me up later? 🚗'),
    c('Just checking in. All good?'),
    c('Guess what happened today!'),
    c('Are we still on for the weekend?'),
    c('Do we have any of the good snacks left?'),
    c('Running a bit late, don’t wait up.'),
    c('Random question — what was I like as a baby?'),
    c('Can you remind me of that recipe?'),
    c('Is it okay if I bring a friend over?'),
    c('Did you see the news today?'),
    c('What time should I be home?'),
    c('Can we talk later? Nothing bad!'),
    c('Ugh, long day. How was yours?'),
    c('Any advice? I’ve got a big decision.'),
    c('I found an old photo of us, so cute 📷'),
    c('Do you need anything from the store?'),
    c('Reminder to take your meds! 💊'),
    c('Call you tonight?'),
    w('Thanks for always having my back. 🙏'),
    w('We should do a family dinner soon.'),
    w('I really appreciate everything you do.'),
    w('Miss your cooking. And you.'),
    w('Let’s plan a trip together sometime.'),
    w('You always know what to say. Thank you.'),
    w('Proud to be your kid, you know that?'),
    w('Can I come by this weekend? Miss home.'),
    w('You raised me right. Just wanted to say it.'),
    w('Let’s grab coffee, just the two of us.'),
    w('Sending you a big hug today. 🤗'),
    w('Thinking of you and everything you sacrificed.'),
    b('Love you! ❤️', MID_HIGH),
    b('You’re my hero, always have been.', MID_HIGH),
    b('I don’t say it enough — I love you so much.', HIGH),
    b('You mean the world to me. ❤️', HIGH),
    b('Couldn’t ask for a better parent. 🥹', HIGH),
    b('Whatever happens, I’ll always be here for you.', HIGH),
    b('You’re the strongest person I know.', MID_HIGH),
    b('Home isn’t a place, it’s you. 🏡', HIGH),
    c('Sorry I’ve been distant lately.', ['low', 'mid']),
    c('I know we don’t talk much, but hi.', ['low']),
    c('Been meaning to reach out. How are you?', ['low', 'mid']),
  ],
  sibling: [
    c('Yo, you around? 👀'),
    c('Mom’s looking for you btw.'),
    c('Did you take my charger AGAIN?'),
    c('Wanna play something later?'),
    c('You will not believe what just happened.'),
    c('Cover for me tonight? 🙏'),
    c('Remember that thing from when we were kids? 😂'),
    c('Who’s picking up the parents this year?'),
    c('I’m telling. (jk. maybe.)'),
    c('Can I borrow like 20 bucks?'),
    c('Movie night at yours?'),
    c('Send me that photo from the trip lol'),
    c('What are you getting mom for her birthday?'),
    c('You’re still the annoying one, just so we’re clear.'),
    c('Race you to the fridge (metaphorically).'),
    c('Big news, call me when you can!'),
    c('Did you eat the last slice?? 🍕'),
    c('Family group chat is chaos today lol'),
    c('Remember you owe me forever for that one time.'),
    c('Come out this weekend, it’ll be fun.'),
    w('You’re actually the best, don’t tell anyone.'),
    w('Thanks for having my back earlier.'),
    w('We should hang out more, for real.'),
    w('Glad we’re close, even when we fight.'),
    w('You always get me. Appreciate you.'),
    w('Let’s take a trip, just siblings.'),
    w('Proud of you, seriously.'),
    w('You’re gonna crush it, I believe in you.'),
    w('Thanks for the advice. You were right.'),
    w('Missing our late-night talks.'),
    w('Team us, always. 🤝'),
    w('You’re the only one who understands the family 😂'),
    b('Love you, weirdo. ❤️', MID_HIGH),
    b('You’re my best friend, honestly.', HIGH),
    b('I’d do anything for you, you know that.', HIGH),
    b('So lucky you’re my sibling. 🥹', HIGH),
    b('Ride or die, forever. 🤞', HIGH),
    b('No one’s got me like you do.', HIGH),
    b('You’re half of my best memories.', MID_HIGH),
    b('Through everything, it’s us. ❤️', HIGH),
    c('We should talk more. It’s been weird lately.', ['low', 'mid']),
    c('Truce? I hate fighting with you.', ['low', 'mid']),
    c('I know things are tense. Still love ya though.', ['low']),
  ],
  friend: [
    c('Yooo what’s up? 😄'),
    c('We still on for this weekend?'),
    c('You’ll never guess what I just saw lol'),
    c('Bro. BRO. Check your phone.'),
    c('Free later? Coffee?'),
    c('Send memes, I’m bored 😩'),
    c('How’d that thing go?'),
    c('Long time no talk! What’s new?'),
    c('You up? Can’t sleep.'),
    c('Random but I miss the old days.'),
    c('Come to the thing on Friday, pls.'),
    c('Rate my terrible idea real quick.'),
    c('Guess who’s in your neighborhood 👀'),
    c('Did you watch the game?? 🏀'),
    c('I need your opinion on something.'),
    c('Lunch tomorrow? My treat.'),
    c('You free for a call? Need to vent lol'),
    c('Throwback to that trip, best times 📸'),
    c('New spot opened up, wanna try it?'),
    c('Save me a seat, running late.'),
    w('Grateful for you, honestly.'),
    w('You always show up when it counts. Thanks.'),
    w('We should hang out way more.'),
    w('Good talk earlier, needed that.'),
    w('You’re one of the real ones. 🙌'),
    w('Let’s make plans that we actually keep this time.'),
    w('Proud of how far you’ve come.'),
    w('Thanks for listening the other night.'),
    w('You make everything more fun, you know?'),
    w('Been too long. Let’s fix that.'),
    w('Cheering you on always, you got this.'),
    w('Glad the universe put you in my life.'),
    b('You’re the best, I mean it. 🤝', MID_HIGH),
    b('Love ya, man. Right back at you always.', MID_HIGH),
    b('Best friend a person could ask for. 🥹', HIGH),
    b('I’d drop everything for you, you know that.', HIGH),
    b('Decades from now it’ll still be us. 🍻', HIGH),
    b('You’re family at this point. ❤️', HIGH),
    b('Couldn’t have gotten through it without you.', HIGH),
    b('My person. That’s it, that’s the text.', HIGH),
    c('Hey stranger. Been way too long.', ['low', 'mid']),
    c('I know we drifted. Thinking of you though.', ['low']),
    c('No pressure, but we should reconnect.', ['low', 'mid']),
  ],
  partner: [
    c('Morning ☀️ Sleep okay?'),
    c('What do you want for dinner tonight?'),
    c('On my way home 🚗'),
    c('How’s your day going, love?'),
    c('Don’t forget we have plans tonight 😊'),
    c('Miss you already and it’s been an hour lol'),
    c('Can you grab milk on the way back?'),
    c('Thinking about our weekend 🥰'),
    c('Text me when you’re free?'),
    c('Guess who’s cooking tonight. (It’s me.)'),
    c('Home soon, save me some 😅'),
    c('Random check-in: you’re cute.'),
    c('What movie tonight? You pick.'),
    c('Call you on my break 💛'),
    c('Ready for date night? 🌹'),
    w('So grateful to have you.'),
    w('You make ordinary days feel special.'),
    w('Let’s run away together for a weekend.'),
    w('I appreciate you more than I say.'),
    w('You’re my favorite part of every day.'),
    w('Proud to be yours. 🥰'),
    w('Can’t wait to grow old with you.'),
    w('Thank you for being my calm.'),
    w('Every day with you is a good one.'),
    w('You feel like home to me. 🏡'),
    f('Thinking about you 😘'),
    f('Wish you were here right now 😏'),
    f('You looked incredible today, just saying.'),
    f('Come here, I miss you 💋'),
    f('Counting the minutes till I see you 😍'),
    f('You’re dangerously attractive, you know that?'),
    f('Can’t stop smiling thinking about you 🙈'),
    f('Hurry home, I have plans for us 😉'),
    b('I love you, endlessly. ❤️', MID_HIGH),
    b('You’re the love of my life. 💖', HIGH),
    b('Forever you and me. 💍', HIGH),
    b('I’d choose you in every lifetime.', HIGH),
    b('You mean everything to me. ❤️', MID_HIGH),
    b('My whole heart, that’s you. 🥹', HIGH),
    b('Marrying you was my best decision.', HIGH),
    b('Still can’t believe you’re mine. 💕', HIGH),
    c('Can we talk tonight? Feels like we’ve drifted.', ['low', 'mid']),
    c('I miss us. Let’s reconnect.', ['low', 'mid']),
  ],
  flingex: [
    c('Hey, been a while 👀'),
    c('You popped into my head today lol'),
    c('Still have my hoodie btw 😂'),
    c('How’ve you been, honestly?'),
    c('Weird running into your name online.'),
    c('No agenda, just saying hi.'),
    c('Heard your song came on, thought of you.'),
    c('Are you around this weekend?'),
    c('So… how’s life treating you?'),
    c('Can’t believe it’s been this long.'),
    c('You still doing the thing you loved?'),
    c('Saw a movie you’d hate. Thought of you 😏'),
    c('This is random, I know. Hi.'),
    c('Long time no talk, stranger.'),
    c('You crossed my mind, so, hey.'),
    w('Hope you’re doing really well, I mean it.'),
    w('No hard feelings, just wanted to check in.'),
    w('You deserve all the good stuff, truly.'),
    w('Glad we can still be cool with each other.'),
    w('Whatever we were, I’m grateful for it.'),
    w('Coffee sometime? Just to catch up.'),
    w('Proud of where you’ve ended up.'),
    w('You always were one of a kind.'),
    f('Not gonna lie, I still think about you 😅'),
    f('You looked good in that last post 🔥'),
    f('Remember that night? I do 😏'),
    f('Tell me you don’t miss this a little 😘'),
    f('We were kind of electric, weren’t we?'),
    f('One drink, for old times’ sake? 🍷'),
    f('Still got that effect on me, apparently.'),
    f('Come over? No strings 😉', MID_HIGH),
    f('I’ve been thinking about us lately 🙈', MID_HIGH),
    b('I still care about you, I always will.', MID_HIGH),
    b('Part of me never really let go. ❤️', HIGH),
    b('You were the one that got away, weren’t you.', HIGH),
    b('Maybe we gave up too easily.', MID_HIGH),
    b('I regret how we ended. Truly.', MID_HIGH),
    b('If timing were different… you and me.', HIGH),
    c('I know it ended badly. Hope you’re okay though.', ['low']),
    c('No drama, promise. Just wishing you well.', ['low', 'mid']),
    c('We don’t have to talk. But I’m here if you want.', ['low']),
    c('Clean slate? I’d like us to be okay.', ['low', 'mid']),
  ],
  enemy: [
    { id: 'insult', label: 'You’re the actual worst. 😒', tone: 'rude' },
    { id: 'threat', label: 'This isn’t over.', tone: 'rude' },
    { id: 'petty', label: 'Everyone agrees with me, by the way.', tone: 'rude' },
    { id: 'cold', label: 'Lose my number. Permanently.', tone: 'rude' },
    { id: 'smug', label: 'Funny how things worked out for me, not you. 😏', tone: 'rude' },
    { id: 'done', label: 'I’m so done with you it’s not even anger anymore.', tone: 'rude' },
    { id: 'truce', label: 'Can we just call a truce?', tone: 'truce' },
    { id: 'truce2', label: 'This feud is exhausting. Peace?', tone: 'truce' },
    { id: 'truce3', label: 'Maybe we were both wrong. Start over?', tone: 'truce', tiers: MID_HIGH },
  ],
  child: [
    c('How was school today? 😊'),
    c('Did you eat something good?'),
    c('Be home before dark, okay?'),
    c('Proud of you, kiddo.'),
    c('Need anything from the store?'),
    c('Text me when you get there safe.'),
    c('How are your friends doing?'),
    c('Want me to pick you up?'),
    c('Don’t stay up too late! 😴'),
    c('Call me if you need anything, ever.'),
    c('Guess what, made your favorite for dinner 🍝'),
    c('How’d the test go? You studied so hard.'),
    w('You know I’m always in your corner, right?'),
    w('So proud of the person you’re becoming.'),
    w('You can tell me anything. Always.'),
    w('Let’s do something fun this weekend.'),
    w('Thinking of you today. 🤗'),
    w('You make me proud every single day.'),
    b('Love you to the moon and back. 🌙', MID_HIGH),
    b('You’re the best thing I ever did. ❤️', MID_HIGH),
    b('I’ll love you no matter what, forever.', HIGH),
    b('My whole world, that’s you. 🥹', HIGH),
    c('I know things have been hard between us.', ['low', 'mid']),
    c('Door’s always open when you’re ready to talk.', ['low']),
  ],
}

/** Kid-only utility line for parents — asking for allowance, never used up. */
const ASK_ALLOWANCE: TextOption = {
  id: 'ask-money',
  label: 'Can I have some allowance? 🙏',
  tone: 'ask-money',
  consumable: false,
}

const OPTIONS_PER_YEAR = 3

/**
 * The texts on offer for a contact this year: a small random set drawn from
 * the lines that fit your bond and haven't been sent yet this life. Stable
 * within a year, refreshed each year.
 */
export function textOptionsFor(
  role: PersonRole,
  age: number,
  bond: number,
  personId: string,
  year: number,
  usedTexts: string[],
): TextOption[] {
  const group = groupFor(role)
  const tier = tierFor(bond)
  const used = new Set(usedTexts)

  const eligible = MESSAGE_POOL[group].filter(
    (o) => (!o.tiers || o.tiers.includes(tier)) && !used.has(`${personId}:${o.id}`),
  )
  const rng = mulberry32(hashStr(`${personId}:${year}`))
  const picks = seededShuffle(eligible, rng).slice(0, OPTIONS_PER_YEAR)

  // A kid can always ask a parent for allowance, on top of the chit-chat.
  if (group === 'parent' && age < 18) return [ASK_ALLOWANCE, ...picks]
  return picks
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

function bucketFor(role: PersonRole): Bucket {
  if (role === 'mother' || role === 'father' || role === 'sibling' || role === 'child') return 'family'
  if (role === 'partner' || role === 'ex' || role === 'fling') return 'romance'
  if (role === 'enemy') return 'enemy'
  return 'friend'
}

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
    casual: {
      high: ['Hi love ❤️ Missed your texts.', 'There’s my favorite person 🥰'],
      mid: ['Hey you 😊 How’s your day?', 'Aw, nice to hear from you.'],
      low: ['Oh. Hey. Didn’t expect that.', 'Hi... this is a bit out of the blue.'],
    },
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
