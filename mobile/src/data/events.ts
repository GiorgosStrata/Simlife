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
    emoji: '🐕',
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
        outcome: 'The band is terrible and it is the best thing in your life right now.',
        effects: { happiness: 10, money: -200 },
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
        effects: { happiness: 8, health: 3 },
      },
      {
        label: 'Learn the piano',
        outcome: 'Your rendition of Für Elise is now only mostly wrong. Progress.',
        effects: { smarts: 6, happiness: 5, money: -200 },
      },
      {
        label: 'Master chess at the park',
        outcome: 'The park regulars stopped going easy on you. You consider this a great honor.',
        effects: { smarts: 8, happiness: 4 },
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
]
