import type { PartnerStatus, PersonRole } from '../types'

/**
 * The Messages app. What you can text someone depends on two things, exactly
 * like real life: WHO they are to you (a parent, a sibling, a new crush, a
 * spouse, an ex, a bitter enemy…) and HOW CLOSE you are right now (the bond).
 *
 * Every line is tagged with the bond band(s) it belongs to:
 *   • distant (bond < 40): tentative, practical, reconnecting — you're not
 *     close, so you can't gush. Warm lines simply aren't offered.
 *   • friendly (40–69): everyday chatter, plans, small favours, light warmth.
 *   • close (70+): affection, "I love you", vulnerable and deep lines,
 *     inside jokes, big favours.
 *
 * So as a bond grows, brand-new texts unlock — investing in someone visibly
 * changes what you can say to them. You can send up to THREE texts to a given
 * person each year, choosing from a fresh menu that refreshes every year.
 * Replies are chosen by what you said and coloured by how close you are, and
 * every text nudges your mood and the bond up or down depending on the message.
 */

/** What a message is *doing*, so the reply can actually fit it. */
export type TextTone =
  | 'greet'
  | 'ask'
  | 'plan'
  | 'love'
  | 'flirt'
  | 'thanks'
  | 'reconnect'
  | 'news'
  | 'favor'
  | 'fyi'
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
  /** Bond tiers this line is appropriate for. */
  tiers?: Tier[]
}

/**
 * Message pools are keyed by *what the relationship is* — and a partner splits
 * into `dating` vs `spouse`, an ex and a fling get their own voices, so the
 * relationship type genuinely changes what's on offer.
 */
type MsgGroup =
  | 'parent'
  | 'sibling'
  | 'child'
  | 'friend'
  | 'dating'
  | 'spouse'
  | 'ex'
  | 'fling'
  | 'enemy'

function groupFor(role: PersonRole, partnerStatus?: PartnerStatus | null): MsgGroup {
  if (role === 'mother' || role === 'father') return 'parent'
  if (role === 'sibling') return 'sibling'
  if (role === 'child') return 'child'
  if (role === 'partner') return partnerStatus === 'dating' ? 'dating' : 'spouse'
  if (role === 'ex') return 'ex'
  if (role === 'fling') return 'fling'
  if (role === 'enemy') return 'enemy'
  return 'friend'
}

function tierFor(bond: number): Tier {
  return bond >= 70 ? 'high' : bond >= 40 ? 'mid' : 'low'
}

const LOW: Tier[] = ['low']
const MID_HIGH: Tier[] = ['mid', 'high']
const HIGH: Tier[] = ['high']

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Deterministic RNG so a contact's offered texts stay stable within a year
// (they don't reshuffle on every render) but refresh the next year.
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
type Line = [TextTone, string]
interface TierLines {
  /** Distant lines — shown only at low bond. */
  low: Line[]
  /** Everyday lines — shown at mid and high bond. */
  mid: Line[]
  /** Close/affectionate lines — shown only at high bond. */
  high: Line[]
}

function buildPool(t: TierLines): TextOption[] {
  const make = (lines: Line[], tiers: Tier[]): TextOption[] =>
    lines.map(([tone, label]) => ({ id: `m${_uid++}`, label, tone, tiers }))
  return [...make(t.low, LOW), ...make(t.mid, MID_HIGH), ...make(t.high, HIGH)]
}

// ------------------------------------------------------------------ content
// low = distant/tentative · mid = everyday/friendly · high = close/affectionate

