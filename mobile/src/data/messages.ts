import type { PersonRole } from '../types'

/**
 * The Messages app. Every relationship has a deep catalogue of things you
 * might text (40+ lines each). Each year a fresh handful is offered, drawn
 * from the lines that suit how close you are. You can text a contact as many
 * times as you like — you just can't send the same line twice in a life, so
 * the conversation always moves forward. Replies are chosen by what you
 * actually said (a question gets an answer, "I love you" gets one back) and
 * coloured by how strong your bond is. Kids can still ask a parent for
 * allowance any year (a utility line that never runs out, capped once a year).
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
  /**
   * Bond tiers this line is appropriate for. Omitted means "any bond" — the
   * warmest, most affectionate lines are gated to closer relationships, and
   * reconnecting lines only show up when you've drifted apart.
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
const LOW_MID: Tier[] = ['low', 'mid']
const LOW: Tier[] = ['low']

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
const opt = (tone: TextTone, label: string, tiers?: Tier[]): TextOption => ({
  id: `m${_uid++}`,
  label,
  tone,
  tiers,
})
// Intent-tagged builders: g greet, q ask/question, pl plan/invite, lv love,
// fl flirt, th thanks/compliment, rc reconnect, nw news, fv favor.
const g = (label: string, tiers?: Tier[]) => opt('greet', label, tiers)
const q = (label: string, tiers?: Tier[]) => opt('ask', label, tiers)
const pl = (label: string, tiers: Tier[] = MID_HIGH) => opt('plan', label, tiers)
const lv = (label: string, tiers: Tier[] = MID_HIGH) => opt('love', label, tiers)
const fl = (label: string, tiers?: Tier[]) => opt('flirt', label, tiers)
const th = (label: string, tiers: Tier[] = MID_HIGH) => opt('thanks', label, tiers)
const rc = (label: string, tiers: Tier[] = LOW_MID) => opt('reconnect', label, tiers)
const nw = (label: string, tiers?: Tier[]) => opt('news', label, tiers)
const fv = (label: string, tiers?: Tier[]) => opt('favor', label, tiers)
// fy: light banter or a heads-up that just wants an acknowledging reply.
const fy = (label: string, tiers?: Tier[]) => opt('fyi', label, tiers)

const MESSAGE_POOL: Record<MsgGroup, TextOption[]> = {
  parent: [
    g('Hey, how have you been? 😊'),
    q('What’s for dinner? 👀'),
    fv('Can you pick me up later? 🚗'),
    g('Just checking in. All good?'),
    nw('Guess what happened today!'),
    q('Are we still on for the weekend?'),
    q('Do we have any of the good snacks left?'),
    fy('Running a bit late, don’t wait up.'),
    q('Random question — what was I like as a baby?'),
    q('Can you remind me of that recipe?'),
    q('Is it okay if I bring a friend over?'),
    q('Did you see the news today?'),
    q('What time should I be home?'),
    q('Can we talk later? Nothing bad!'),
    g('Ugh, long day. How was yours?'),
    q('Any advice? I’ve got a big decision.'),
    nw('I found an old photo of us, so cute 📷'),
    q('Do you need anything from the store?'),
    fv('Reminder to take your meds! 💊'),
    q('Call you tonight?'),
    th('Thanks for always having my back. 🙏'),
    pl('We should do a family dinner soon.'),
    th('I really appreciate everything you do.'),
    th('Miss your cooking. And you.'),
    pl('Let’s plan a trip together sometime.'),
    th('You always know what to say. Thank you.'),
    th('Proud to be your kid, you know that?'),
    pl('Can I come by this weekend? Miss home.'),
    th('You raised me right. Just wanted to say it.'),
    pl('Let’s grab coffee, just the two of us.'),
    lv('Sending you a big hug today. 🤗'),
    th('Thinking of you and everything you sacrificed.'),
    lv('Love you! ❤️', MID_HIGH),
    lv('You’re my hero, always have been.', MID_HIGH),
    lv('I don’t say it enough — I love you so much.', HIGH),
    lv('You mean the world to me. ❤️', HIGH),
    lv('Couldn’t ask for a better parent. 🥹', HIGH),
    lv('Whatever happens, I’ll always be here for you.', HIGH),
    lv('You’re the strongest person I know.', MID_HIGH),
    lv('Home isn’t a place, it’s you. 🏡', HIGH),
    rc('Sorry I’ve been distant lately.'),
    rc('I know we don’t talk much, but hi.', LOW),
    rc('Been meaning to reach out. How are you?'),
  ],
  sibling: [
    g('Yo, you around? 👀'),
    fy('Mom’s looking for you btw.'),
    fy('Did you take my charger AGAIN?'),
    pl('Wanna play something later?'),
    nw('You will not believe what just happened.'),
    fv('Cover for me tonight? 🙏'),
    nw('Remember that thing from when we were kids? 😂'),
    q('Who’s picking up the parents this year?'),
    fy('I’m telling. (jk. maybe.)'),
    fv('Can I borrow like 20 bucks?'),
    pl('Movie night at yours?'),
    fv('Send me that photo from the trip lol'),
    q('What are you getting mom for her birthday?'),
    fy('You’re still the annoying one, just so we’re clear.'),
    fy('Race you to the fridge (metaphorically).'),
    nw('Big news, call me when you can!'),
    fy('Did you eat the last slice?? 🍕'),
    nw('Family group chat is chaos today lol'),
    fy('Remember you owe me forever for that one time.'),
    pl('Come out this weekend, it’ll be fun.'),
    th('You’re actually the best, don’t tell anyone.'),
    th('Thanks for having my back earlier.'),
    pl('We should hang out more, for real.'),
    th('Glad we’re close, even when we fight.'),
    th('You always get me. Appreciate you.'),
    pl('Let’s take a trip, just siblings.'),
    th('Proud of you, seriously.'),
    th('You’re gonna crush it, I believe in you.'),
    th('Thanks for the advice. You were right.'),
    th('Missing our late-night talks.'),
    th('Team us, always. 🤝'),
    th('You’re the only one who understands the family 😂'),
    lv('Love you, weirdo. ❤️', MID_HIGH),
    lv('You’re my best friend, honestly.', HIGH),
    lv('I’d do anything for you, you know that.', HIGH),
    lv('So lucky you’re my sibling. 🥹', HIGH),
    lv('Ride or die, forever. 🤞', HIGH),
    lv('No one’s got me like you do.', HIGH),
    lv('You’re half of my best memories.', MID_HIGH),
    lv('Through everything, it’s us. ❤️', HIGH),
    rc('We should talk more. It’s been weird lately.'),
    rc('Truce? I hate fighting with you.'),
    rc('I know things are tense. Still love ya though.', LOW),
  ],
  friend: [
    g('Yooo what’s up? 😄'),
    q('We still on for this weekend?'),
    nw('You’ll never guess what I just saw lol'),
    nw('Bro. BRO. Check your phone.'),
    pl('Free later? Coffee?'),
    fv('Send memes, I’m bored 😩'),
    q('How’d that thing go?'),
    g('Long time no talk! What’s new?'),
    g('You up? Can’t sleep.'),
    g('Random but I miss the old days.'),
    pl('Come to the thing on Friday, pls.'),
    q('Rate my terrible idea real quick.'),
    nw('Guess who’s in your neighborhood 👀'),
    q('Did you watch the game?? 🏀'),
    q('I need your opinion on something.'),
    pl('Lunch tomorrow? My treat.'),
    q('You free for a call? Need to vent lol'),
    nw('Throwback to that trip, best times 📸'),
    pl('New spot opened up, wanna try it?'),
    fv('Save me a seat, running late.'),
    th('Grateful for you, honestly.'),
    th('You always show up when it counts. Thanks.'),
    pl('We should hang out way more.'),
    th('Good talk earlier, needed that.'),
    th('You’re one of the real ones. 🙌'),
    pl('Let’s make plans that we actually keep this time.'),
    th('Proud of how far you’ve come.'),
    th('Thanks for listening the other night.'),
    th('You make everything more fun, you know?'),
    pl('Been too long. Let’s fix that.'),
    th('Cheering you on always, you got this.'),
    th('Glad the universe put you in my life.'),
    lv('You’re the best, I mean it. 🤝', MID_HIGH),
    lv('Love ya, man. Right back at you always.', MID_HIGH),
    lv('Best friend a person could ask for. 🥹', HIGH),
    lv('I’d drop everything for you, you know that.', HIGH),
    lv('Decades from now it’ll still be us. 🍻', HIGH),
    lv('You’re family at this point. ❤️', HIGH),
    lv('Couldn’t have gotten through it without you.', HIGH),
    lv('My person. That’s it, that’s the text.', HIGH),
    rc('Hey stranger. Been way too long.'),
    rc('I know we drifted. Thinking of you though.', LOW),
    rc('No pressure, but we should reconnect.'),
  ],
  partner: [
    g('Morning ☀️ Sleep okay?'),
    q('What do you want for dinner tonight?'),
    g('On my way home 🚗'),
    g('How’s your day going, love?'),
    q('Don’t forget we have plans tonight 😊'),
    lv('Miss you already and it’s been an hour lol', MID_HIGH),
    fv('Can you grab milk on the way back?'),
    lv('Thinking about our weekend 🥰', MID_HIGH),
    q('Text me when you’re free?'),
    nw('Guess who’s cooking tonight. (It’s me.)'),
    g('Home soon, save me some 😅'),
    th('Random check-in: you’re cute.'),
    q('What movie tonight? You pick.'),
    g('Call you on my break 💛'),
    pl('Ready for date night? 🌹'),
    th('So grateful to have you.'),
    th('You make ordinary days feel special.'),
    pl('Let’s run away together for a weekend.'),
    th('I appreciate you more than I say.'),
    th('You’re my favorite part of every day.'),
    th('Proud to be yours. 🥰'),
    lv('Can’t wait to grow old with you.', MID_HIGH),
    th('Thank you for being my calm.'),
    th('Every day with you is a good one.'),
    lv('You feel like home to me. 🏡', MID_HIGH),
    fl('Thinking about you 😘'),
    fl('Wish you were here right now 😏'),
    fl('You looked incredible today, just saying.'),
    fl('Come here, I miss you 💋'),
    fl('Counting the minutes till I see you 😍'),
    fl('You’re dangerously attractive, you know that?'),
    fl('Can’t stop smiling thinking about you 🙈'),
    fl('Hurry home, I have plans for us 😉'),
    lv('I love you, endlessly. ❤️', MID_HIGH),
    lv('You’re the love of my life. 💖', HIGH),
    lv('Forever you and me. 💍', HIGH),
    lv('I’d choose you in every lifetime.', HIGH),
    lv('You mean everything to me. ❤️', MID_HIGH),
    lv('My whole heart, that’s you. 🥹', HIGH),
    lv('Marrying you was my best decision.', HIGH),
    lv('Still can’t believe you’re mine. 💕', HIGH),
    rc('Can we talk tonight? Feels like we’ve drifted.'),
    rc('I miss us. Let’s reconnect.'),
  ],
  flingex: [
    g('Hey, been a while 👀'),
    g('You popped into my head today lol'),
    fy('Still have my hoodie btw 😂'),
    g('How’ve you been, honestly?'),
    g('Weird running into your name online.'),
    g('No agenda, just saying hi.'),
    nw('Heard your song came on, thought of you.'),
    q('Are you around this weekend?'),
    g('So… how’s life treating you?'),
    g('Can’t believe it’s been this long.'),
    q('You still doing the thing you loved?'),
    nw('Saw a movie you’d hate. Thought of you 😏'),
    g('This is random, I know. Hi.'),
    g('Long time no talk, stranger.'),
    g('You crossed my mind, so, hey.'),
    th('Hope you’re doing really well, I mean it.'),
    th('No hard feelings, just wanted to check in.'),
    th('You deserve all the good stuff, truly.'),
    th('Glad we can still be cool with each other.'),
    th('Whatever we were, I’m grateful for it.'),
    pl('Coffee sometime? Just to catch up.'),
    th('Proud of where you’ve ended up.'),
    th('You always were one of a kind.'),
    fl('Not gonna lie, I still think about you 😅'),
    fl('You looked good in that last post 🔥'),
    fl('Remember that night? I do 😏'),
    fl('Tell me you don’t miss this a little 😘'),
    fl('We were kind of electric, weren’t we?'),
    pl('One drink, for old times’ sake? 🍷'),
    fl('Still got that effect on me, apparently.'),
    fl('Come over? No strings 😉', MID_HIGH),
    fl('I’ve been thinking about us lately 🙈', MID_HIGH),
    lv('I still care about you, I always will.', MID_HIGH),
    lv('Part of me never really let go. ❤️', HIGH),
    lv('You were the one that got away, weren’t you.', HIGH),
    lv('Maybe we gave up too easily.', MID_HIGH),
    lv('I regret how we ended. Truly.', MID_HIGH),
    lv('If timing were different… you and me.', HIGH),
    rc('I know it ended badly. Hope you’re okay though.', LOW),
    rc('No drama, promise. Just wishing you well.'),
    rc('We don’t have to talk. But I’m here if you want.', LOW),
    rc('Clean slate? I’d like us to be okay.'),
  ],
  enemy: [
    opt('rude', 'You’re the actual worst. 😒'),
    opt('rude', 'This isn’t over.'),
    opt('rude', 'Everyone agrees with me, by the way.'),
    opt('rude', 'Lose my number. Permanently.'),
    opt('rude', 'Funny how things worked out for me, not you. 😏'),
    opt('rude', 'I’m so done with you it’s not even anger anymore.'),
    opt('truce', 'Can we just call a truce?'),
    opt('truce', 'This feud is exhausting. Peace?'),
    opt('truce', 'Maybe we were both wrong. Start over?', MID_HIGH),
  ],
  child: [
    q('How was school today? 😊'),
    q('Did you eat something good?'),
    fv('Be home before dark, okay?'),
    th('Proud of you, kiddo.'),
    q('Need anything from the store?'),
    fv('Text me when you get there safe.'),
    q('How are your friends doing?'),
    q('Want me to pick you up?'),
    fv('Don’t stay up too late! 😴'),
    g('Call me if you need anything, ever.'),
    nw('Guess what, made your favorite for dinner 🍝'),
    q('How’d the test go? You studied so hard.'),
    th('You know I’m always in your corner, right?'),
    th('So proud of the person you’re becoming.'),
    th('You can tell me anything. Always.'),
    pl('Let’s do something fun this weekend.'),
    th('Thinking of you today. 🤗'),
    th('You make me proud every single day.'),
    lv('Love you to the moon and back. 🌙', MID_HIGH),
    lv('You’re the best thing I ever did. ❤️', MID_HIGH),
    lv('I’ll love you no matter what, forever.', HIGH),
    lv('My whole world, that’s you. 🥹', HIGH),
    rc('I know things have been hard between us.'),
    rc('Door’s always open when you’re ready to talk.', LOW),
  ],
}

/** Kid-only utility line for parents — asking for allowance, never used up. */
const ASK_ALLOWANCE: TextOption = {
  id: 'ask-money',
  label: 'Can I have some allowance? 🙏',
  tone: 'ask-money',
  consumable: false,
}

const OPTIONS_PER_YEAR = 4

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
    high: ['Fine. A truce. Don’t make me regret it.', 'I… suppose the feud is exhausting. Deal.'],
    mid: ['A truce? I’ll think about it.', 'Hah. We’re not there yet.'],
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
    const bondDelta = tone === 'truce' ? (tier === 'high' ? 4 : tier === 'mid' ? 1 : -1) : -2
    return { text, bond: bondDelta, happiness: bondDelta > 0 ? 1 : -1 }
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
  let bondDelta: number
  if (tier === 'low' && intent === 'love') {
    bondDelta = -1 // a big "I love you" to someone distant lands awkwardly
  } else {
    bondDelta = WEIGHT[intent] + (tier === 'high' ? 1 : tier === 'low' ? -1 : 0)
  }
  const happiness = bondDelta > 0 ? 1 : bondDelta < 0 ? -1 : 0
  return { text, bond: bondDelta, happiness }
}
