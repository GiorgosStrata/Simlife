import type { GameEvent } from '../types'

/**
 * Event content lives here, separate from game logic.
 * To add an event: append an object with a unique `id`, an age window,
 * and 2-3 choices. The engine picks eligible events at random each year
 * and never repeats one within the same life — once the fresh pool for an
 * age is used up, some years simply pass without a random event.
 */
export const EVENTS: GameEvent[] = [
  {
    id: 'stray-dog',
    emoji: '🐕',
    title: 'A Stray Dog',
    description:
      'A scruffy stray dog follows you home and sits at your door, looking up at you hopefully.',
    minAge: 6,
    maxAge: 60,
    choices: [
      {
        label: 'Adopt it',
        outcome: 'You adopted the stray dog. Walks are expensive but joyful.',
        effects: { happiness: 10 },
        grantsPet: 'Dog',
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
    emoji: '🎤',
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
    emoji: '👛',
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
    emoji: '🏋️',
    title: 'New Year, New You?',
    description:
      'A flashy gym near your home is offering a discounted yearly membership. The trainer swears by results.',
    minAge: 16,
    maxAge: 75,
    choices: [
      {
        label: 'Sign up and commit',
        outcome: 'You actually went. Three times a week. You feel unstoppable.',
        effects: { health: 6, looks: 4, money: -400, happiness: 3 },
        startsActivity: 'gym',
      },
      {
        label: 'Jog outside for free',
        outcome: 'You started jogging in the park. Free, fresh air, occasional rain.',
        effects: { health: 4, happiness: 4 },
        startsActivity: 'running',
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
    emoji: '📝',
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
    id: 'street-food',
    emoji: '🌭',
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
    emoji: '🎟️',
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
    emoji: '👋',
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
        grantsFriend: true,
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
    emoji: '🩺',
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
    emoji: '🎨',
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
    id: 'first-bicycle',
    emoji: '🚲',
    title: 'Two Wheels of Freedom',
    description:
      'Your parents offer to teach you to ride a bike without training wheels. The driveway looks very long and very hard.',
    minAge: 5,
    maxAge: 10,
    choices: [
      {
        label: 'Pedal fearlessly',
        outcome: 'You wobbled, you crashed, you got up — and then you flew. Scraped knees, huge grin.',
        effects: { happiness: 9, health: -2 },
      },
      {
        label: 'Keep the training wheels',
        outcome: 'You kept the training wheels another year. Stability has its charms.',
        effects: { happiness: 2 },
      },
    ],
  },
  {
    id: 'school-bully',
    emoji: '😠',
    title: 'The Bully',
    description:
      'A kid at school keeps knocking your books out of your hands. Today they did it in front of everyone.',
    minAge: 7,
    maxAge: 15,
    choices: [
      {
        label: 'Stand up to them',
        outcome: 'You looked them in the eye and told them to stop. To everyone’s surprise, they did.',
        effects: { happiness: 8, smarts: 2 },
      },
      {
        label: 'Tell a teacher',
        outcome: 'The teacher handled it quietly. The bullying stopped, mostly.',
        effects: { happiness: 4, smarts: 3 },
      },
      {
        label: 'Ignore it',
        outcome: 'You kept your head down. The books kept falling.',
        effects: { happiness: -6 },
      },
    ],
  },
  {
    id: 'summer-camp',
    emoji: '🏕️',
    title: 'Summer Camp',
    description:
      'You’re off to summer camp for two weeks. On day one, the counselors ask everyone to pick a specialty.',
    minAge: 8,
    maxAge: 14,
    choices: [
      {
        label: 'Wilderness survival',
        outcome: 'You can now build a fire and identify three edible berries. You feel invincible.',
        effects: { health: 5, smarts: 4, happiness: 4 },
      },
      {
        label: 'Arts and crafts',
        outcome: 'You made a lopsided clay bowl for your mother. She displays it proudly.',
        effects: { happiness: 7 },
      },
      {
        label: 'Competitive kickball',
        outcome: 'Your team won the camp championship. You were carried off the field. Briefly.',
        effects: { health: 6, happiness: 5 },
      },
    ],
  },
  {
    id: 'garage-band',
    emoji: '🎸',
    title: 'Garage Band',
    description:
      'Your friends are starting a band in someone’s garage. They need one more member and they’re looking at you.',
    minAge: 14,
    maxAge: 22,
    choices: [
      {
        label: 'Join on guitar',
        outcome: 'The band is terrible and it is the best thing in your life right now. You’re a guitarist now.',
        effects: { happiness: 8, money: -200 },
        startsActivity: 'guitar',
        grantsFriend: true,
      },
      {
        label: 'Offer to be the manager',
        outcome: 'You booked the band two gigs and took ten percent. Business is business.',
        effects: { smarts: 5, money: 100 },
      },
      {
        label: 'Politely decline',
        outcome: 'You passed. Their first single was... actually kind of good?',
        effects: { happiness: -3 },
      },
    ],
  },
  {
    id: 'road-trip',
    emoji: '🚐',
    title: 'The Road Trip',
    description:
      'Friends are planning a week-long road trip along the coast. It leaves in two days and the car smells like fries.',
    minAge: 18,
    maxAge: 40,
    choices: [
      {
        label: 'Call shotgun',
        outcome: 'Seven days, four flat tires, one perfect sunset. Worth every penny.',
        effects: { happiness: 12, money: -400 },
      },
      {
        label: 'Stay home and save',
        outcome: 'You stayed behind. The group chat photos stung a little.',
        effects: { money: 200, happiness: -4 },
      },
    ],
  },
  {
    id: 'overtime-request',
    emoji: '💼',
    title: 'Crunch Time',
    description:
      'Things are hectic at work and you’re asked to put in serious overtime this month. It would not go unnoticed.',
    minAge: 20,
    maxAge: 60,
    requires: ['hasJob'],
    choices: [
      {
        label: 'Work the overtime',
        outcome: 'A brutal month, but the bonus landed and so did some goodwill upstairs.',
        effects: { money: 1500, health: -4, happiness: -3 },
      },
      {
        label: 'Protect your evenings',
        outcome: 'You said no politely. Your plants, and your sleep schedule, thanked you.',
        effects: { happiness: 5 },
      },
    ],
  },
  {
    id: 'neighbor-dispute',
    emoji: '🌳',
    title: 'The Hedge War',
    description:
      'Your neighbor’s hedge has crossed the property line and is slowly consuming your garden. Diplomacy has failed.',
    minAge: 25,
    maxAge: 75,
    choices: [
      {
        label: 'Trim it yourself at dawn',
        outcome: 'You pruned the invader at 6am. The neighbor now waters their lawn while maintaining eye contact.',
        effects: { happiness: 4 },
      },
      {
        label: 'Bake a peace offering',
        outcome: 'Banana bread fixed in one afternoon what three years of glaring could not.',
        effects: { happiness: 8, money: -20 },
      },
      {
        label: 'Call the city',
        outcome: 'The city sent a letter. The hedge retreated. The cold war continues.',
        effects: { happiness: -2, smarts: 2 },
      },
    ],
  },
  {
    id: 'charity-drive',
    emoji: '🎗️',
    title: 'A Good Cause',
    description:
      'A local charity is raising money to fix up the community playground. A volunteer is at your door with a clipboard.',
    minAge: 20,
    maxAge: 85,
    choices: [
      {
        label: 'Donate generously',
        outcome: 'You gave more than you planned to. The new slide has a plaque with your name on it.',
        effects: { money: -500, happiness: 10 },
      },
      {
        label: 'Volunteer your weekend',
        outcome: 'You spent Saturday painting monkey bars. Your back hurts. Your heart doesn’t.',
        effects: { happiness: 8, health: -2 },
      },
      {
        label: 'Not this time',
        outcome: 'You wished them luck and closed the door gently.',
        effects: {},
      },
    ],
  },
  {
    id: 'cooking-disaster',
    emoji: '🍳',
    title: 'Chef’s Special',
    description:
      'You attempt an ambitious new recipe for guests arriving in one hour. The kitchen is starting to smoke. Slightly.',
    minAge: 16,
    maxAge: 90,
    choices: [
      {
        label: 'Push through and serve it',
        outcome: 'The crust was carbon, the middle was raw, and everyone asked for seconds out of love.',
        effects: { happiness: 6, health: -2 },
      },
      {
        label: 'Order takeout, plate it nicely',
        outcome: 'Nobody suspected a thing. One guest asked for the recipe. You winked.',
        effects: { money: -60, happiness: 7 },
      },
    ],
  },
  {
    id: 'retirement-hobby',
    emoji: '🌷',
    title: 'New Horizons',
    description:
      'With more free time on your hands these days, you’ve been thinking about finally picking up something new.',
    minAge: 60,
    maxAge: 90,
    choices: [
      {
        label: 'Competitive gardening',
        outcome: 'Your tomatoes took second place at the county fair. Next year, gold.',
        effects: { happiness: 5 },
        startsActivity: 'gardening',
      },
      {
        label: 'Take up painting',
        outcome: 'You’re no Picasso, but the canvas is patient and so are you.',
        effects: { happiness: 4, money: -200 },
        startsActivity: 'painting',
      },
      {
        label: 'Master chess at the park',
        outcome: 'The park regulars stopped going easy on you. You consider this a great honor.',
        effects: { smarts: 4, happiness: 4 },
        startsActivity: 'chess',
      },
    ],
  },
  {
    id: 'sleepover',
    emoji: '🛌',
    title: 'Sleepover!',
    description:
      'Your best friend invites you to a sleepover. Their parents have promised pizza and exactly one scary movie.',
    minAge: 6,
    maxAge: 13,
    choices: [
      {
        label: 'Go and stay up all night',
        outcome: 'You watched the scary movie through your fingers and laughed until 3am.',
        effects: { happiness: 10, health: -2 },
      },
      {
        label: 'Go but sleep at a reasonable hour',
        outcome: 'You fell asleep first. You woke up with a mustache drawn on your face.',
        effects: { happiness: 6 },
      },
      {
        label: 'Stay home',
        outcome: 'You stayed home. The group chat was very loud the next morning.',
        effects: { happiness: -4 },
      },
    ],
  },
  {
    id: 'new-kid',
    emoji: '🧑',
    title: 'The New Kid',
    description:
      'A new kid joins your class mid-year. At lunch, they’re sitting alone, poking at a sandwich.',
    minAge: 6,
    maxAge: 17,
    choices: [
      {
        label: 'Sit with them',
        outcome: 'You sat down and said hi. Turns out you like all the same things. Instant friend.',
        effects: { happiness: 8 },
        grantsFriend: true,
      },
      {
        label: 'Wave from across the room',
        outcome: 'You waved. They waved back. A solid foundation, probably.',
        effects: { happiness: 2 },
      },
      {
        label: 'Mind your own lunch',
        outcome: 'You focused on your fries. Somebody else made the first move.',
        effects: {},
      },
    ],
  },
  {
    id: 'group-project',
    emoji: '📊',
    title: 'The Group Project',
    description:
      'You’ve been assigned a big group project. One teammate has vanished and the deadline is Friday.',
    minAge: 10,
    maxAge: 17,
    choices: [
      {
        label: 'Carry the whole team',
        outcome: 'You did 80% of the work. The grade was great. Your soul aged slightly.',
        effects: { smarts: 7, happiness: -4 },
      },
      {
        label: 'Track down the missing teammate',
        outcome: 'You found them, split the work fairly, and finished with a day to spare.',
        effects: { smarts: 4, happiness: 4 },
      },
      {
        label: 'Let the project sink',
        outcome: 'The presentation was four blank slides. The teacher was not amused.',
        effects: { smarts: -5, happiness: -3 },
      },
    ],
  },
  {
    id: 'first-crush',
    emoji: '💘',
    title: 'The Crush',
    description:
      'You have a crush on someone in your class, and your friends have noticed. They are being extremely unsubtle about it.',
    minAge: 11,
    maxAge: 17,
    choices: [
      {
        label: 'Tell them how you feel',
        outcome: 'You said it. They smiled. You floated home three feet off the ground.',
        effects: { happiness: 10 },
      },
      {
        label: 'Write a note and chicken out',
        outcome: 'The note lives in your pocket forever. The mystery remains.',
        effects: { happiness: -2, smarts: 1 },
      },
      {
        label: 'Deny everything',
        outcome: 'You denied it so hard that everyone became more convinced.',
        effects: { happiness: -3 },
      },
    ],
  },
  {
    id: 'video-game-marathon',
    emoji: '🎮',
    title: 'One More Level',
    description:
      'A friend lends you the game everyone is talking about. It is 11pm on a school night and you just reached a save point.',
    minAge: 9,
    maxAge: 18,
    choices: [
      {
        label: 'Play until sunrise',
        outcome: 'You beat the game. School the next day happened to someone else entirely.',
        effects: { happiness: 8, health: -3, smarts: -2 },
      },
      {
        label: 'Save and sleep',
        outcome: 'You went to bed like a responsible person. The final boss can wait.',
        effects: { happiness: 3, health: 1 },
      },
    ],
  },
  {
    id: 'friend-moving-away',
    emoji: '📦',
    title: 'Moving Trucks',
    description:
      'One of your closest friends tells you their family is moving to another city next month.',
    minAge: 7,
    maxAge: 20,
    choices: [
      {
        label: 'Plan one last epic day together',
        outcome: 'You packed a whole summer into one day. You promised to call every week.',
        effects: { happiness: 6 },
      },
      {
        label: 'Help them pack',
        outcome: 'You packed boxes and told old stories. Somehow it made it easier.',
        effects: { happiness: 4 },
      },
      {
        label: 'Avoid the goodbye',
        outcome: 'You never said goodbye. The empty house on the corner stares at you.',
        effects: { happiness: -8 },
      },
    ],
  },
  {
    id: 'prom-night',
    emoji: '🕺',
    title: 'Prom Night',
    description:
      'Prom is coming up. Tickets are pricey, the dress code is strict, and everyone is talking about it.',
    minAge: 16,
    maxAge: 18,
    choices: [
      {
        label: 'Go all out',
        outcome: 'You danced until your feet gave up. The photos are legendary.',
        effects: { happiness: 12, money: -200, looks: 2 },
      },
      {
        label: 'Go casual with friends',
        outcome: 'You went in sneakers, laughed all night, and spent almost nothing.',
        effects: { happiness: 8, money: -40 },
      },
      {
        label: 'Skip it entirely',
        outcome: 'You stayed home. The pizza was good. The FOMO was real.',
        effects: { happiness: -5, money: 0 },
      },
    ],
  },
  {
    id: 'surprise-party',
    emoji: '🎉',
    title: 'Surprise!',
    description:
      'Your friends are throwing a surprise party for someone you all know — and you’ve been put in charge of the cake.',
    minAge: 15,
    maxAge: 70,
    choices: [
      {
        label: 'Bake it yourself',
        outcome: 'The cake leaned like a tower in Italy, and everyone loved it.',
        effects: { happiness: 8, money: -30 },
      },
      {
        label: 'Buy the fanciest one in town',
        outcome: 'The bakery cake was flawless. Your wallet is lighter, your conscience heavier.',
        effects: { happiness: 5, money: -120 },
      },
      {
        label: 'Forget until the last minute',
        outcome: 'You arrived with a supermarket muffin and a candle. It became the stuff of legend.',
        effects: { happiness: 3, money: -5 },
      },
    ],
  },
  {
    id: 'friend-in-trouble',
    emoji: '🆘',
    title: 'A Friend in Need',
    description:
      'A good friend calls you late at night. They’re in a rough patch and ask to borrow some money.',
    minAge: 18,
    maxAge: 80,
    choices: [
      {
        label: 'Lend it, no questions',
        outcome: 'You sent the money. They paid you back in gratitude, if not in cash.',
        effects: { money: -300, happiness: 6 },
      },
      {
        label: 'Offer help instead of cash',
        outcome: 'You spent the weekend helping them sort things out properly.',
        effects: { happiness: 5, health: -1 },
      },
      {
        label: 'Say no',
        outcome: 'You said you couldn’t. The calls got shorter after that.',
        effects: { happiness: -6 },
      },
    ],
  },
  {
    id: 'reunion',
    emoji: '🎓',
    title: 'The Reunion',
    description:
      'An invitation arrives: your old school class is having a reunion. Everyone will be there. Everyone.',
    minAge: 28,
    maxAge: 80,
    choices: [
      {
        label: 'Attend and mingle',
        outcome: 'Old jokes, older stories, and one teacher who still remembers your name.',
        effects: { happiness: 9, money: -50 },
        grantsFriend: true,
      },
      {
        label: 'Attend, but hover by the snacks',
        outcome: 'You held a plate of tiny sandwiches like a shield. Two people found you anyway. It was nice.',
        effects: { happiness: 4, money: -50 },
      },
      {
        label: 'Toss the invitation',
        outcome: 'You skipped it. The photo album online was full of faces you almost remembered.',
        effects: { happiness: -3 },
      },
    ],
  },
  {
    id: 'grandparent-story',
    emoji: '👴',
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

  // ----- Edgier / BitLife-style random events -----
  {
    id: 'schoolyard-bully',
    emoji: '👊',
    title: 'The Bully Wants a Fight',
    description:
      'The school bully corners you at recess, shoves you into the lockers, and dares you to do something about it.',
    minAge: 7,
    maxAge: 17,
    choices: [
      {
        label: 'Fight back',
        outcome: 'You swung back. You both got detention, but the shoving stopped for good.',
        effects: { happiness: 6, health: -6, looks: -2 },
        sfx: 'punch',
      },
      {
        label: 'Walk away',
        outcome: 'You kept your cool and walked off. It stung, but you kept your teeth.',
        effects: { happiness: -5, smarts: 2 },
      },
      {
        label: 'Report them',
        outcome: 'You told the principal. The bully got suspended and now glares at you in the hall.',
        effects: { happiness: 2 },
      },
    ],
  },
  {
    id: 'drug-dealer',
    emoji: '💊',
    title: 'A Shady Offer',
    description:
      'A guy in a hoodie sidles up to you behind the corner store. "First one’s free," he grins, holding out a little baggie.',
    minAge: 14,
    maxAge: 40,
    choices: [
      {
        label: 'Say no thanks',
        outcome: 'You said no and walked off fast. Some doors are better left unopened.',
        effects: { smarts: 3, happiness: 1 },
      },
      {
        label: 'Take it',
        outcome: 'You took the baggie. The high was brief; the regret, less so.',
        effects: { happiness: 5, health: -12, smarts: -4 },
      },
      {
        label: 'Report him to the cops',
        outcome: 'You tipped off the police. The corner’s quieter now. You feel weirdly proud.',
        effects: { happiness: 4, smarts: 2 },
      },
    ],
  },
  {
    id: 'mugged',
    emoji: '🔪',
    title: 'Mugged!',
    description:
      'A stranger steps out of an alley and demands your wallet and phone. They might be bluffing. Might.',
    minAge: 14,
    maxAge: 80,
    choices: [
      {
        label: 'Hand it over',
        outcome: 'You gave them your stuff. Shaken, but unhurt. Replaceable things are replaceable.',
        effects: { money: -400, happiness: -8 },
      },
      {
        label: 'Fight for it',
        outcome: 'You resisted. You kept your wallet but earned a black eye and a limp.',
        effects: { health: -15, looks: -4, happiness: -3 },
      },
      {
        label: 'Run',
        outcome: 'You sprinted away and lost them around a corner. Cardio pays off.',
        effects: { health: -2, happiness: -2 },
      },
    ],
  },
  {
    id: 'schoolyard-rumor',
    emoji: '🗣️',
    title: 'A Nasty Rumor',
    description:
      'Someone started a wild rumor about you and the whole school is whispering. It is completely made up. Mostly.',
    minAge: 11,
    maxAge: 18,
    choices: [
      {
        label: 'Laugh it off',
        outcome: 'You leaned into the joke and it fizzled out by Friday. Legend behaviour.',
        effects: { happiness: 4, looks: 2 },
      },
      {
        label: 'Confront the source',
        outcome: 'You found who started it and set the record straight. Loudly.',
        effects: { happiness: -2, smarts: 1 },
      },
    ],
  },
  {
    id: 'viral-video',
    emoji: '📱',
    title: 'You Went Viral',
    description:
      'A clip of you doing something ridiculous blew up online overnight. Millions of views. Your name is trending.',
    minAge: 13,
    maxAge: 50,
    choices: [
      {
        label: 'Lean into the fame',
        outcome: 'You posted a follow-up and gained a following. Brand deals, baby.',
        effects: { happiness: 10, looks: 4, money: 500 },
        opens: 'social',
      },
      {
        label: 'Delete everything',
        outcome: 'You went dark and waited for the internet to forget. It did, eventually.',
        effects: { happiness: -3, smarts: 2 },
      },
    ],
  },
  {
    id: 'jury-duty',
    emoji: '⚖️',
    title: 'Jury Duty',
    description:
      'A letter summons you to jury duty. The trial could last weeks and your boss is already sighing.',
    minAge: 21,
    maxAge: 75,
    choices: [
      {
        label: 'Serve your civic duty',
        outcome: 'You sat through a long trial and helped deliver a fair verdict. Democracy!',
        effects: { smarts: 4, happiness: 2, money: -100 },
      },
      {
        label: 'Try to get out of it',
        outcome: 'You mumbled something biased and got dismissed in ten minutes. Back to work.',
        effects: { happiness: 3, smarts: -1 },
      },
    ],
  },
  {
    id: 'speeding-ticket',
    emoji: '🚓',
    title: 'Pulled Over',
    description:
      'Flashing lights fill your mirror. You were definitely speeding. The officer strolls up to your window.',
    minAge: 18,
    maxAge: 85,
    choices: [
      {
        label: 'Apologize politely',
        outcome: 'You were courteous and got off with a warning. Charm: 1, Fine: 0.',
        effects: { happiness: 3 },
      },
      {
        label: 'Argue with the cop',
        outcome: 'You argued. The ticket got bigger and so did your blood pressure.',
        effects: { money: -300, happiness: -6 },
      },
    ],
  },

  // ----- Illnesses -----
  {
    id: 'the-flu',
    emoji: '🤒',
    title: 'Down With the Flu',
    description:
      'You wake up aching, feverish, and miserable. The flu has you flat on your back.',
    minAge: 3,
    maxAge: 95,
    choices: [
      {
        label: 'See a doctor',
        outcome: 'The doctor sorted you out with meds and rest. Back on your feet in a week.',
        effects: { health: 4, money: -120 },
      },
      {
        label: 'Tough it out',
        outcome: 'You rode it out under a blanket fort of tissues. It took a while.',
        effects: { health: -8, happiness: -4 },
      },
    ],
  },
  {
    id: 'food-poisoning',
    emoji: '🤢',
    title: 'Food Poisoning',
    description:
      'That gas-station sushi was a mistake. A catastrophic, all-night, bathroom-floor mistake.',
    minAge: 5,
    maxAge: 95,
    choices: [
      {
        label: 'Rest and hydrate',
        outcome: 'You survived on flat soda and crackers. Never again. (Until next time.)',
        effects: { health: -5, happiness: -3 },
      },
      {
        label: 'Go to the ER',
        outcome: 'The ER hooked you up to an IV and you bounced back fast.',
        effects: { health: 2, money: -600 },
      },
    ],
  },
  {
    id: 'broken-arm',
    emoji: '🦴',
    title: 'A Nasty Fall',
    description:
      'You took a bad tumble and heard a sickening crack. Your arm is bent at a very wrong angle.',
    minAge: 4,
    maxAge: 90,
    choices: [
      {
        label: 'Get it set at the hospital',
        outcome: 'A cast, a sling, and six weeks of signatures later, you healed up fine.',
        effects: { health: -6, money: -500 },
      },
      {
        label: 'Just wrap it and hope',
        outcome: 'You wrapped it in a tea towel. It... mostly healed. Mostly.',
        effects: { health: -14, looks: -2 },
      },
    ],
  },
  {
    id: 'appendicitis',
    emoji: '🏥',
    title: 'Sudden Sharp Pain',
    description:
      'A stabbing pain in your side drops you to your knees. This is not a stomach ache — this is serious.',
    minAge: 8,
    maxAge: 80,
    choices: [
      {
        label: 'Rush to surgery',
        outcome: 'It was your appendix, about to burst. The surgeons got it just in time. 😮‍💨',
        effects: { health: -10, money: -3000, happiness: -4 },
      },
      {
        label: 'Wait and see',
        outcome: 'You waited too long. It burst. A grim week in intensive care followed.',
        effects: { health: -30, money: -6000, happiness: -10 },
      },
    ],
  },

  // ---------------- Childhood ----------------
  {
    id: 'lost-tooth',
    emoji: '🦷',
    title: 'A Wobbly Tooth',
    description: 'Your front tooth is hanging on by a thread. The tooth fairy is rumored to pay well.',
    minAge: 5,
    maxAge: 9,
    choices: [
      { label: 'Yank it out', outcome: 'One brave tug and it was out! You left it under your pillow.', effects: { happiness: 5, money: 5 } },
      { label: 'Leave it be', outcome: 'You left it alone and wiggled it for weeks. It eventually fell out mid-lunch.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'lemonade-stand',
    emoji: '🍋',
    title: 'Lemonade Stand',
    description: 'You set up a lemonade stand on the corner. Business is... slow.',
    minAge: 6,
    maxAge: 11,
    choices: [
      { label: 'Undercut the competition', outcome: 'You dropped your prices and cleaned up. Tiny tycoon energy.', effects: { happiness: 5, smarts: 2, money: 30 }, sfx: 'cash' },
      { label: 'Give it away for free', outcome: 'You gave lemonade to everyone. Broke, but beloved on the block.', effects: { happiness: 8, money: -5 } },
    ],
  },
  {
    id: 'spelling-bee',
    emoji: '🐝',
    title: 'The Spelling Bee',
    description: 'You made it to the final round of the school spelling bee. The word is "conscientious".',
    minAge: 7,
    maxAge: 12,
    choices: [
      { label: 'Sound it out carefully', outcome: 'C-O-N-S-C-I-E-N-T-I-O-U-S. You nailed it and took the trophy!', effects: { smarts: 6, happiness: 8 }, sfx: 'success' },
      { label: 'Panic and guess', outcome: 'You blanked and threw in an extra "shus". So close.', effects: { happiness: -4, smarts: 1 } },
    ],
  },
  {
    id: 'imaginary-friend',
    emoji: '👻',
    title: 'An Imaginary Friend',
    description: 'You have invented an imaginary friend named Mr. Wobbles who lives in the closet.',
    minAge: 4,
    maxAge: 8,
    choices: [
      { label: 'Play together all day', outcome: 'You and Mr. Wobbles had grand adventures. Your imagination soared.', effects: { happiness: 6, smarts: 2 } },
      { label: 'Tell everyone about him', outcome: 'You told the whole class. They found it a bit odd.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'class-pet',
    emoji: '🐹',
    title: 'Class Pet Duty',
    description: 'The teacher picks you to take the class hamster home for the weekend.',
    minAge: 6,
    maxAge: 11,
    choices: [
      { label: 'Take great care of it', outcome: 'You returned the hamster happy and healthy. The teacher was impressed.', effects: { happiness: 5, smarts: 1 } },
      { label: 'Forget to feed it', outcome: 'You forgot about it until Sunday night. It survived, barely, and so did your reputation.', effects: { happiness: -3 } },
    ],
  },

  // ---------------- Teen ----------------
  {
    id: 'first-crush-2',
    emoji: '💌',
    title: 'A First Crush',
    description: 'There is someone in your class you cannot stop thinking about.',
    minAge: 12,
    maxAge: 17,
    choices: [
      { label: 'Tell them how you feel', outcome: 'You confessed your feelings. Terrifying — but they smiled back.', effects: { happiness: 8, looks: 1 } },
      { label: 'Say nothing', outcome: 'You said nothing and admired from afar. The longing was exquisite and awful.', effects: { happiness: -3 } },
    ],
  },
  {
    id: 'learn-to-drive',
    emoji: '🚗',
    title: 'Learning to Drive',
    description: 'Time to get behind the wheel for your first proper driving lesson.',
    minAge: 16,
    maxAge: 18,
    choices: [
      { label: 'Take it slow and steady', outcome: 'You drove carefully and passed your test first try. Freedom!', effects: { happiness: 8, smarts: 2 }, sfx: 'success' },
      { label: 'Floor it', outcome: 'You mistook the gas for the brake and flattened a mailbox. Lesson over.', effects: { happiness: -4, money: -200 }, sfx: 'hurt' },
    ],
  },
  {
    id: 'sneak-out',
    emoji: '🪟',
    title: 'Sneaking Out',
    description: 'Your friends are all going out tonight, but you are grounded. The window is right there.',
    minAge: 14,
    maxAge: 17,
    choices: [
      { label: 'Sneak out the window', outcome: 'You had a legendary night — and got caught climbing back in at 3am.', effects: { happiness: 5, health: -2 } },
      { label: 'Stay home', outcome: 'You stayed in and scrolled your phone. FOMO gnawed at you.', effects: { happiness: -3, smarts: 1 } },
    ],
  },
  {
    id: 'science-fair',
    emoji: '🧪',
    title: 'The Science Fair',
    description: 'The annual science fair is here. You could build something great — or wing it.',
    minAge: 11,
    maxAge: 18,
    choices: [
      { label: 'Build a real project', outcome: 'Your volcano actually erupted on cue. Blue ribbon, baby!', effects: { smarts: 6, happiness: 6 }, sfx: 'success' },
      { label: 'Throw it together last minute', outcome: 'Your "project" was three rocks on cardboard. The judges moved on quickly.', effects: { smarts: 1, happiness: -2 } },
    ],
  },
  {
    id: 'social-challenge',
    emoji: '📱',
    title: 'A Viral Challenge',
    description: 'Everyone online is doing a risky new challenge. Your friends dare you to try it.',
    minAge: 13,
    maxAge: 20,
    choices: [
      { label: 'Do it for the clout', outcome: 'It went viral! Fifteen minutes of fame — and a mild concussion.', effects: { happiness: 6, health: -6, looks: 1 }, opens: 'social' },
      { label: 'Refuse', outcome: 'You sat this one out. Sensible, if a little boring.', effects: { smarts: 2 } },
    ],
  },
  {
    id: 'part-time-job',
    emoji: '🍔',
    title: 'A Part-Time Job',
    description: 'The local burger joint is hiring weekend staff. Extra pocket money is tempting.',
    minAge: 15,
    maxAge: 19,
    choices: [
      { label: 'Take the job', outcome: 'You flipped burgers all summer. Tiring, but the paychecks felt great.', effects: { happiness: 2, money: 800, health: -2 }, sfx: 'cash' },
      { label: 'Enjoy your freedom', outcome: 'You chose lazy summer days over a paycheck. No regrets. Mostly.', effects: { happiness: 4 } },
    ],
  },

  // ---------------- Adult ----------------
  {
    id: 'lottery-ticket-2',
    emoji: '🎰',
    title: 'A Lottery Ticket',
    description: 'On a whim, you buy a scratch-off lottery ticket at the gas station.',
    minAge: 18,
    maxAge: 90,
    choices: [
      { label: 'Scratch it now', outcome: 'Three matching symbols — a small win! Not retirement money, but a nice surprise.', effects: { happiness: 6, money: 500 }, sfx: 'cash' },
      { label: 'Save it for later', outcome: 'You tucked it in a drawer and forgot about it. It was a loser anyway.', effects: {} },
    ],
  },
  {
    id: 'tax-audit',
    emoji: '🧾',
    title: 'A Tax Audit',
    description: 'A stern letter arrives: the tax office wants to "review" your last few years.',
    minAge: 22,
    maxAge: 75,
    choices: [
      { label: 'Cooperate fully', outcome: 'You handed over every receipt. Clean as a whistle — they even apologized.', effects: { happiness: -2, smarts: 1 } },
      { label: 'Try to hide some income', outcome: 'They found the hidden income. The fine stung badly.', effects: { money: -4000, happiness: -6 }, sfx: 'police' },
    ],
  },
  {
    id: 'blind-date',
    emoji: '🍷',
    title: 'A Blind Date',
    description: 'A friend sets you up on a blind date. You have no idea what to expect.',
    minAge: 19,
    maxAge: 60,
    choices: [
      { label: 'Be your charming self', outcome: 'Sparks flew over dinner. You exchanged numbers, grinning like fools.', effects: { happiness: 7, looks: 1 } },
      { label: 'Overthink everything', outcome: 'You rambled about tax law for an hour. They "had an early morning".', effects: { happiness: -4 } },
    ],
  },
  {
    id: 'neighbor-dispute-2',
    emoji: '🌳',
    title: 'The Neighbor’s Tree',
    description: 'Your neighbor’s giant tree keeps dropping branches into your yard.',
    minAge: 22,
    maxAge: 90,
    choices: [
      { label: 'Talk it out calmly', outcome: 'You had a friendly chat and split the cost of trimming it. Good fences, good friends.', effects: { happiness: 3, money: -150 } },
      { label: 'Start a feud', outcome: 'You escalated to passive-aggressive notes and a fence war. Nobody won.', effects: { happiness: -5 } },
    ],
  },
  {
    id: 'car-breakdown',
    emoji: '🚙',
    title: 'Broken Down',
    description: 'Your car sputters and dies on the side of the highway in the rain.',
    minAge: 18,
    maxAge: 85,
    choices: [
      { label: 'Call a mechanic', outcome: 'A tow and a new alternator later, you were back on the road. Ouch, the bill.', effects: { money: -700, happiness: -3 } },
      { label: 'Try to fix it yourself', outcome: 'You watched a video and actually fixed it. Grease everywhere, but you felt unstoppable.', effects: { smarts: 3, happiness: 4, health: -1 } },
    ],
  },
  {
    id: 'startup-pitch',
    emoji: '💡',
    title: 'A Business Idea',
    description: 'You have a genuinely good idea for an app. Do you chase it?',
    minAge: 20,
    maxAge: 55,
    choices: [
      { label: 'Invest your savings', outcome: 'You poured savings into the idea. It’s a gamble, but your eyes are alive again.', effects: { money: -3000, happiness: 6, smarts: 2 } },
      { label: 'Keep it as a daydream', outcome: 'You kept the idea safe in a notebook. Someone else launched it two years later.', effects: { happiness: -3, smarts: 1 } },
    ],
  },
  {
    id: 'gym-injury',
    emoji: '🏋️',
    title: 'Ego Lifting',
    description: 'At the gym, you load way more weight on the bar than you should to impress a stranger.',
    minAge: 16,
    maxAge: 60,
    choices: [
      { label: 'Go for the big lift', outcome: 'Something in your back went "pop". You waddled home in shame.', effects: { health: -10, happiness: -4, looks: -1 }, sfx: 'hurt' },
      { label: 'Swallow your pride', outcome: 'You dropped the weight and did it properly. Boring, but injury-free.', effects: { health: 3, smarts: 1 } },
    ],
  },
  {
    id: 'jury-summons',
    emoji: '⚖️',
    title: 'Jury Summons',
    description: 'A jury duty summons lands in your mailbox for a lengthy trial.',
    minAge: 18,
    maxAge: 70,
    choices: [
      { label: 'Serve dutifully', outcome: 'You served on the jury and took it seriously. Civic pride, mild boredom.', effects: { smarts: 3, happiness: -1 } },
      { label: 'Fake an excuse', outcome: 'You wriggled out of it with a flimsy excuse. The guilt lingered a while.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'charity-marathon',
    emoji: '🏃',
    title: 'Charity Marathon',
    description: 'A colleague ropes you into running a charity marathon in six weeks.',
    minAge: 18,
    maxAge: 65,
    choices: [
      { label: 'Train hard and run it', outcome: 'You crossed the finish line, sweaty and triumphant, and raised a nice sum.', effects: { health: 6, happiness: 8, money: -100 }, sfx: 'success' },
      { label: 'Just donate instead', outcome: 'You skipped the running and just donated. Your knees thanked you.', effects: { happiness: 2, money: -100 } },
    ],
  },
  {
    id: 'scam-call',
    emoji: '☎️',
    title: 'A Suspicious Call',
    description: 'Someone calls claiming to be your bank, urgently asking you to "verify" your details.',
    minAge: 20,
    maxAge: 100,
    choices: [
      { label: 'Hang up and report it', outcome: 'You recognized the scam instantly and reported it. Nice try, crooks.', effects: { smarts: 3, happiness: 2 } },
      { label: 'Give them the details', outcome: 'You fell for it and they drained an account before you noticed.', effects: { money: -2500, happiness: -8 }, sfx: 'fail' },
    ],
  },
  {
    id: 'found-wallet-2',
    emoji: '👛',
    title: 'A Lost Wallet',
    description: 'You find a fat wallet on the sidewalk, stuffed with cash and an ID.',
    minAge: 10,
    maxAge: 90,
    choices: [
      { label: 'Return it to the owner', outcome: 'You tracked down the owner and returned it. They gave you a heartfelt reward.', effects: { happiness: 8, smarts: 1, money: 100 } },
      { label: 'Keep the cash', outcome: 'You pocketed the cash and ditched the wallet. The guilt followed you home.', effects: { money: 300, happiness: -5 } },
    ],
  },

  // ---------------- Later life ----------------
  {
    id: 'midlife-crisis',
    emoji: '🏍️',
    title: 'A Midlife Crisis',
    description: 'You wake up one day gripped by the urge to do something wild and expensive.',
    minAge: 40,
    maxAge: 58,
    choices: [
      { label: 'Buy a motorcycle', outcome: 'You bought a shiny motorcycle and felt 25 again — for about a week.', effects: { happiness: 7, money: -8000, health: -1 } },
      { label: 'Take up a new hobby instead', outcome: 'You took up painting instead. Cheaper, and oddly fulfilling.', effects: { happiness: 5, smarts: 2 } },
    ],
  },
  {
    id: 'class-reunion',
    emoji: '🎟️',
    title: 'Class Reunion',
    description: 'An invitation arrives for your school reunion. Everyone will be there.',
    minAge: 28,
    maxAge: 65,
    choices: [
      { label: 'Go and reconnect', outcome: 'You reconnected with old friends and laughed until your face hurt.', effects: { happiness: 7 }, grantsFriend: true },
      { label: 'Skip it', outcome: 'You stayed home. Later you wondered who showed up.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'retirement-garden',
    emoji: '🌻',
    title: 'A Quiet Garden',
    description: 'With more time on your hands, you consider taking up gardening.',
    minAge: 55,
    maxAge: 95,
    choices: [
      { label: 'Grow a vegetable patch', outcome: 'Your tomatoes became the envy of the neighborhood. Peaceful days.', effects: { happiness: 4 }, startsActivity: 'gardening' },
      { label: 'Prefer the couch', outcome: 'You decided the couch was garden enough. The remote is a fine tool.', effects: { happiness: 1, health: -2 } },
    ],
  },
  {
    id: 'distant-inheritance',
    emoji: '📜',
    title: 'A Surprise Inheritance',
    description: 'A distant relative you barely knew has passed and, oddly, left you something in their will.',
    minAge: 25,
    maxAge: 90,
    choices: [
      { label: 'Accept graciously', outcome: 'You inherited a tidy sum from Great-Aunt Mildred. You raised a glass to her memory.', effects: { money: 5000, happiness: 4 }, sfx: 'cash' },
      { label: 'Donate it all', outcome: 'You gave the whole inheritance to charity. Great-Aunt Mildred would have approved.', effects: { happiness: 8 } },
    ],
  },
  {
    id: 'wisdom-tooth',
    emoji: '😬',
    title: 'Wisdom Teeth',
    description: 'The dentist says your wisdom teeth have to come out. All four of them.',
    minAge: 16,
    maxAge: 30,
    choices: [
      { label: 'Get the surgery', outcome: 'Chipmunk cheeks and a week of milkshakes, but soon good as new.', effects: { health: -3, money: -1200, happiness: -2 } },
      { label: 'Put it off', outcome: 'You ignored it until one got infected. That was a mistake.', effects: { health: -8, money: -1800, happiness: -5 }, sfx: 'hurt' },
    ],
  },

  // ----- Expansion pack: childhood -----
  {
    id: 'treehouse-build',
    emoji: '🌳',
    title: 'The Treehouse',
    description: 'The neighborhood kids are building a treehouse and want your help.',
    minAge: 6,
    maxAge: 12,
    choices: [
      { label: 'Grab a hammer', outcome: 'You built a wobbly masterpiece. Best summer ever.', effects: { happiness: 7, health: 1 } },
      { label: 'Supervise from below', outcome: 'You "managed the project". The kids called you the clipboard.', effects: { happiness: 2, smarts: 1 } },
    ],
  },
  {
    id: 'tooth-fairy-doubt',
    emoji: '🧚',
    title: 'Tooth Fairy Truthers',
    description: 'A kid at school swears the tooth fairy isn’t real. Everyone looks at you.',
    minAge: 5,
    maxAge: 9,
    choices: [
      { label: 'Defend the fairy', outcome: 'You gave a passionate speech. The magic lives on.', effects: { happiness: 4 } },
      { label: 'Demand evidence', outcome: 'You ran a bedside sting operation. The results shook you.', effects: { smarts: 3, happiness: -2 } },
    ],
  },
  {
    id: 'hide-and-seek-champ',
    emoji: '🙈',
    title: 'Hide and Seek',
    description: 'The biggest hide-and-seek game of the year is on. You know a legendary spot.',
    minAge: 5,
    maxAge: 11,
    choices: [
      { label: 'Use the legendary spot', outcome: 'They never found you. You are a playground myth now.', effects: { happiness: 6 } },
      { label: 'Hide somewhere easy', outcome: 'Found in ten seconds. At least you weren’t bored long.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'school-play',
    emoji: '🎭',
    title: 'The School Play',
    description: 'Auditions for the school play are today. The lead role is up for grabs.',
    minAge: 7,
    maxAge: 14,
    choices: [
      { label: 'Go for the lead', outcome: 'You nailed it! The crowd (of parents) went mild.', effects: { happiness: 6, looks: 1, stress: 2 } },
      { label: 'Be a tree', outcome: 'You stood very still. Honestly, a flawless tree.', effects: { happiness: 3 } },
    ],
  },
  {
    id: 'lost-in-supermarket',
    emoji: '🛒',
    title: 'Lost in the Store',
    description: 'You let go of your parent’s hand for ONE second and now you’re lost in the supermarket.',
    minAge: 4,
    maxAge: 8,
    choices: [
      { label: 'Ask an employee for help', outcome: 'They paged your parents. Reunited by the cereal aisle.', effects: { smarts: 2, happiness: 1 } },
      { label: 'Panic quietly', outcome: 'You cried near the frozen peas until rescue arrived.', effects: { happiness: -3 } },
    ],
  },
  {
    id: 'pet-goldfish',
    emoji: '🐠',
    title: 'Carnival Goldfish',
    description: 'You won a goldfish at the carnival. It stares at you with one big eye.',
    minAge: 5,
    maxAge: 12,
    choices: [
      { label: 'Take it home', outcome: 'You brought the little fish home. A true (if quiet) friend.', effects: { happiness: 5 }, grantsPet: 'Fish' },
      { label: 'Give it to a friend', outcome: 'You passed the fish to a friend. Bubbles found a good home.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'snow-day',
    emoji: '❄️',
    title: 'Snow Day!',
    description: 'School is cancelled — the whole town is buried in snow.',
    minAge: 5,
    maxAge: 15,
    choices: [
      { label: 'Epic snowball fight', outcome: 'You led your street to victory. Glorious and freezing.', effects: { happiness: 7, health: -1 } },
      { label: 'Hot cocoa fort inside', outcome: 'Blankets, cocoa, cartoons. A perfect day.', effects: { happiness: 5 } },
    ],
  },
  {
    id: 'chores-strike',
    emoji: '🧹',
    title: 'Chore Wars',
    description: 'Your parents introduce a chore chart. Your name is on it. A lot.',
    minAge: 6,
    maxAge: 14,
    choices: [
      { label: 'Do the chores', outcome: 'You earned trust, allowance, and suspiciously clean habits.', effects: { happiness: 1, smarts: 1, money: 100 } },
      { label: 'Go on strike', outcome: 'The strike lasted four hours. Management won.', effects: { happiness: -2 } },
    ],
  },

  // ----- Expansion pack: school & teens -----
  {
    id: 'yearbook-photo',
    emoji: '📸',
    title: 'Yearbook Photo Day',
    description: 'Picture day. This photo will follow you forever.',
    minAge: 12,
    maxAge: 18,
    choices: [
      { label: 'Prepare all morning', outcome: 'Immaculate. Future you will be grateful.', effects: { looks: 2, happiness: 2 } },
      { label: 'Wing it', outcome: 'You blinked. Of course you blinked.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'mixtape-crush',
    emoji: '🎧',
    title: 'The Playlist',
    description: 'You made a playlist for someone you like. Send it, or keep it to yourself?',
    minAge: 13,
    maxAge: 19,
    choices: [
      { label: 'Send it', outcome: 'They loved track three. You’ve never felt cooler.', effects: { happiness: 6 } },
      { label: 'Chicken out', outcome: 'The playlist remains yours alone. Track three still slaps.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'driving-test',
    emoji: '🚦',
    title: 'The Driving Test',
    description: 'Your driving test is today. The examiner has a clipboard and zero mercy.',
    minAge: 16,
    maxAge: 22,
    choices: [
      { label: 'Stay calm and check mirrors', outcome: 'Passed! The parallel park was poetry.', effects: { happiness: 7, smarts: 1 } },
      { label: 'Speed through it', outcome: 'Failed in record time. The cone never stood a chance.', effects: { happiness: -5, stress: 3 } },
    ],
  },
  {
    id: 'group-chat-drama',
    emoji: '💬',
    title: 'Group Chat Drama',
    description: 'Someone screenshotted the group chat. Chaos erupts.',
    minAge: 13,
    maxAge: 22,
    choices: [
      { label: 'Stay out of it', outcome: 'You muted the chat and lived in peace. Wise.', effects: { happiness: 2 } },
      { label: 'Pick a side', outcome: 'You chose wrong. The fallout was biblical.', effects: { happiness: -4, stress: 3 } },
    ],
  },
  {
    id: 'first-concert',
    emoji: '🎫',
    title: 'First Concert',
    description: 'Your favorite band is playing nearby. Tickets are pricey but it’s THE tour.',
    minAge: 14,
    maxAge: 25,
    choices: [
      { label: 'Buy a ticket', outcome: 'You screamed every lyric. Ears rang for days — worth it.', effects: { happiness: 8, money: -120 } },
      { label: 'Watch clips online', outcome: 'The pixels were crisp. The FOMO was crisper.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'study-abroad-flyer',
    emoji: '✈️',
    title: 'The Exchange Trip',
    description: 'School is running a two-week exchange trip abroad.',
    minAge: 14,
    maxAge: 19,
    choices: [
      { label: 'Sign up', outcome: 'New foods, new friends, one lost passport. Unforgettable.', effects: { happiness: 6, smarts: 3, money: -400 } },
      { label: 'Stay home', outcome: 'You saved the money and watched everyone’s stories.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'curfew-bust',
    emoji: '🌙',
    title: 'Past Curfew',
    description: 'You’re out with friends and it’s WAY past curfew. The porch light is on.',
    minAge: 13,
    maxAge: 17,
    choices: [
      { label: 'Sneak in the back', outcome: 'The floorboard betrayed you. Grounded, but legendary.', effects: { happiness: -2 } },
      { label: 'Walk in and apologize', outcome: 'Honesty bought you a shorter sentence.', effects: { smarts: 1, happiness: -1 } },
    ],
  },

  // ----- Expansion pack: young adult -----
  {
    id: 'flat-tire-interview',
    emoji: '🛞',
    title: 'Flat Tire Morning',
    description: 'Flat tire on the most important morning of your month.',
    minAge: 18,
    maxAge: 60,
    choices: [
      { label: 'Change it yourself', outcome: 'Greasy hands, on time, hero of your own story.', effects: { smarts: 1, happiness: 2 } },
      { label: 'Call for help and wait', outcome: 'Forty minutes late. The day never recovered.', effects: { happiness: -3, stress: 3 } },
    ],
  },
  {
    id: 'roommate-fridge',
    emoji: '🥡',
    title: 'The Fridge Thief',
    description: 'Someone keeps eating your clearly-labeled leftovers.',
    minAge: 18,
    maxAge: 30,
    choices: [
      { label: 'Set a spicy trap', outcome: 'The ghost pepper noodles found their culprit. Justice.', effects: { happiness: 5 } },
      { label: 'Call a house meeting', outcome: 'An accord was signed. The fridge knows peace.', effects: { smarts: 2, happiness: 2 } },
    ],
  },
  {
    id: 'gym-new-year',
    emoji: '🏋️',
    title: 'New Year, New Me',
    description: 'January 1st. The gym is packed with resolutions.',
    minAge: 18,
    maxAge: 70,
    choices: [
      { label: 'Actually keep going', outcome: 'By March the crowd thinned. You stayed. It shows.', effects: { health: 3, looks: 1 }, startsActivity: 'gym' },
      { label: 'Quit by February', outcome: 'The membership fee became a monthly donation.', effects: { money: -300, happiness: -2 } },
    ],
  },
  {
    id: 'stock-tip',
    emoji: '📈',
    title: 'A Hot Stock Tip',
    description: 'A friend swears this is the moment to get into the market.',
    minAge: 18,
    maxAge: 75,
    choices: [
      { label: 'Open the investing app', outcome: 'You opened Vestr to see for yourself.', effects: {}, opens: 'investing' },
      { label: 'Nod politely', outcome: 'You nodded. The tip joined the graveyard of hot tips.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'crypto-fomo',
    emoji: '🪙',
    title: 'Everyone’s Talking Crypto',
    description: 'Your feed is wall-to-wall rocket emojis. Coins only go up... right?',
    minAge: 18,
    maxAge: 60,
    choices: [
      { label: 'Take a look', outcome: 'You opened Vestr to size up the coins.', effects: {}, opens: 'investing' },
      { label: 'Log off', outcome: 'You touched grass instead. The grass was nice.', effects: { happiness: 2, stress: -2 } },
    ],
  },
  {
    id: 'flash-sale',
    emoji: '🏷️',
    title: 'Flash Sale',
    description: 'Everything you’ve ever wanted is briefly, dangerously discounted.',
    minAge: 16,
    maxAge: 80,
    choices: [
      { label: 'Browse the shop', outcome: 'You went shopping. For research purposes.', effects: {}, opens: 'shop' },
      { label: 'Guard your wallet', outcome: 'You closed the tab. Your savings sighed in relief.', effects: { smarts: 1 } },
    ],
  },
  {
    id: 'job-fair',
    emoji: '🧑‍💼',
    title: 'The Job Fair',
    description: 'A job fair is in town — booths, branded pens, and possibility.',
    minAge: 16,
    maxAge: 60,
    choices: [
      { label: 'Browse the openings', outcome: 'You worked the room and collected nine pens.', effects: {}, opens: 'jobs' },
      { label: 'Skip it', outcome: 'The pens will never know you.', effects: {} },
    ],
  },
  {
    id: 'feeling-run-down',
    emoji: '🥱',
    title: 'Running on Empty',
    description: 'You’ve been tired for weeks. Something feels off.',
    minAge: 18,
    maxAge: 90,
    choices: [
      { label: 'Get checked out', outcome: 'You booked in at the clinic. Better safe than sorry.', effects: {}, opens: 'health' },
      { label: 'Power through', outcome: 'Coffee is a food group now. This is fine.', effects: { health: -3, stress: 3 } },
    ],
  },
  {
    id: 'dentist-reminder',
    emoji: '🦷',
    title: 'The Dentist Postcard',
    description: 'A postcard arrives: "It’s been a while since your last checkup 🙂".',
    minAge: 16,
    maxAge: 85,
    choices: [
      { label: 'Book it', outcome: 'You faced the chair like a champion.', effects: {}, opens: 'health' },
      { label: 'Lose the postcard', outcome: 'The postcard "got lost". Your molars took notes.', effects: { health: -1 } },
    ],
  },
  {
    id: 'wedding-season',
    emoji: '💌',
    title: 'Wedding Season',
    description: 'Three invitations, one summer. The gift registry economy is booming.',
    minAge: 22,
    maxAge: 45,
    choices: [
      { label: 'Attend them all', outcome: 'Three cakes, two bouquets nearly caught, one epic summer.', effects: { happiness: 6, money: -600 } },
      { label: 'Send regrets and gifts', outcome: 'Cheaper than travel, and the cards were heartfelt.', effects: { money: -200, happiness: 1 } },
    ],
  },
  {
    id: 'apartment-flood',
    emoji: '🚰',
    title: 'The Upstairs Leak',
    description: 'The neighbor’s washing machine has redecorated your ceiling.',
    minAge: 18,
    maxAge: 80,
    choices: [
      { label: 'Handle it calmly', outcome: 'Insurance, buckets, apologies — sorted in a week.', effects: { money: -400, stress: 2 } },
      { label: 'Storm upstairs', outcome: 'The shouting fixed nothing. The ceiling still dripped.', effects: { happiness: -4, stress: 4 } },
    ],
  },
  {
    id: 'karaoke-night',
    emoji: '🎤',
    title: 'Karaoke Night',
    description: 'The mic is being passed around. Your song is queued.',
    minAge: 18,
    maxAge: 70,
    choices: [
      { label: 'Give it everything', outcome: 'You brought the house down. Zero notes were correct.', effects: { happiness: 7 } },
      { label: 'Pass the mic', outcome: 'You hummed along safely from your seat.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'volunteer-day',
    emoji: '🤝',
    title: 'Volunteer Day',
    description: 'The local shelter needs weekend hands.',
    minAge: 14,
    maxAge: 85,
    choices: [
      { label: 'Show up', outcome: 'Hard work, good people, one adopted-out dog named Biscuit.', effects: { happiness: 6 } },
      { label: 'Donate instead', outcome: 'Your wallet volunteered on your behalf.', effects: { money: -100, happiness: 2 } },
    ],
  },
  {
    id: 'phone-cracked',
    emoji: '📱',
    title: 'The Cracked Screen',
    description: 'Your phone slipped. The screen now looks like modern art.',
    minAge: 14,
    maxAge: 80,
    choices: [
      { label: 'Shop for a new one', outcome: 'Time for an upgrade anyway, right?', effects: {}, opens: 'shop' },
      { label: 'Live with the crack', outcome: 'Your thumb bleeds a little, but your wallet doesn’t.', effects: { happiness: -2 } },
    ],
  },

  // ----- Expansion pack: adult life -----
  {
    id: 'surprise-audit-email',
    emoji: '📧',
    title: 'Reply All Disaster',
    description: 'You just replied-all to the entire company. With a meme.',
    minAge: 20,
    maxAge: 65,
    requires: ['hasJob'],
    choices: [
      { label: 'Own it', outcome: 'The CEO replied with a better meme. Crisis averted.', effects: { happiness: 3 } },
      { label: 'Recall frantically', outcome: 'Recall failed. You are the meme now.', effects: { happiness: -3, stress: 4 } },
    ],
  },
  {
    id: 'farmers-market',
    emoji: '🥕',
    title: 'The Farmers Market',
    description: 'Sunday market: artisanal everything, honey guy, sourdough queue.',
    minAge: 20,
    maxAge: 90,
    choices: [
      { label: 'Fill a tote bag', outcome: 'You spent too much on honey and regret nothing.', effects: { happiness: 4, health: 1, money: -80 } },
      { label: 'Just browse', outcome: 'Free samples count as brunch.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'jury-of-vibes',
    emoji: '🚗',
    title: 'The Parking Spot',
    description: 'Someone slid into the parking spot you clearly signaled for.',
    minAge: 18,
    maxAge: 80,
    choices: [
      { label: 'Let it go', outcome: 'You found a better spot and the moral high ground.', effects: { happiness: 1, stress: -1 } },
      { label: 'Honk symphony', outcome: 'Nothing changed except your blood pressure.', effects: { stress: 4, happiness: -2 } },
    ],
  },
  {
    id: 'old-hobby-box',
    emoji: '📦',
    title: 'The Box in the Attic',
    description: 'You found your old hobby gear while cleaning. It still works.',
    minAge: 25,
    maxAge: 80,
    choices: [
      { label: 'Pick it back up', outcome: 'Like riding a bike. Rusty, joyful, yours. Painting again.', effects: { happiness: 4, stress: -2 }, startsActivity: 'painting' },
      { label: 'Box it back up', outcome: 'Some day. The box waits patiently.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'neighborhood-bbq',
    emoji: '🍔',
    title: 'The Block Party',
    description: 'The street is throwing a barbecue. You’ve been asked to bring "something".',
    minAge: 20,
    maxAge: 85,
    choices: [
      { label: 'Cook your signature dish', outcome: 'Cleared in minutes. You are now "the food neighbor".', effects: { happiness: 5 } },
      { label: 'Bring store-brand chips', outcome: 'The bowl sat untouched. Everyone knew.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'power-outage',
    emoji: '🔦',
    title: 'The Blackout',
    description: 'The whole block loses power on the hottest night of the year.',
    minAge: 10,
    maxAge: 90,
    choices: [
      { label: 'Candlelit board games', outcome: 'Best night of the summer, no screens required.', effects: { happiness: 5 } },
      { label: 'Complain in the dark', outcome: 'The fridge slowly warmed. So did your temper.', effects: { happiness: -3, stress: 2 } },
    ],
  },
  {
    id: 'mystery-package',
    emoji: '📦',
    title: 'A Package You Didn’t Order',
    description: 'A parcel arrives addressed to you. You definitely didn’t order it.',
    minAge: 18,
    maxAge: 85,
    choices: [
      { label: 'Open it', outcome: 'Forty rubber ducks. No note. Life is beautiful and strange.', effects: { happiness: 4 } },
      { label: 'Return to sender', outcome: 'The mystery remains sealed forever. Probably ducks though.', effects: { smarts: 1 } },
    ],
  },
  {
    id: 'promotion-party',
    emoji: '🥂',
    title: 'A Friend’s Big Break',
    description: 'Your friend just landed their dream job and wants to celebrate — on you?',
    minAge: 20,
    maxAge: 60,
    choices: [
      { label: 'Cover the night', outcome: 'Generosity looks good on you. The toast was to friendship.', effects: { money: -150, happiness: 5 } },
      { label: 'Split the bill', outcome: 'The calculator app made an appearance. It was fine.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'ladder-diy',
    emoji: '🪜',
    title: 'The DIY Weekend',
    description: 'Those shelves won’t hang themselves. You own a drill now, apparently.',
    minAge: 20,
    maxAge: 75,
    choices: [
      { label: 'Measure twice, drill once', outcome: 'Level shelves! You strut past them daily.', effects: { smarts: 2, happiness: 3 } },
      { label: 'Eyeball it', outcome: 'The shelf held for one heroic hour.', effects: { money: -120, happiness: -3 } },
    ],
  },
  {
    id: 'cooking-show-audition',
    emoji: '👨‍🍳',
    title: 'Home Cook Challenge',
    description: 'A local cooking contest is taking amateur entries. Your lasagna has fans.',
    minAge: 18,
    maxAge: 80,
    choices: [
      { label: 'Enter the lasagna', outcome: 'Second place! The trophy is small and the pride enormous.', effects: { happiness: 6, money: 200 } },
      { label: 'Keep it a home secret', outcome: 'The lasagna remains undefeated, unranked, and yours.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'library-fine',
    emoji: '📚',
    title: 'The Ancient Library Book',
    description: 'You found a library book due seven years ago. The guilt is heavy.',
    minAge: 14,
    maxAge: 85,
    choices: [
      { label: 'Return it and confess', outcome: 'The librarian waived the fine and framed the moment.', effects: { happiness: 3, smarts: 1 } },
      { label: 'Keep it forever', outcome: 'It lives on your shelf, a fugitive in hardcover.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'marathon-dare',
    emoji: '🏃',
    title: 'The Half-Marathon Dare',
    description: 'A coworker bet you can’t finish a half-marathon. Registration closes tonight.',
    minAge: 18,
    maxAge: 60,
    choices: [
      { label: 'Sign up and train', outcome: 'You crossed the line upright. The medal is everything — and you kept running.', effects: { health: 3, happiness: 4, stress: 2 }, startsActivity: 'running' },
      { label: 'Decline the bait', outcome: 'You jogged to the fridge instead. A personal best.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'scenic-detour',
    emoji: '🗺️',
    title: 'The Scenic Route',
    description: 'GPS says 40 minutes. The winding coastal road says 90.',
    minAge: 18,
    maxAge: 85,
    choices: [
      { label: 'Take the coast', outcome: 'Golden light, open windows, one perfect drive.', effects: { happiness: 6, stress: -3 } },
      { label: 'Fastest route', outcome: 'Efficient. Forgettable. Fine.', effects: {} },
    ],
  },
  {
    id: 'houseplant-empire',
    emoji: '🪴',
    title: 'One More Plant',
    description: 'The plant shop is having a sale. Your windowsill is already a jungle.',
    minAge: 18,
    maxAge: 90,
    choices: [
      { label: 'Adopt another', outcome: 'Meet Fernando. He makes the jungle complete. Gardening it is.', effects: { happiness: 3, money: -40 }, startsActivity: 'gardening' },
      { label: 'Show restraint', outcome: 'The jungle respected your discipline. Fernando waits.', effects: { smarts: 1 } },
    ],
  },
  {
    id: 'stormy-flight',
    emoji: '🛫',
    title: 'The Delayed Flight',
    description: 'Your flight is delayed six hours. The gate has one working outlet.',
    minAge: 18,
    maxAge: 85,
    choices: [
      { label: 'Make airport friends', outcome: 'You swapped life stories with a retired magician. Worth it.', effects: { happiness: 4 }, grantsFriend: true },
      { label: 'Guard the outlet', outcome: 'Full battery, empty soul.', effects: { stress: 3, happiness: -2 } },
    ],
  },
  {
    id: 'wallet-found-atm',
    emoji: '💳',
    title: 'Card Left in the ATM',
    description: 'The person before you left their card in the machine.',
    minAge: 16,
    maxAge: 85,
    choices: [
      { label: 'Hand it to the bank', outcome: 'The teller thanked you. Karma took notes.', effects: { happiness: 3 } },
      { label: 'Leave it there', outcome: 'Not your card, not your problem — but it gnawed at you.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'open-mic-night',
    emoji: '🎙️',
    title: 'Open Mic Night',
    description: 'The host is asking for volunteers. Your friends are pointing at you.',
    minAge: 18,
    maxAge: 70,
    choices: [
      { label: 'Take the stage', outcome: 'Two laughs and one heckler. Showbiz!', effects: { happiness: 5, stress: 2 } },
      { label: 'Sink into your chair', outcome: 'You became one with the upholstery.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'recipe-heirloom',
    emoji: '🍲',
    title: 'Grandma’s Recipe',
    description: 'You found a handwritten family recipe. Half the measurements say "some".',
    minAge: 16,
    maxAge: 85,
    choices: [
      { label: 'Attempt it faithfully', outcome: 'The kitchen smelled like childhood. "Some" was correct.', effects: { happiness: 6 } },
      { label: 'Order takeout instead', outcome: 'The recipe waits. Takeout never judges.', effects: { happiness: 1, money: -30 } },
    ],
  },
  {
    id: 'street-piano',
    emoji: '🎹',
    title: 'The Street Piano',
    description: 'A public piano sits in the square, daring passers-by.',
    minAge: 10,
    maxAge: 90,
    choices: [
      { label: 'Play something', outcome: 'A small crowd gathered. Someone filmed it. You peaked.', effects: { happiness: 6 } },
      { label: 'Walk past', outcome: 'The piano played sad chords in your imagination.', effects: {} },
    ],
  },
  {
    id: 'lost-ring',
    emoji: '💍',
    title: 'The Beach Ring',
    description: 'Your ring slipped off somewhere in the sand. The tide is coming in.',
    minAge: 20,
    maxAge: 85,
    choices: [
      { label: 'Grid-search the beach', outcome: 'Found it at sunset, half-buried. Heart rate: recovering.', effects: { happiness: 5, stress: 3 } },
      { label: 'Accept the loss', outcome: 'The sea keeps a small shiny tax.', effects: { happiness: -4, money: -300 } },
    ],
  },
  {
    id: 'quiz-night',
    emoji: '🧠',
    title: 'Pub Quiz Finals',
    description: 'Your quiz team made the finals. The tiebreaker category: "Potpourri".',
    minAge: 18,
    maxAge: 85,
    choices: [
      { label: 'Trust your gut', outcome: 'Correct! The trophy is a golden pickle. It’s perfect.', effects: { happiness: 6, smarts: 2, money: 100 } },
      { label: 'Overthink it', outcome: 'You changed the right answer to a wrong one. Classic.', effects: { happiness: -3, smarts: 1 } },
    ],
  },

  // ----- Expansion pack: elder years -----
  {
    id: 'grandkid-tech-support',
    emoji: '💻',
    title: 'Tech Support Call',
    description: 'The family needs help — apparently YOU are the tech support now.',
    minAge: 60,
    maxAge: 100,
    choices: [
      { label: 'Solve it patiently', outcome: 'It was unplugged. You billed them in cookies.', effects: { happiness: 5, smarts: 1 } },
      { label: 'Turn it off and on', outcome: 'The ancient ritual worked. Your legend grows.', effects: { happiness: 4 } },
    ],
  },
  {
    id: 'senior-discount',
    emoji: '🎟️',
    title: 'The Senior Discount',
    description: 'The cashier applies the senior discount without asking.',
    minAge: 58,
    maxAge: 100,
    choices: [
      { label: 'Embrace it', outcome: '15% off and zero shame. The golden years pay.', effects: { happiness: 3, money: 50 } },
      { label: 'Be mildly offended', outcome: 'You paid full price out of spite. Power move.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'memoir-idea',
    emoji: '✍️',
    title: 'The Memoir',
    description: 'Your life would make a heck of a book. The blank page awaits.',
    minAge: 60,
    maxAge: 100,
    choices: [
      { label: 'Start writing', outcome: 'Chapter one: "I was born, against all advice."', effects: { happiness: 5, smarts: 2 } },
      { label: 'Tell stories instead', outcome: 'The grandkids know every tale by heart now.', effects: { happiness: 4 } },
    ],
  },
  {
    id: 'park-chess-hustler',
    emoji: '♟️',
    title: 'The Park Chess Regular',
    description: 'The park’s chess veteran waves you over. "One game."',
    minAge: 55,
    maxAge: 100,
    choices: [
      { label: 'Sit down and play', outcome: 'You lost in 12 moves and learned more than any book taught.', effects: { smarts: 3, happiness: 4 } },
      { label: 'Watch the masters', outcome: 'Spectating is an art too. You brought snacks.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'dance-class-seniors',
    emoji: '💃',
    title: 'Ballroom Beginners',
    description: 'The community center is offering ballroom lessons. Partners optional.',
    minAge: 55,
    maxAge: 95,
    choices: [
      { label: 'Learn to waltz', outcome: 'Left feet united into something almost graceful.', effects: { happiness: 6, health: 2 } },
      { label: 'Claim a bad hip', outcome: 'The hip was fine. The couch was calling.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'birdwatching-rare',
    emoji: '🦜',
    title: 'A Rare Visitor',
    description: 'A bird you’ve never seen lands on your feeder. Binoculars, quick!',
    minAge: 50,
    maxAge: 100,
    choices: [
      { label: 'Log the sighting', outcome: 'Confirmed rare! The birdwatching forum erupted.', effects: { happiness: 5 } },
      { label: 'Just enjoy it', outcome: 'You and the bird shared a quiet minute. Enough.', effects: { happiness: 4, stress: -2 } },
    ],
  },

  // ----- Expansion pack: anytime curveballs -----
  {
    id: 'double-rainbow',
    emoji: '🌈',
    title: 'Double Rainbow',
    description: 'After the storm: two full rainbows, horizon to horizon.',
    minAge: 3,
    maxAge: 100,
    choices: [
      { label: 'Stop and stare', outcome: 'Five whole minutes of wonder. Free of charge.', effects: { happiness: 4, stress: -2 } },
      { label: 'Photograph it badly', outcome: 'The photo shows a grey smudge. The memory is better.', effects: { happiness: 3 } },
    ],
  },
  {
    id: 'wrong-number-friend',
    emoji: '📞',
    title: 'The Wrong Number',
    description: 'A wrong-number text turns into a surprisingly good conversation.',
    minAge: 14,
    maxAge: 90,
    choices: [
      { label: 'Keep chatting', outcome: 'Three years later you still swap memes with a stranger named Pat.', effects: { happiness: 4 }, grantsFriend: true },
      { label: 'Politely end it', outcome: '"Sorry, wrong number." Some doors close quietly.', effects: {} },
    ],
  },
  {
    id: 'time-capsule',
    emoji: '⏳',
    title: 'The Time Capsule',
    description: 'You dig up a time capsule you buried long ago.',
    minAge: 16,
    maxAge: 95,
    choices: [
      { label: 'Open it', outcome: 'A toy, a photo, and a letter that made you laugh-cry.', effects: { happiness: 6 } },
      { label: 'Rebury it deeper', outcome: 'Future you can deal with those feelings.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'meteor-shower',
    emoji: '☄️',
    title: 'Meteor Shower Tonight',
    description: 'Peak viewing is 3am, in a cold field, far from streetlights.',
    minAge: 8,
    maxAge: 90,
    choices: [
      { label: 'Set the alarm', outcome: 'Nineteen shooting stars. You wished big on every one.', effects: { happiness: 7, health: -1 } },
      { label: 'Sleep through it', outcome: 'The universe performed to an empty seat.', effects: {} },
    ],
  },
  {
    id: 'street-cat-adoption',
    emoji: '🐈',
    title: 'The Persistent Cat',
    description: 'A street cat has decided your doorstep is home. It’s been a week.',
    minAge: 16,
    maxAge: 95,
    choices: [
      { label: 'Let it in', outcome: 'You didn’t choose the cat. The cat chose you.', effects: { happiness: 6 }, grantsPet: 'Cat' },
      { label: 'Stay firm', outcome: 'The cat moved next door and judges you through the fence.', effects: { happiness: -2 } },
    ],
  },
  {
    id: 'balloon-release',
    emoji: '🎈',
    title: 'The Escaped Balloon',
    description: 'A stranger’s toddler lets go of their balloon at the park. Everyone watches it rise.',
    minAge: 5,
    maxAge: 95,
    choices: [
      { label: 'Buy them a new one', outcome: 'The vendor gave you two. Hero status: local.', effects: { money: -10, happiness: 5 } },
      { label: 'Wave it goodbye', outcome: 'The whole park saluted the balloon. Safe travels.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'radio-contest',
    emoji: '📻',
    title: 'Caller Number Nine',
    description: 'The radio is giving a prize to caller number nine. Your fingers hover.',
    minAge: 14,
    maxAge: 85,
    choices: [
      { label: 'Dial fast', outcome: 'CALLER NINE! You won concert tickets and screamed on air.', effects: { happiness: 7, money: 150 } },
      { label: 'Assume you’d lose', outcome: 'Caller nine sounded suspiciously calm. Could’ve been you.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'fortune-cookie',
    emoji: '🥠',
    title: 'An Oddly Specific Fortune',
    description: 'Your fortune cookie says: "The thing you are avoiding knows you are avoiding it."',
    minAge: 12,
    maxAge: 95,
    choices: [
      { label: 'Face the thing', outcome: 'You finally did it. The cookie was right. Unsettling.', effects: { happiness: 5, stress: -3 } },
      { label: 'Eat the evidence', outcome: 'No fortune, no obligation. Delicious loophole.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'community-garden-plot',
    emoji: '🌻',
    title: 'A Free Garden Plot',
    description: 'The community garden has one open plot and your name came up.',
    minAge: 20,
    maxAge: 95,
    choices: [
      { label: 'Take the plot', outcome: 'Tomatoes, sunflowers, and one suspiciously fat pigeon.', effects: { happiness: 3, stress: -2 }, startsActivity: 'gardening' },
      { label: 'Pass it on', outcome: 'You gifted the plot to a neighbor. Their zucchini thanks you.', effects: { happiness: 3 } },
    ],
  },
  {
    id: 'marathon-tv',
    emoji: '📺',
    title: 'Just One More Episode',
    description: 'The finale drops at midnight. You have work in the morning.',
    minAge: 15,
    maxAge: 80,
    choices: [
      { label: 'Watch it all', outcome: 'Worth it. Exhausted, spoiler-proof, and deeply satisfied.', effects: { happiness: 5, health: -2 } },
      { label: 'Sleep like an adult', outcome: 'You dodged spoilers all day like a secret agent.', effects: { health: 1, stress: 2 } },
    ],
  },
  {
    id: 'silent-retreat',
    emoji: '🧘',
    title: 'The Silent Weekend',
    description: 'A friend invites you to a silent meditation retreat. No phones. No talking.',
    minAge: 20,
    maxAge: 85,
    choices: [
      { label: 'Embrace the silence', outcome: 'Two days of quiet. Your thoughts finally sat down. You kept up the practice.', effects: { happiness: 3, stress: -6 }, startsActivity: 'meditation' },
      { label: 'Noisily decline', outcome: 'You celebrated your freedom of speech extensively.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'aquarium-day',
    emoji: '🐙',
    title: 'The Aquarium Octopus',
    description: 'The aquarium’s octopus makes eye contact with you. It feels personal.',
    minAge: 5,
    maxAge: 95,
    choices: [
      { label: 'Stay a while', outcome: 'You and Professor Tentacles had a moment. No one believes you.', effects: { happiness: 5 } },
      { label: 'Move along', outcome: 'The octopus remembers. They always remember.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'sunrise-hike',
    emoji: '🌄',
    title: 'The Sunrise Hike',
    description: 'Friends are hiking to the summit for sunrise. Departure: 4:30am.',
    minAge: 14,
    maxAge: 75,
    choices: [
      { label: 'Set three alarms', outcome: 'The summit glowed gold. Every yawn was worth it.', effects: { happiness: 7, health: 3 } },
      { label: 'See the photos later', outcome: 'The photos were stunning. The bed was also stunning.', effects: { happiness: 1 } },
    ],
  },
  {
    id: 'busker-band',
    emoji: '🥁',
    title: 'The Subway Drummers',
    description: 'Bucket drummers have the whole platform nodding along.',
    minAge: 10,
    maxAge: 90,
    choices: [
      { label: 'Tip and dance', outcome: 'You missed your train and caught a memory.', effects: { money: -10, happiness: 5 } },
      { label: 'Catch your train', outcome: 'Punctual. The beat faded behind the doors.', effects: {} },
    ],
  },
  {
    id: 'boardgame-rivalry',
    emoji: '🎲',
    title: 'Game Night Grudge',
    description: 'Game night. The same person always wins. Tonight feels different.',
    minAge: 10,
    maxAge: 90,
    choices: [
      { label: 'Play the long game', outcome: 'VICTORY. Framed the scoresheet. Sent them a copy.', effects: { happiness: 7, smarts: 2 } },
      { label: 'Flip the board (gently)', outcome: 'A draw was declared for insurance reasons.', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'new-cafe-regular',
    emoji: '☕',
    title: 'The New Café',
    description: 'A café opened nearby. The barista already knows your name. Suspiciously fast.',
    minAge: 16,
    maxAge: 90,
    choices: [
      { label: 'Become a regular', outcome: '"The usual?" are now your two favorite words.', effects: { happiness: 4, money: -150 } },
      { label: 'Stay loyal to home brew', outcome: 'Your kitchen remains the cheapest café in town.', effects: { money: 50, happiness: 1 } },
    ],
  },
  {
    id: 'rainy-bus-stop',
    emoji: '☔',
    title: 'One Umbrella, Two People',
    description: 'A stranger at the bus stop is getting soaked. You have an umbrella.',
    minAge: 12,
    maxAge: 90,
    choices: [
      { label: 'Share it', outcome: 'Ten minutes of small talk, one dry stranger, warm feeling.', effects: { happiness: 4 } },
      { label: 'Keep dry solo', outcome: 'Dry shoulders, damp conscience.', effects: { happiness: -1 } },
    ],
  },
  {
    id: 'sourdough-phase',
    emoji: '🍞',
    title: 'The Sourdough Phase',
    description: 'Everyone’s baking bread. A friend offers you some of their starter.',
    minAge: 18,
    maxAge: 85,
    choices: [
      { label: 'Accept the starter', outcome: 'Meet Doughnald. You feed him daily. The bread is incredible.', effects: { happiness: 3 }, startsActivity: 'cooking' },
      { label: 'Buy bread like normal', outcome: 'The bakery does it better and doesn’t need feeding.', effects: { happiness: 1, money: -20 } },
    ],
  },
  {
    id: 'kite-day',
    emoji: '🪁',
    title: 'Perfect Kite Weather',
    description: 'Steady wind, open field, and a kite you forgot you owned.',
    minAge: 5,
    maxAge: 90,
    choices: [
      { label: 'Fly it', outcome: 'The kite soared. So, briefly, did your spirit.', effects: { happiness: 5, stress: -2 } },
      { label: 'Too busy', outcome: 'The wind flew other people’s kites today.', effects: { stress: 1 } },
    ],
  },
]

/**
 * Events that only make sense while you're a student — they're skipped
 * unless you're in school or university, so no one studies for exams or
 * frets about the schoolyard bully as a working adult.
 */
/**
 * Events that only make sense when you're single — never fire these while the
 * player has a living partner (e.g. a friend won't set up a happily-married
 * person on a blind date).
 */
export const SINGLE_ONLY_EVENTS = new Set<string>(['blind-date'])

export const SCHOOL_ONLY_EVENTS = new Set<string>([
  'exam-week',
  'school-talent-show',
  'school-bully',
  'schoolyard-bully',
  'schoolyard-rumor',
  'group-project',
  'prom-night',
  'spelling-bee',
  'class-pet',
  'video-game-marathon',
])