const GROUPS: Record<MsgGroup, TierLines> = {
  parent: {
    low: [
      ['reconnect', 'Hey… it’s been a while. How are you?'],
      ['reconnect', 'I know we don’t talk much, but hi.'],
      ['reconnect', 'Sorry I’ve been distant lately.'],
      ['reconnect', 'Been meaning to reach out. How are you?'],
      ['ask', 'Quick question — you around this week?'],
      ['fyi', 'Just letting you know I’m okay.'],
    ],
    mid: [
      ['greet', 'Hey, how have you been? 😊'],
      ['ask', 'What’s for dinner? 👀'],
      ['favor', 'Can you pick me up later? 🚗'],
      ['greet', 'Just checking in. All good?'],
      ['news', 'Guess what happened today!'],
      ['ask', 'Any advice? I’ve got a big decision.'],
      ['plan', 'We should do a family dinner soon.'],
      ['ask', 'Do you need anything from the store?'],
      ['fyi', 'Running a bit late, don’t wait up.'],
      ['ask', 'Call you tonight?'],
      ['news', 'Found an old photo of us, so cute 📷'],
      ['favor', 'Reminder to take your meds! 💊'],
    ],
    high: [
      ['love', 'Love you! ❤️'],
      ['love', 'I don’t say it enough — I love you so much.'],
      ['love', 'You’re my hero, always have been.'],
      ['thanks', 'You raised me right. Just wanted to say it.'],
      ['love', 'Home isn’t a place, it’s you. 🏡'],
      ['thanks', 'Thinking of everything you sacrificed for me.'],
      ['plan', 'Can I come by this weekend? Miss home.'],
      ['love', 'Whatever happens, I’ll always be here for you.'],
      ['thanks', 'Proud to be your kid. You know that?'],
      ['love', 'Couldn’t ask for a better parent. 🥹'],
    ],
  },
  sibling: {
    low: [
      ['reconnect', 'We should talk more. It’s been weird lately.'],
      ['reconnect', 'Truce? I hate fighting with you.'],
      ['reconnect', 'I know things are tense. Still love ya though.'],
      ['fyi', 'Mom’s looking for you btw.'],
      ['ask', 'Who’s handling the parents this year?'],
    ],
    mid: [
      ['greet', 'Yo, you around? 👀'],
      ['fyi', 'Did you take my charger AGAIN?'],
      ['plan', 'Wanna play something later?'],
      ['news', 'You will not believe what just happened.'],
      ['favor', 'Cover for me tonight? 🙏'],
      ['news', 'Remember that thing from when we were kids? 😂'],
      ['favor', 'Can I borrow like 20 bucks?'],
      ['plan', 'Movie night at yours?'],
      ['ask', 'What are you getting mom for her birthday?'],
      ['fyi', 'Did you eat the last slice?? 🍕'],
      ['plan', 'Come out this weekend, it’ll be fun.'],
    ],
    high: [
      ['thanks', 'You’re actually the best, don’t tell anyone.'],
      ['thanks', 'Glad we’re close, even when we fight.'],
      ['plan', 'Let’s take a trip, just siblings.'],
      ['thanks', 'You’re the only one who gets the family 😂'],
      ['love', 'Love you, weirdo. ❤️'],
      ['love', 'You’re my best friend, honestly.'],
      ['love', 'Ride or die, forever. 🤞'],
      ['love', 'So lucky you’re my sibling. 🥹'],
      ['love', 'Through everything, it’s us. ❤️'],
    ],
  },
  child: {
    low: [
      ['reconnect', 'I know things have been hard between us.'],
      ['reconnect', 'Door’s always open when you’re ready to talk.'],
      ['ask', 'Just checking you’re okay. Are you?'],
      ['fyi', 'Thinking of you today, no pressure to reply.'],
    ],
    mid: [
      ['ask', 'How was school today? 😊'],
      ['ask', 'Did you eat something good?'],
      ['favor', 'Be home before dark, okay?'],
      ['ask', 'Need anything from the store?'],
      ['favor', 'Text me when you get there safe.'],
      ['ask', 'How are your friends doing?'],
      ['ask', 'Want me to pick you up?'],
      ['news', 'Made your favorite for dinner 🍝'],
      ['ask', 'How’d the test go? You studied so hard.'],
      ['plan', 'Let’s do something fun this weekend.'],
    ],
    high: [
      ['thanks', 'Proud of you, kiddo.'],
      ['thanks', 'You know I’m always in your corner, right?'],
      ['thanks', 'So proud of the person you’re becoming.'],
      ['thanks', 'You can tell me anything. Always.'],
      ['love', 'Love you to the moon and back. 🌙'],
      ['love', 'You’re the best thing I ever did. ❤️'],
      ['love', 'I’ll love you no matter what, forever.'],
      ['love', 'My whole world, that’s you. 🥹'],
    ],
  },
  friend: {
    low: [
      ['reconnect', 'Hey stranger. Been way too long.'],
      ['reconnect', 'I know we drifted. Thinking of you though.'],
      ['reconnect', 'No pressure, but we should reconnect.'],
      ['greet', 'Long time no talk! What’s new?'],
      ['ask', 'This is random — how’ve you been, honestly?'],
    ],
    mid: [
      ['greet', 'Yooo what’s up? 😄'],
      ['ask', 'We still on for this weekend?'],
      ['news', 'You’ll never guess what I just saw lol'],
      ['plan', 'Free later? Coffee?'],
      ['favor', 'Send memes, I’m bored 😩'],
      ['ask', 'How’d that thing go?'],
      ['plan', 'Come to the thing on Friday, pls.'],
      ['ask', 'Did you watch the game?? 🏀'],
      ['plan', 'Lunch tomorrow? My treat.'],
      ['ask', 'You free for a call? Need to vent lol'],
      ['favor', 'Save me a seat, running late.'],
    ],
    high: [
      ['thanks', 'Grateful for you, honestly.'],
      ['thanks', 'You always show up when it counts. Thanks.'],
      ['thanks', 'You’re one of the real ones. 🙌'],
      ['thanks', 'Cheering you on always, you got this.'],
      ['love', 'Best friend a person could ask for. 🥹'],
      ['love', 'I’d drop everything for you, you know that.'],
      ['love', 'Decades from now it’ll still be us. 🍻'],
      ['love', 'You’re family at this point. ❤️'],
      ['love', 'My person. That’s it, that’s the text.'],
    ],
  },
  // A NEW relationship — butterflies, getting to know each other, flirting.
  dating: {
    low: [
      ['greet', 'Hey, this is a little forward but… hi 😊'],
      ['ask', 'So tell me — what are you into?'],
      ['reconnect', 'Was great meeting you. Free sometime?'],
      ['ask', 'Is it too soon to say I like talking to you?'],
    ],
    mid: [
      ['greet', 'Morning ☀️ How’d you sleep?'],
      ['plan', 'Dinner Friday? I know a spot 🍷'],
      ['ask', 'What are you up to this weekend?'],
      ['news', 'Heard a song and thought of you 🎶'],
      ['ask', 'Can I call you later? I like your voice 😊'],
      ['greet', 'Thinking about our last date 🥰'],
      ['plan', 'Wanna get out of town for a day?'],
      ['flirt', 'You’ve been on my mind all day, ngl.'],
    ],
    high: [
      ['flirt', 'You looked incredible last night 😘'],
      ['flirt', 'Come over? I miss you 💋'],
      ['flirt', 'You’re dangerously cute, you know that?'],
      ['love', 'I think I’m falling for you… 🙈'],
      ['love', 'Is it crazy that this already feels right?'],
      ['love', 'I don’t want to date anyone but you.'],
      ['plan', 'Be my plus-one to everything? 💕'],
    ],
  },
  // A COMMITTED partner (engaged/married) — settled, domestic, deep.
  spouse: {
    low: [
      ['reconnect', 'Can we talk tonight? Feels like we’ve drifted.'],
      ['reconnect', 'I miss us. Let’s reconnect.'],
      ['ask', 'Are we okay? Been quiet lately.'],
      ['fyi', 'On my way home. We should talk.'],
    ],
    mid: [
      ['greet', 'Morning ☀️ Sleep okay?'],
      ['ask', 'What do you want for dinner tonight?'],
      ['greet', 'On my way home 🚗'],
      ['favor', 'Can you grab milk on the way back?'],
      ['ask', 'Don’t forget we have plans tonight 😊'],
      ['news', 'Guess who’s cooking tonight. (It’s me.)'],
      ['ask', 'What movie tonight? You pick.'],
      ['plan', 'Ready for date night? 🌹'],
      ['thanks', 'Random check-in: you’re cute.'],
    ],
    high: [
      ['thanks', 'You make ordinary days feel special.'],
      ['thanks', 'You’re my favorite part of every day.'],
      ['flirt', 'Hurry home, I have plans for us 😉'],
      ['love', 'Can’t wait to grow old with you.'],
      ['love', 'You feel like home to me. 🏡'],
      ['love', 'You’re the love of my life. 💖'],
      ['love', 'I’d choose you in every lifetime.'],
      ['love', 'Marrying you was my best decision.'],
      ['love', 'Still can’t believe you’re mine. 💕'],
    ],
  },
  // An EX — history, awkwardness, closure, the occasional pang of regret.
  ex: {
    low: [
      ['reconnect', 'I know it ended badly. Hope you’re okay though.'],
      ['reconnect', 'No drama, promise. Just wishing you well.'],
      ['reconnect', 'We don’t have to talk. But I’m here if you want.'],
      ['reconnect', 'Clean slate? I’d like us to be okay.'],
      ['greet', 'Weird seeing your name pop up. Hi.'],
    ],
    mid: [
      ['greet', 'Hey, been a while 👀'],
      ['news', 'Heard your song came on, thought of you.'],
      ['ask', 'You still doing the thing you loved?'],
      ['thanks', 'Hope you’re doing really well, I mean it.'],
      ['thanks', 'Glad we can still be cool with each other.'],
      ['plan', 'Coffee sometime? Just to catch up.'],
      ['thanks', 'Whatever we were, I’m grateful for it.'],
    ],
    high: [
      ['flirt', 'Not gonna lie, I still think about you 😅'],
      ['flirt', 'Remember that night? I do 😏'],
      ['flirt', 'We were kind of electric, weren’t we?'],
      ['love', 'Part of me never really let go. ❤️'],
      ['love', 'You were the one that got away, weren’t you.'],
      ['love', 'If timing were different… you and me.'],
      ['plan', 'One drink, for old times’ sake? 🍷'],
    ],
  },
  // A FLING — casual, low-stakes, all spark and no strings.
  fling: {
    low: [
      ['greet', 'Hey you 👀 this a good number still?'],
      ['greet', 'Random hi. No agenda.'],
      ['fyi', 'Still have my hoodie btw 😂'],
      ['ask', 'You around at all this week?'],
    ],
    mid: [
      ['greet', 'Long time. What are you up to? 😏'],
      ['flirt', 'You popped into my head today 🙈'],
      ['plan', 'Drinks later? No plans, just vibes.'],
      ['flirt', 'You looked good in that last post 🔥'],
      ['ask', 'Free tonight? 👀'],
    ],
    high: [
      ['flirt', 'Come over? No strings 😉'],
      ['flirt', 'I’ve been thinking about us lately 🙈'],
      ['flirt', 'Still got that effect on me, apparently.'],
      ['flirt', 'Tell me you don’t miss this a little 😘'],
      ['plan', 'My place, tonight? 🌙'],
    ],
  },
  enemy: {
    low: [
      ['rude', 'You’re the actual worst. 😒'],
      ['rude', 'This isn’t over.'],
      ['rude', 'Lose my number. Permanently.'],
      ['rude', 'Everyone agrees with me, by the way.'],
      ['rude', 'Funny how things worked out for me, not you. 😏'],
    ],
    mid: [
      ['rude', 'I’m so done with you it’s not even anger anymore.'],
      ['truce', 'Can we just call a truce?'],
      ['truce', 'This feud is exhausting. Peace?'],
    ],
    high: [
      ['truce', 'Maybe we were both wrong. Start over?'],
      ['truce', 'Life’s too short for this. Friends?'],
    ],
  },
}

