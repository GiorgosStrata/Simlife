import type { GameEvent } from '../types'

/**
 * Event content lives here, separate from game logic.
 * To add an event: append an object with a unique `id`, an age window,
 * and 2-3 choices. The engine picks eligible events at random each year
 * and avoids repeating one until the pool for that age is exhausted.
 */
export const EVENTS: GameEvent[] = [
  {
    id: 'stray-dog',
    title: 'A Stray Dog',
    description:
      'A scruffy stray dog follows you home and sits at your door, looking up at you hopefully.',
    minAge: 6,
    maxAge: 60,
    choices: [
      {
        label: 'Adopt it',
        outcome: 'You adopted the stray dog and named it Biscuit. Walks are expensive but joyful.',
        effects: { happiness: 12, money: -300 },
      },
      {
        label: 'Shoo it away',
        outcome: 'You shooed the dog away. Its sad eyes haunt you a little.',
        effects: { happiness: -6 },
      },
      {
        label: 'Take it to a shelter',
        outcome: 'You brought the dog to a shelter. The staff thanked you warmly.',
        effects: { happiness: 4 },
      },
    ],
  },
  {
    id: 'school-talent-show',
    title: 'School Talent Show',
    description:
      'Your school is holding a talent show. Sign-ups close today and your friends are daring you to enter.',
    minAge: 7,
    maxAge: 17,
    choices: [
      {
        label: 'Perform a song',
        outcome: 'You sang your heart out. Half the crowd cheered, the other half filmed it.',
        effects: { happiness: 10, looks: 3 },
      },
      {
        label: 'Do a science demo',
        outcome: 'Your baking-soda volcano erupted spectacularly. The science teacher was thrilled.',
        effects: { smarts: 8, happiness: 4 },
      },
      {
        label: 'Stay in the audience',
        outcome: 'You watched from the safety of the crowd. Comfortable, but a little wistful.',
        effects: { happiness: -2 },
      },
    ],
  },
  {
    id: 'found-wallet',
    title: 'A Lost Wallet',
    description:
      'You spot a fat wallet on the sidewalk. There is an ID inside and quite a lot of cash.',
    minAge: 10,
    maxAge: 90,
    choices: [
      {
        label: 'Return it to the owner',
        outcome: 'You tracked down the owner, who insisted on giving you a reward.',
        effects: { happiness: 8, money: 100 },
      },
      {
        label: 'Keep the cash',
        outcome: 'You pocketed the cash. It spends fine, but the guilt lingers.',
        effects: { money: 500, happiness: -8 },
      },
      {
        label: 'Hand it to the police',
        outcome: 'You dropped the wallet at the police station and walked out feeling lighter.',
        effects: { happiness: 5 },
      },
    ],
  },
  {
    id: 'gym-membership',
    title: 'New Year, New You?',
    description:
      'A flashy gym near your home is offering a discounted yearly membership. The trainer swears by results.',
    minAge: 16,
    maxAge: 75,
    choices: [
      {
        label: 'Sign up and commit',
        outcome: 'You actually went. Three times a week. You feel unstoppable.',
        effects: { health: 12, looks: 8, money: -400, happiness: 3 },
      },
      {
        label: 'Jog outside for free',
        outcome: 'You started jogging in the park. Free, fresh air, occasional rain.',
        effects: { health: 7, happiness: 4 },
      },
      {
        label: 'Skip it',
        outcome: 'You decided the couch needed you more.',
        effects: { health: -4, happiness: 2 },
      },
    ],
  },
  {
    id: 'exam-week',
    title: 'Exam Week',
    description:
      'A brutal exam week is coming up. Your notes are a mess and a friend is hosting a party the night before.',
    minAge: 12,
    maxAge: 24,
    choices: [
      {
        label: 'Study all week',
        outcome: 'You buried yourself in books and aced the exams. Worth it. Probably.',
        effects: { smarts: 10, happiness: -3 },
      },
      {
        label: 'Balance study and the party',
        outcome: 'You studied hard, partied briefly, and passed with respectable marks.',
        effects: { smarts: 5, happiness: 5 },
      },
      {
        label: 'Party. Definitely the party',
        outcome: 'The party was legendary. The exam results were not.',
        effects: { happiness: 8, smarts: -6 },
      },
    ],
  },
  {
    id: 'job-offer',
    title: 'A Job Offer',
    description:
      'A recruiter offers you a well-paid corporate job with long hours, just as a friend invites you to join their scrappy startup.',
    minAge: 20,
    maxAge: 55,
    choices: [
      {
        label: 'Take the corporate job',
        outcome: 'You took the corporate job. The pay is great; the meetings are eternal.',
        effects: { money: 2500, happiness: -4, smarts: 3 },
      },
      {
        label: 'Join the startup',
        outcome: 'You joined the startup. Low pay, free snacks, and you learn something new daily.',
        effects: { money: 800, happiness: 6, smarts: 8 },
      },
      {
        label: 'Decline both',
        outcome: 'You held out for something better. Freedom is nice, rent is due.',
        effects: { money: -300, happiness: 2 },
      },
    ],
  },
  {
    id: 'street-food',
    title: 'Mystery Street Food',
    description:
      'A street vendor is selling something delicious-smelling that you cannot identify. The line is suspiciously short.',
    minAge: 8,
    maxAge: 90,
    choices: [
      {
        label: 'Try it',
        outcome: 'It was incredible. Your stomach filed a brief complaint, then agreed.',
        effects: { happiness: 7, health: -3, money: -10 },
      },
      {
        label: 'Pass',
        outcome: 'You walked on by. Some mysteries are better left unsolved.',
        effects: {},
      },
    ],
  },
  {
    id: 'lottery-ticket',
    title: 'Feeling Lucky?',
    description:
      'The corner shop jackpot has rolled over three times. A ticket costs almost nothing. Almost.',
    minAge: 18,
    maxAge: 90,
    choices: [
      {
        label: 'Buy one ticket',
        outcome: 'You won a small prize! Not the jackpot, but drinks are on you.',
        effects: { money: 150, happiness: 5 },
      },
      {
        label: 'Buy ten tickets',
        outcome: 'All ten tickets lost. The shop owner offered a sympathetic nod.',
        effects: { money: -100, happiness: -4 },
      },
      {
        label: 'Save your money',
        outcome: 'You kept your money. The jackpot was won by someone else, somewhere, probably.',
        effects: { smarts: 2 },
      },
    ],
  },
  {
    id: 'old-friend',
    title: 'A Familiar Face',
    description:
      'An old friend you lost touch with years ago messages you out of the blue, asking to catch up.',
    minAge: 25,
    maxAge: 90,
    choices: [
      {
        label: 'Meet for coffee',
        outcome: 'You talked for hours. It felt like no time had passed at all.',
        effects: { happiness: 10 },
      },
      {
        label: 'Politely decline',
        outcome: 'You said you were busy. You were not busy.',
        effects: { happiness: -5 },
      },
    ],
  },
  {
    id: 'health-checkup',
    title: 'Routine Checkup',
    description:
      'Your annual health checkup is due. The clinic has an opening this week, but so does your favorite show.',
    minAge: 30,
    maxAge: 90,
    choices: [
      {
        label: 'Go to the checkup',
        outcome: 'The doctor caught a small issue early and sorted it out. Crisis averted.',
        effects: { health: 8, money: -150 },
      },
      {
        label: 'Skip it this year',
        outcome: 'You skipped the checkup. You feel fine. You think you feel fine.',
        effects: { health: -6, happiness: 2 },
      },
    ],
  },
  {
    id: 'night-classes',
    title: 'Night Classes',
    description:
      'The local community center is offering evening classes: painting, coding, or conversational Italian.',
    minAge: 18,
    maxAge: 80,
    choices: [
      {
        label: 'Learn to code',
        outcome: 'You built your first little app. It mostly works, and you are very proud.',
        effects: { smarts: 9, money: -120, happiness: 3 },
      },
      {
        label: 'Take up painting',
        outcome: 'Your still-life of a bowl of fruit is now framed in your hallway.',
        effects: { happiness: 8, money: -120 },
      },
      {
        label: 'Learn Italian',
        outcome: 'Parli italiano adesso! Well, enough to order dinner confidently.',
        effects: { smarts: 6, happiness: 4, money: -120 },
      },
    ],
  },
  {
    id: 'grandparent-story',
    title: 'Grandpa’s Stories',
    description:
      'Your grandfather wants to tell you the full, unabridged story of his youth. Again. It takes hours.',
    minAge: 5,
    maxAge: 15,
    choices: [
      {
        label: 'Listen closely',
        outcome: 'The story was different this time — and full of surprisingly good advice.',
        effects: { smarts: 5, happiness: 6 },
      },
      {
        label: 'Sneak away to play',
        outcome: 'You snuck out the back door. The neighborhood game of tag was fierce.',
        effects: { health: 3, happiness: 4, smarts: -2 },
      },
    ],
  },
]