const MESSAGE_POOL: Record<MsgGroup, TextOption[]> = Object.fromEntries(
  (Object.keys(GROUPS) as MsgGroup[]).map((k) => [k, buildPool(GROUPS[k])]),
) as Record<MsgGroup, TextOption[]>

/** Kid-only utility line for parents — asking for allowance. */
const ASK_ALLOWANCE: TextOption = {
  id: 'ask-money',
  label: 'Can I have some allowance? 🙏',
  tone: 'ask-money',
}

/** Exactly three random messages are offered per person each year. */
export const TEXTS_PER_YEAR = 3

/** A short, human label for a bond tier — shown in the UI so the player sees
 * why the options differ. */
export function bondWarmth(role: PersonRole, bond: number): string {
  const tier = tierFor(bond)
  if (role === 'enemy') return tier === 'high' ? 'Thawing' : tier === 'mid' ? 'Cold' : 'Hostile'
  return tier === 'high' ? 'Close' : tier === 'mid' ? 'Friendly' : 'Distant'
}

/**
 * The texts on offer for a contact this year: a random menu drawn from the
 * lines that fit BOTH who they are and how close you are. Stable within a year,
 * refreshed each year — you choose up to three to actually send.
 */
export function textOptionsFor(
  role: PersonRole,
  age: number,
  bond: number,
  personId: string,
  year: number,
  partnerStatus?: PartnerStatus | null,
): TextOption[] {
  const group = groupFor(role, partnerStatus)
  const tier = tierFor(bond)

  const eligible = MESSAGE_POOL[group].filter((o) => !o.tiers || o.tiers.includes(tier))
  const rng = mulberry32(hashStr(`${personId}:${year}`))
  const picks = seededShuffle(eligible, rng).slice(0, TEXTS_PER_YEAR)

  // A kid can always ask a parent for allowance — it takes one of the three slots.
  if (group === 'parent' && age < 18) return [ASK_ALLOWANCE, ...picks.slice(0, TEXTS_PER_YEAR - 1)]
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

type Bucket = 'family' | 'romance' | 'friend'

function bucketFor(role: PersonRole): Bucket {
  if (role === 'mother' || role === 'father' || role === 'sibling' || role === 'child') return 'family'
  if (role === 'partner' || role === 'ex' || role === 'fling') return 'romance'
  return 'friend'
}

type Intent = Exclude<TextTone, 'rude' | 'truce' | 'ask-money' | 'ask-phone'>

/** Reply text keyed by what you said (intent) and how close you are (tier). */
const BASE: Record<Intent, Record<Tier, string[]>> = {
  greet: {
    high: ['So good to hear from you! ❤️', 'Aw, was just thinking about you!'],
    mid: ['Hey! Been alright, you know how it is.', 'Oh hi! Keeping busy 😊'],
    low: ['Oh. Hey. Been a while.', 'Hi… bit of a surprise, but hey.'],
  },
  ask: {
    high: ['Haha good question — let me get back to you! 😄', 'Ooh not sure yet, what do you reckon?'],
    mid: ['Hmm, let me think and I’ll let you know.', 'Good question! I’ll sort it out.'],
    low: ['Uh, not sure. I’ll check I guess.', 'Hmm, dunno. I’ll get back to you.'],
  },
  plan: {
    high: ['Yes!! I’m so in 🎉', 'Absolutely, count me in!'],
    mid: ['Yeah, let’s do it. When?', 'Sure, sounds good — pick a day.'],
    low: ['Eh, maybe. I’ve been busy.', 'We’ll see… no promises.'],
  },
  love: {
    high: ['Love you too, so much ❤️', 'Aw, you’re gonna make me cry 🥹'],
    mid: ['Aw, love you too 😊', 'That’s sweet — right back at you.'],
    low: ['…That means a lot. Thank you.', 'Oh. That’s unexpected, but thanks.'],
  },
  flirt: {
    high: ['Stop it, you’re making me blush 😘', 'Come here and say that 😏'],
    mid: ['Oh yeah? 😊 Go on…', 'Smooth. I’m listening 👀'],
    low: ['Ha, that’s forward 😅', 'Oh… wasn’t expecting that.'],
  },
  thanks: {
    high: ['You’re the sweetest, honestly 🥰', 'Aw, that means everything — thank you.'],
    mid: ['That’s really kind, thanks 😊', 'Aw, appreciate you saying that.'],
    low: ['Oh… thanks, that’s nice of you.', 'That’s unexpectedly kind, thank you.'],
  },
  reconnect: {
    high: ['Of course! Always good to hear from you.', 'No worries at all — hi! 😊'],
    mid: ['Hey, good to hear from you 😊', 'It has been a while! Hope you’re well.'],
    low: ['Oh… hey. Didn’t expect this.', 'Been a long time. But… hi.'],
  },
  news: {
    high: ['Ooh tell me everything!! 👀', 'What?! Spill, right now!'],
    mid: ['Oh? What happened?', 'Go on, I’m listening!'],
    low: ['Oh. What’s up?', 'Hm? What is it?'],
  },
  favor: {
    high: ['Sure, anything for you 👍', 'Yeah of course, no problem!'],
    mid: ['Yeah okay, I got you.', 'Sure, just this once 😅'],
    low: ['Hmm… I guess, this time.', 'Eh, fine. You owe me though.'],
  },
  fyi: {
    high: ['Ha, noted 😄', 'Lol okay okay, fair.'],
    mid: ['Ha, alright alright.', 'Okay, thanks for the heads up 😅'],
    low: ['Uh, okay. Noted.', 'Right. Thanks, I guess.'],
  },
}

/** Romance colours a few intents more tenderly (or awkwardly, when cold). */
const ROMANCE: Partial<Record<Intent, Record<Tier, string[]>>> = {
  greet: {
    high: ['Hi love ❤️ Missed you.', 'There’s my favorite person 🥰'],
    mid: ['Hey you 😊', 'Aw, hi 💛'],
    low: ['Oh. Hey, you.', 'Hi… didn’t expect to hear from you.'],
  },
  plan: {
    high: ['Yes! Pick me up at 8? 💕', 'I’ll clear my whole night 🥰'],
    mid: ['I’d love that 😊 When?', 'Sounds lovely, let’s.'],
    low: ['I’m… not sure that’s a good idea.', 'Maybe. Let me think.'],
  },
  love: {
    high: ['You’re my whole world 💖', 'I love you more, always ❤️'],
    mid: ['That’s so sweet 😊 Love you.', 'Aw, you melt me. Love you.'],
    low: ['That’s… a lot right now.', 'I don’t know what to say to that.'],
  },
  flirt: {
    high: ['Come over and find out 😏', 'You’re trouble 😘 I love it.'],
    mid: ['Oh, you’re bold today 😊', 'Careful, I might hold you to that 👀'],
    low: ['Oh… that’s forward.', 'Hah. Someone’s confident.'],
  },
}

/** Family says "love you too, kiddo" rather than a romantic reply. */
const FAMILY: Partial<Record<Intent, Record<Tier, string[]>>> = {
  love: {
    high: ['Love you too, always 🥹', 'You’re going to make me cry. Love you.'],
    mid: ['Aw. Love you too 😊', 'That’s sweet. Love you.'],
    low: ['…That means something. Thank you.', 'That’s unexpected. But thank you.'],
  },
}

const ENEMY_REPLIES: Record<'rude' | 'truce', Record<Tier, string[]>> = {
  rude: {
    high: ['…Wow. And here I thought we’d moved on.', 'Charming as ever. Goodbye.'],
    mid: ['The feeling is entirely mutual.', 'Lose my number.'],
    low: ['Blocked. Again.', 'You’re not worth the reply. (But here it is.)'],
  },
  truce: {
    high: ['Okay. Truce. I’d actually like that.', 'Yeah… I’m tired of the feud too. Deal.'],
    mid: ['A truce? I’ll think about it.', 'Hah. We’re not there yet — but maybe.'],
    low: ['Absolutely not.', 'You have got to be joking.'],
  },
}

/** How much each intent moves the bond needle. */
const WEIGHT: Record<Intent, number> = {
  greet: 1,
  ask: 1,
  favor: 1,
  news: 1,
  fyi: 1,
  reconnect: 1,
  thanks: 2,
  plan: 2,
  flirt: 2,
  love: 3,
}

/** How a contact answers your text — reply line plus any effects. */
export function textReply(role: PersonRole, bond: number, tone: TextTone): TextReply {
  const tier = tierFor(bond)

  // Children asking a parent for things.
  if (tone === 'ask-money') {
    const yes = tier === 'high' || (tier === 'mid' && Math.random() < 0.6)
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

  // Enemies only ever get rude or truce lines.
  if (tone === 'rude' || tone === 'truce') {
    const text = pick(ENEMY_REPLIES[tone][tier])
    if (tone === 'truce') {
      const bond = tier === 'high' ? 6 : tier === 'mid' ? 3 : -1
      return { text, bond, happiness: bond > 0 ? 2 : -2 }
    }
    // Being rude to an enemy: satisfying in the moment, but burns the bridge.
    return { text, bond: -3, happiness: 1 }
  }

  const intent = tone as Intent
  const bucket = bucketFor(role)
  const table =
    bucket === 'romance'
      ? { ...BASE, ...ROMANCE }
      : bucket === 'family'
        ? { ...BASE, ...FAMILY }
        : BASE
  const text = pick(table[intent][tier])

  // Bond moves by the intent's warmth, nudged by how close you already are.
  // Warm words to someone distant can land awkwardly and backfire.
  let bondDelta: number
  if (tier === 'low' && (intent === 'love' || intent === 'flirt')) {
    bondDelta = -2 // too much, too soon
  } else {
    bondDelta = WEIGHT[intent] + (tier === 'high' ? 1 : tier === 'low' ? -1 : 0)
  }
  // Mood tracks how the exchange went — a warm reply lifts you, an awkward
  // or cold one stings.
  const happiness =
    bondDelta >= 3 ? 3 : bondDelta === 2 ? 2 : bondDelta >= 1 ? 1 : bondDelta === 0 ? 0 : -2
  return { text, bond: bondDelta, happiness }
}
