import type { Job, JobQuestion } from '../types'

/**
 * Job content lives here, separate from game logic.
 * - Salary is paid automatically on every Age Up while employed.
 * - Applying asks ONE random question from the job's `questions` —
 *   right answer hires you (BitLife style, deliberately obvious).
 * - `requiredMajor` locks a job behind a specific university degree
 *   (see majors.ts); `requiresDegree` accepts any degree.
 * - Only a rotating subset of jobs is hiring each year (the store's
 *   `jobOpenings`), so not everything is available all the time.
 *
 * Related jobs share a category question pool, mixed with
 * job-specific questions where it matters.
 */

const q = (text: string, options: string[], answer = 0): JobQuestion => ({ q: text, options, answer })

const FOOD_Q: JobQuestion[] = [
  q('How often should you wash your hands in a kitchen?', ['Frequently', 'Once a shift', 'Never']),
  q('A customer says their food is cold. You should...', ['Apologize and replace it', 'Shrug', 'Eat it yourself']),
  q('Where does raw chicken go in the fridge?', ['Bottom shelf, covered', 'On the desserts', 'On the counter']),
  q('The kitchen floor is wet. What do you do?', ['Mop it and put up a sign', 'Ice skate', 'Ignore it']),
  q('What does "86 the soup" mean?', ['The soup is sold out', 'Add 86 soups', 'Soup costs $86']),
]

const RETAIL_Q: JobQuestion[] = [
  q('A customer pays $10 for a $7 item. How much change?', ['$3', '$7', '$17']),
  q('What do you scan at checkout?', ['The barcode', 'The customer', 'Your badge']),
  q('The card machine says "declined". You should...', ['Ask for another payment method', 'Give it free', 'Call the army']),
  q('A shelf says $5 but it scans $6. Best move?', ['Check and honor the correct price', 'Charge $20', 'Hide the shelf']),
  q('Where do you put the money customers hand you?', ['The till', 'Your pocket', 'The bin']),
]

const OFFICE_Q: JobQuestion[] = [
  q('A meeting invite says 9am. When do you show up?', ['A little before 9', 'Noon', 'Never']),
  q('What is "CC" on an email for?', ['Copying someone in', 'Secret codes', 'Extra font size']),
  q('The printer is jammed. First step?', ['Open it and clear the jam', 'Hit it', 'Buy a new office']),
  q('A colleague asks for the report. You...', ['Send it to them', 'Deny everything', 'Print and shred it']),
  q('Deadlines are...', ['To be met', 'Decorative', 'A myth']),
]

const TRADE_Q: JobQuestion[] = [
  q('What do you wear on a work site?', ['Safety gear', 'Sandals', 'A cape']),
  q('The measurement is off by an inch. You should...', ['Re-measure and adjust', 'Guess', 'Blame the wall']),
  q('What tool tightens a bolt?', ['A wrench', 'A banana', 'A pillow']),
  q('A ladder should be placed...', ['On stable ground', 'On a skateboard', 'Upside down']),
  q('Before starting a job you check...', ['The plans and materials', 'The horoscope', 'Nothing']),
]

const TRANSPORT_Q: JobQuestion[] = [
  q('A red light means...', ['Stop', 'Speed up', 'Honk twice']),
  q('What do you need before driving for work?', ['A valid license', 'A trumpet', 'Nothing']),
  q('The package says FRAGILE. You...', ['Handle it gently', 'Drop-kick it', 'Shake it']),
  q('You feel sleepy on a long route. You should...', ['Take a safe rest stop', 'Close your eyes briefly', 'Drive faster']),
  q('What helps you find an address fastest?', ['GPS', 'A pigeon', 'Vibes']),
]

const SERVICE_Q: JobQuestion[] = [
  q('A customer is upset. First move?', ['Listen politely', 'Argue louder', 'Hide']),
  q('Being on time for shifts is...', ['Important', 'Optional', 'Rude']),
  q('A customer leaves their phone behind. You...', ['Keep it safe and report it', 'Sell it', 'Ignore it']),
  q('Your uniform should be...', ['Clean and tidy', 'On fire', 'Invisible']),
  q('The schedule says you close tonight. That means...', ['You lock up at the end', 'You go home early', 'You open at dawn']),
]

const OUTDOOR_Q: JobQuestion[] = [
  q('It’s going to storm during outdoor work. You...', ['Check safety and reschedule if needed', 'Work on the roof anyway', 'Summon lightning']),
  q('What keeps plants alive?', ['Water and sunlight', 'Wi-Fi', 'Compliments only']),
  q('Heavy lifting is safest with...', ['Bent knees and a straight back', 'One finger', 'Your teeth']),
  q('Sunscreen on a long outdoor day is...', ['A good idea', 'Forbidden', 'A dessert']),
  q('You found a wasp nest on the site. You...', ['Report it and keep distance', 'Poke it', 'Adopt them']),
]

const CARE_Q: JobQuestion[] = [
  q('Washing hands between patients prevents...', ['Spreading infection', 'Boredom', 'Overtime']),
  q('A patient presses the help button. You...', ['Respond promptly', 'Finish your show', 'Unplug it']),
  q('Medication should be given...', ['Exactly as prescribed', 'Double for luck', 'Whenever']),
  q('A thermometer measures...', ['Temperature', 'Mood', 'Height']),
  q('Patient information is...', ['Confidential', 'Great gossip', 'For sale']),
]

const CREATIVE_Q: JobQuestion[] = [
  q('The client wants changes to your work. You...', ['Take the feedback and revise', 'Cry publicly', 'Delete everything']),
  q('A deadline for the final draft means...', ['Deliver it by then', 'Start it then', 'Ignore it artistically']),
  q('Saving backup copies of your work is...', ['Essential', 'Cowardly', 'Impossible']),
  q('Which is a primary color?', ['Blue', 'Beige', 'Glitter']),
  q('Copying someone else’s work and signing it is...', ['Plagiarism', 'Efficiency', 'A tribute']),
]

const TECH_Q: JobQuestion[] = [
  q('What is a "bug" in software?', ['A mistake in the code', 'An office insect', 'A keyboard brand']),
  q('The app crashes on launch. You...', ['Debug it', 'Ship it anyway', 'Blame users']),
  q('Passwords are for...', ['Security', 'Decoration', 'Sharing widely']),
  q('Code runs on...', ['A computer', 'A treadmill', 'Hopes']),
  q('Before deploying you should...', ['Test it', 'Nap', 'Panic']),
]

const FINANCE_Q: JobQuestion[] = [
  q('Income minus expenses equals...', ['Profit', 'Pasta', 'Tuesday']),
  q('A budget is...', ['A plan for money', 'A small bird', 'A crime']),
  q('Spending more than you earn creates a...', ['Loss', 'Profit', 'Sandwich']),
  q('An invoice asks for...', ['Payment', 'A dance', 'Directions']),
  q('Double-checking the numbers is...', ['Part of the job', 'Paranoia', 'Illegal']),
]

const SAFETY_Q: JobQuestion[] = [
  q('In an emergency, the first priority is...', ['People’s safety', 'Paperwork', 'Lunch']),
  q('Smoke fills a room. You stay...', ['Low to the ground', 'On the ceiling', 'Very tall']),
  q('Protective equipment is worn...', ['Whenever the job requires it', 'Never', 'Only in photos']),
  q('You spot a hazard at work. You...', ['Report it immediately', 'Sell tickets', 'Look away']),
  q('The emergency exit should be...', ['Kept clear', 'Blocked with boxes', 'Painted shut']),
]

const EDU_Q: JobQuestion[] = [
  q('What is 7 × 8?', ['56', '54', '78']),
  q('A student doesn’t understand. You...', ['Explain it another way', 'Move on faster', 'Sigh loudly']),
  q('The capital of France is...', ['Paris', 'London', 'Rome']),
  q('Homework exists to...', ['Practice what was taught', 'Punish', 'Feed the dog']),
  q('A syllabus is...', ['A plan of what the class learns', 'A bus', 'A snake']),
]

const SCIENCE_Q: JobQuestion[] = [
  q('H2O is better known as...', ['Water', 'Gold', 'Lava']),
  q('An experiment should be...', ['Repeatable', 'Secret', 'Improvised']),
  q('Lab safety goggles protect your...', ['Eyes', 'Ankles', 'Reputation']),
  q('Recording your results is...', ['Essential', 'Optional', 'Bad luck']),
  q('The Earth orbits the...', ['Sun', 'Moon', 'Mall']),
]

const LAW_Q: JobQuestion[] = [
  q('"Innocent until proven..."', ['Guilty', 'Hungry', 'Late']),
  q('A contract is...', ['A binding agreement', 'A suggestion', 'A type of dance']),
  q('Client information is...', ['Confidential', 'Marketing material', 'A fun story']),
  q('Who decides the verdict in a jury trial?', ['The jury', 'The mailman', 'The loudest lawyer']),
  q('Evidence should be...', ['Preserved and documented', 'Improvised', 'Discarded']),
]

const SPORT_Q: JobQuestion[] = [
  q('An athlete pulls a muscle mid-game. First step?', ['Stop and assess the injury', 'Push through it', 'Add more weight']),
  q('A good training plan includes...', ['Rest and recovery days', 'No days off ever', 'Only cardio, forever']),
  q('Before intense exercise you should...', ['Warm up properly', 'Eat a huge meal', 'Sprint immediately']),
  q('What best rebuilds muscle after training?', ['Protein and sleep', 'Skipping meals', 'Sitting still for a week']),
  q('Staying hydrated during sport is...', ['Essential', 'Optional', 'A myth']),
]

const SOCIAL_Q: JobQuestion[] = [
  q('A journalist calls about bad press. You...', ['Prepare a clear, honest statement', 'Panic and hide', 'Insult them']),
  q('Good communication is mostly about...', ['Knowing your audience', 'Using big words', 'Talking nonstop']),
  q('A public apology should be...', ['Sincere and specific', 'Vague and defensive', 'Never given']),
  q('The best way to handle a rumor is to...', ['Address it with facts', 'Spread a bigger one', 'Ignore it forever']),
  q('A press release should be...', ['Clear and accurate', 'Full of jargon', 'A surprise']),
]

// [id, title, emoji, salary, minAge, minSmarts, questions, requiresDegree?, requiredMajor?, tiers?]
type Row = [string, string, string, number, number, number, JobQuestion[], boolean?, string?, string[]?]

const ROWS: Row[] = [
  // ----- Teen & starter jobs -----
  ['lawn-mower', 'Lawn Mower', '🌱', 2000, 13, 0, OUTDOOR_Q],
  ['dog-walker', 'Dog Walker', '🐕', 2500, 13, 0, [
    q('A dog pulls hard on the leash. You...', ['Hold firm and calm it', 'Let go', 'Race it']),
    q('What do you bring on every walk?', ['Waste bags', 'A trombone', 'Nothing']),
    q('The dog eats something suspicious. You...', ['Tell the owner right away', 'Keep it secret', 'Try some too']),
    q('Dogs need water...', ['Regularly', 'Never', 'Only on Sundays']),
    q('A friendly dog wags its...', ['Tail', 'Ears', 'Invoice']),
  ]],
  ['babysitter', 'Babysitter', '🍼', 3000, 14, 10, [
    q('The baby is crying. First check...', ['Hunger, diaper, sleep', 'The stock market', 'Nothing']),
    q('Small objects near a toddler are...', ['A choking hazard', 'Toys', 'Snacks']),
    q('The parents left a phone number. It’s for...', ['Emergencies and questions', 'Prank calls', 'Decoration']),
    q('Bedtime is 8pm. The kid says 11pm. You...', ['Stick to 8pm', 'Compromise at midnight', 'Ask the dog']),
    q('You should never leave a baby...', ['Unattended in the bath', 'In its crib', 'With its parents']),
  ]],
  ['paper-route', 'Paper Deliverer', '📰', 2200, 14, 0, TRANSPORT_Q],
  ['grocery-bagger', 'Grocery Bagger', '🛍️', 9000, 15, 0, RETAIL_Q],
  ['ice-cream-scooper', 'Ice Cream Scooper', '🍦', 10000, 15, 0, FOOD_Q],
  ['fast-food', 'Fast Food Worker', '🍟', 12000, 16, 0, FOOD_Q],
  ['dishwasher', 'Dishwasher', '🍽️', 11000, 16, 0, FOOD_Q],
  ['cashier', 'Retail Cashier', '🛒', 15000, 16, 10, RETAIL_Q],
  ['movie-usher', 'Movie Theater Usher', '🎬', 13000, 16, 0, SERVICE_Q],
  ['barista', 'Barista', '☕', 17000, 16, 15, [
    q('What is espresso?', ['Strong coffee brewed under pressure', 'A type of tea', 'Chocolate milk']),
    q('A latte is espresso plus...', ['Steamed milk', 'Orange juice', 'Soda water']),
    q('A customer asks for decaf. What matters?', ['Actually using decaf beans', 'Extra caffeine', 'A bigger cup']),
    q('What goes on top of a cappuccino?', ['Milk foam', 'Ketchup', 'Ice cubes']),
    q('The milk steamer hisses loudly. That is...', ['Normal', 'A ghost', 'A fire alarm']),
  ]],
  ['waiter', 'Waiter', '🥂', 16000, 16, 10, FOOD_Q],
  ['lifeguard', 'Lifeguard', '🏊', 15000, 16, 20, SAFETY_Q],
  ['car-wash', 'Car Wash Attendant', '🚗', 12000, 16, 0, SERVICE_Q],

  // ----- No degree, adult -----
  ['janitor', 'Janitor', '🧹', 22000, 18, 0, SERVICE_Q],
  ['warehouse-worker', 'Warehouse Worker', '📦', 25000, 18, 0, TRADE_Q],
  ['factory-worker', 'Factory Worker', '🏭', 27000, 18, 0, TRADE_Q],
  ['garbage-collector', 'Garbage Collector', '🗑️', 26000, 18, 0, [
    q('Which of these belongs in the recycling bin?', ['A plastic bottle', 'A banana peel', 'A dead battery']),
    q('When do garbage trucks usually run?', ['Early morning', 'Midnight', 'Whenever']),
    q('What should you wear on the job?', ['High-visibility gear and gloves', 'Flip flops', 'A suit']),
    q('A bin is overflowing. You...', ['Empty it and report it', 'Leave it', 'Hide it']),
    q('Where does a glass jar go?', ['Glass recycling', 'The river', 'The compost']),
  ]],
  ['delivery-driver', 'Delivery Driver', '🚚', 22000, 18, 15, TRANSPORT_Q],
  ['courier', 'Bike Courier', '🚴', 20000, 18, 10, TRANSPORT_Q],
  ['taxi-driver', 'Taxi Driver', '🚕', 26000, 18, 15, TRANSPORT_Q],
  ['bus-driver', 'Bus Driver', '🚌', 34000, 21, 20, TRANSPORT_Q],
  ['truck-driver', 'Truck Driver', '🛻', 42000, 21, 20, TRANSPORT_Q],
  ['mail-carrier', 'Mail Carrier', '📮', 36000, 18, 15, TRANSPORT_Q],
  ['bartender', 'Bartender', '🍸', 24000, 21, 20, SERVICE_Q],
  ['barber', 'Barber', '💈', 27000, 18, 20, SERVICE_Q],
  ['hairdresser', 'Hairdresser', '💇', 28000, 18, 20, SERVICE_Q],
  ['florist', 'Florist', '💐', 24000, 18, 15, OUTDOOR_Q],
  ['landscaper', 'Landscaper', '🌳', 28000, 18, 10, OUTDOOR_Q],
  ['farmer', 'Farm Hand', '🚜', 26000, 18, 10, OUTDOOR_Q],
  ['fisherman', 'Deckhand', '🎣', 30000, 18, 10, OUTDOOR_Q],
  ['zookeeper', 'Zookeeper', '🦁', 30000, 18, 35, [
    q('Feeding schedules exist because animals...', ['Need regular meals', 'Like surprises', 'Can order takeout']),
    q('The lion enclosure gate is open. You...', ['Follow emergency protocol immediately', 'Take a selfie', 'Say hello']),
    q('Animal enclosures should be...', ['Clean and secure', 'Decorative', 'Open concept']),
    q('A visitor taps the glass. You...', ['Ask them politely to stop', 'Join in', 'Charge extra']),
    q('Sick animals are seen by...', ['The veterinarian', 'A magician', 'Nobody']),
  ]],
  ['vet-assistant', 'Veterinary Assistant', '🐾', 28000, 18, 30, CARE_Q],
  ['security-guard', 'Security Guard', '💂', 30000, 21, 20, SAFETY_Q],
  ['receptionist', 'Receptionist', '☎️', 28000, 18, 25, OFFICE_Q],
  ['call-center', 'Call Center Rep', '🎧', 26000, 18, 20, SERVICE_Q],
  ['data-entry', 'Data Entry Clerk', '⌨️', 27000, 18, 25, OFFICE_Q],
  ['office-clerk', 'Office Clerk', '🗂️', 30000, 18, 30, OFFICE_Q],
  ['sales-rep', 'Sales Rep', '📞', 38000, 18, 35, [
    q('A customer has an objection. Best first move?', ['Listen to it', 'Hang up', 'Talk louder']),
    q('What is a "lead" in sales?', ['A potential customer', 'A type of metal only', 'The office dog']),
    q('When is the deal actually done?', ['When the contract is signed', 'When you imagine it', 'Never']),
    q('Your product costs more than the rival’s. You...', ['Explain the extra value', 'Cry', 'Insult the rival']),
    q('A good salesperson mostly...', ['Asks questions and listens', 'Interrupts constantly', 'Avoids customers']),
  ]],
  ['real-estate', 'Real Estate Agent', '🏠', 45000, 21, 40, [
    q('"Location, location, ..."', ['Location', 'Vacation', 'Dalmatian']),
    q('An open house is for...', ['Showing the home to buyers', 'A sleepover', 'Airing it out']),
    q('The buyer asks about the leaky roof. You...', ['Disclose it honestly', 'Change the subject', 'Blame rain']),
    q('A property’s asking price is...', ['What the seller wants', 'A random number', 'Illegal to say']),
    q('Keys are handed over at...', ['Closing', 'First viewing', 'Halloween']),
  ]],
  ['line-cook', 'Line Cook', '👨‍🍳', 32000, 18, 25, FOOD_Q],
  ['baker', 'Baker', '🥖', 30000, 18, 20, FOOD_Q],
  ['butcher', 'Butcher', '🥩', 34000, 18, 20, FOOD_Q],
  ['head-chef', 'Head Chef', '🧑‍🍳', 55000, 25, 45, FOOD_Q],
  ['mechanic', 'Car Mechanic', '🔧', 34000, 18, 30, TRADE_Q],
  ['painter', 'House Painter', '🎨', 30000, 18, 10, TRADE_Q],
  ['carpenter', 'Carpenter', '🪚', 38000, 18, 30, TRADE_Q],
  ['roofer', 'Roofer', '🏚️', 36000, 18, 20, TRADE_Q],
  ['welder', 'Welder', '⚙️', 42000, 18, 35, TRADE_Q],
  ['plumber', 'Plumber', '🚿', 42000, 18, 35, [
    q('Water is gushing from a burst pipe. First step?', ['Shut off the main water valve', 'Take a photo', 'Open more taps']),
    q('What unclogs a toilet?', ['A plunger', 'A hairdryer', 'More paper']),
    q('Hot water pipes are usually marked...', ['Red', 'Polka dot', 'Invisible']),
    q('A tap drips at night. That means...', ['A worn washer or seal', 'Rain indoors', 'It’s thirsty']),
    q('What seals threaded pipe joints?', ['Plumber’s tape', 'Chewing gum', 'Hope']),
  ]],
  ['electrician', 'Electrician', '⚡', 46000, 18, 40, [
    q('Before working on a circuit you...', ['Turn off the power', 'Wet your hands', 'Hum loudly']),
    q('What protects a circuit from overload?', ['A fuse or breaker', 'A rubber band', 'A candle']),
    q('Electricity and water are...', ['A dangerous mix', 'Best friends', 'The same thing']),
    q('Which material conducts electricity?', ['Copper', 'Wood', 'Glass']),
    q('A flickering light usually means...', ['A loose connection or bad bulb', 'Ghosts', 'Disco mode']),
  ]],
  ['personal-trainer', 'Personal Trainer', '💪', 34000, 18, 30, [
    q('Before heavy exercise, clients should...', ['Warm up', 'Nap', 'Eat cake']),
    q('Good form prevents...', ['Injuries', 'Fun', 'Music']),
    q('A client is exhausted mid-set. You...', ['Let them rest', 'Add weight', 'Leave']),
    q('Muscles grow with training and...', ['Rest and nutrition', 'Luck', 'Osmosis']),
    q('Hydration during workouts is...', ['Important', 'Cheating', 'Rude']),
  ]],
  ['flight-attendant', 'Flight Attendant', '✈️', 40000, 21, 40, SAFETY_Q],
  ['firefighter', 'Firefighter', '🚒', 45000, 18, 40, SAFETY_Q],
  ['police-officer', 'Police Officer', '👮', 48000, 21, 45, [
    q('Someone reports a stolen bike. First step?', ['Take a report and gather details', 'Arrest the bike', 'Ignore them']),
    q('What do you read a suspect when arresting them?', ['Their rights', 'A bedtime story', 'The menu']),
    q('A traffic stop begins with...', ['Flashing lights to pull the car over', 'A high five', 'A race']),
    q('Evidence at a crime scene should be...', ['Preserved and documented', 'Taken home', 'Rearranged']),
    q('What is a patrol?', ['Regularly moving through an area', 'A nap', 'A parade']),
  ]],
  ['photographer', 'Photographer', '📷', 32000, 18, 30, CREATIVE_Q],
  ['tattoo-artist', 'Tattoo Artist', '🖋️', 36000, 21, 30, CREATIVE_Q],
  ['dj', 'Club DJ', '🎧', 30000, 21, 25, CREATIVE_Q],
  ['musician', 'Session Musician', '🎸', 28000, 18, 30, CREATIVE_Q],
  ['actor', 'Stage Actor', '🎭', 26000, 18, 30, CREATIVE_Q],
  ['influencer', 'Content Creator', '🤳', 24000, 18, 25, CREATIVE_Q],

  // ----- Any degree (with promotion ladders) -----
  ['office-manager', 'Office Manager', '🗄️', 52000, 22, 50, OFFICE_Q, true, undefined, ['Office Assistant', 'Office Manager', 'Senior Manager', 'Operations Director']],
  ['hr-manager', 'HR Manager', '🤝', 58000, 22, 55, OFFICE_Q, true, undefined, ['HR Associate', 'HR Manager', 'Senior HR Manager', 'Head of People']],
  ['journalist', 'Journalist', '🗞️', 45000, 22, 60, CREATIVE_Q, true, undefined, ['Junior Reporter', 'Journalist', 'Senior Journalist', 'Editor-in-Chief']],
  ['librarian', 'Librarian', '📚', 42000, 22, 55, EDU_Q, true, undefined, ['Library Assistant', 'Librarian', 'Senior Librarian', 'Head Librarian']],

  // ----- Major-locked careers (age gate waived once you hold the degree) -----
  ['nurse', 'Nurse', '💉', 54000, 22, 55, CARE_Q, true, 'nursing', ['Junior Nurse', 'Nurse', 'Senior Nurse', 'Head Nurse']],
  ['midwife', 'Midwife', '🤱', 56000, 22, 60, CARE_Q, true, 'nursing', ['Junior Midwife', 'Midwife', 'Senior Midwife', 'Lead Midwife']],
  ['paramedic', 'Paramedic', '🚑', 48000, 22, 50, CARE_Q, true, 'nursing', ['Trainee Paramedic', 'Paramedic', 'Senior Paramedic', 'Paramedic Supervisor']],
  ['teacher', 'Teacher', '🏫', 48000, 22, 60, EDU_Q, true, 'education', ['Trainee Teacher', 'Teacher', 'Senior Teacher', 'Head of Department']],
  ['principal', 'School Principal', '🎓', 72000, 22, 70, EDU_Q, true, 'education', ['Vice Principal', 'Principal', 'District Principal', 'Superintendent']],
  ['professor', 'University Professor', '👨‍🏫', 85000, 22, 80, EDU_Q, true, 'education', ['Assistant Professor', 'Associate Professor', 'Professor', 'Dean']],
  ['accountant', 'Accountant', '🧾', 62000, 22, 65, FINANCE_Q, true, 'business', ['Junior Accountant', 'Accountant', 'Senior Accountant', 'Finance Director']],
  ['financial-analyst', 'Financial Analyst', '📊', 70000, 22, 68, FINANCE_Q, true, 'business', ['Junior Analyst', 'Financial Analyst', 'Senior Analyst', 'Head of Analysis']],
  ['marketing-manager', 'Marketing Manager', '📣', 68000, 22, 60, FINANCE_Q, true, 'business', ['Marketing Associate', 'Marketing Manager', 'Senior Manager', 'Chief Marketing Officer']],
  ['banker', 'Banker', '🏦', 75000, 22, 65, FINANCE_Q, true, 'business', ['Associate Banker', 'Banker', 'Senior Banker', 'VP of Banking']],
  ['investment-banker', 'Investment Banker', '💰', 120000, 22, 75, FINANCE_Q, true, 'business', ['Analyst', 'Associate', 'Vice President', 'Managing Director']],
  ['web-developer', 'Web Developer', '🌐', 70000, 22, 65, TECH_Q, true, 'computer-science', ['Junior Web Dev', 'Web Developer', 'Senior Web Dev', 'Lead Web Dev']],
  ['software-dev', 'Software Developer', '💻', 85000, 22, 70, TECH_Q, true, 'computer-science', ['Junior Developer', 'Software Developer', 'Senior Developer', 'Principal Engineer']],
  ['game-developer', 'Game Developer', '🎮', 78000, 22, 70, TECH_Q, true, 'computer-science', ['Junior Game Dev', 'Game Developer', 'Senior Game Dev', 'Lead Game Dev']],
  ['data-scientist', 'Data Scientist', '🧮', 95000, 22, 75, TECH_Q, true, 'computer-science', ['Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Head of Data']],
  ['cybersecurity', 'Cybersecurity Analyst', '🛡️', 90000, 22, 72, TECH_Q, true, 'computer-science', ['Security Analyst', 'Senior Analyst', 'Security Lead', 'Chief Security Officer']],
  ['civil-engineer', 'Civil Engineer', '🌉', 78000, 22, 72, TRADE_Q, true, 'engineering', ['Junior Engineer', 'Civil Engineer', 'Senior Engineer', 'Principal Engineer']],
  ['mechanical-engineer', 'Mechanical Engineer', '⚙️', 80000, 22, 72, TRADE_Q, true, 'engineering', ['Junior Engineer', 'Mechanical Engineer', 'Senior Engineer', 'Principal Engineer']],
  ['electrical-engineer', 'Electrical Engineer', '🔌', 82000, 22, 73, TRADE_Q, true, 'engineering', ['Junior Engineer', 'Electrical Engineer', 'Senior Engineer', 'Principal Engineer']],
  ['aerospace-engineer', 'Aerospace Engineer', '🚀', 98000, 22, 80, SCIENCE_Q, true, 'engineering', ['Junior Engineer', 'Aerospace Engineer', 'Senior Engineer', 'Chief Engineer']],
  ['architect', 'Architect', '📐', 85000, 22, 75, CREATIVE_Q, true, 'architecture', ['Junior Architect', 'Architect', 'Senior Architect', 'Principal Architect']],
  ['urban-planner', 'Urban Planner', '🏙️', 68000, 22, 68, OFFICE_Q, true, 'architecture', ['Junior Planner', 'Urban Planner', 'Senior Planner', 'Head of Planning']],
  ['lab-tech', 'Lab Technician', '🧪', 52000, 22, 60, SCIENCE_Q, true, 'science', ['Junior Technician', 'Lab Technician', 'Senior Technician', 'Lab Manager']],
  ['biologist', 'Biologist', '🧬', 68000, 22, 70, SCIENCE_Q, true, 'science', ['Research Assistant', 'Biologist', 'Senior Biologist', 'Lead Scientist']],
  ['chemist', 'Chemist', '⚗️', 72000, 22, 72, SCIENCE_Q, true, 'science', ['Research Assistant', 'Chemist', 'Senior Chemist', 'Lead Scientist']],
  ['meteorologist', 'Meteorologist', '🌦️', 65000, 22, 68, SCIENCE_Q, true, 'science', ['Junior Meteorologist', 'Meteorologist', 'Senior Meteorologist', 'Chief Meteorologist']],
  ['graphic-designer', 'Graphic Designer', '🖌️', 52000, 22, 50, CREATIVE_Q, true, 'arts', ['Junior Designer', 'Graphic Designer', 'Senior Designer', 'Creative Director']],
  ['author', 'Author', '✍️', 45000, 22, 60, CREATIVE_Q, true, 'arts', ['Aspiring Author', 'Author', 'Bestselling Author', 'Literary Legend']],
  ['film-director', 'Film Director', '🎥', 75000, 22, 65, CREATIVE_Q, true, 'arts', ['Assistant Director', 'Film Director', 'Acclaimed Director', 'Legendary Director']],
  ['paralegal', 'Paralegal', '📋', 52000, 22, 60, LAW_Q, true, 'law', ['Junior Paralegal', 'Paralegal', 'Senior Paralegal', 'Lead Paralegal']],
  ['lawyer', 'Lawyer', '⚖️', 110000, 22, 80, LAW_Q, true, 'law', ['Associate Lawyer', 'Lawyer', 'Senior Lawyer', 'Partner']],
  ['judge', 'Judge', '👨‍⚖️', 150000, 22, 88, LAW_Q, true, 'law', ['Magistrate', 'Judge', 'Senior Judge', 'Chief Justice']],
  ['pharmacist', 'Pharmacist', '💊', 105000, 22, 80, CARE_Q, true, 'medicine', ['Junior Pharmacist', 'Pharmacist', 'Senior Pharmacist', 'Chief Pharmacist']],
  ['dentist', 'Dentist', '🦷', 130000, 22, 82, CARE_Q, true, 'medicine', ['Associate Dentist', 'Dentist', 'Senior Dentist', 'Practice Owner']],
  ['veterinarian', 'Veterinarian', '🐕‍🦺', 95000, 22, 78, CARE_Q, true, 'medicine', ['Junior Vet', 'Veterinarian', 'Senior Vet', 'Practice Owner']],
  ['psychiatrist', 'Psychiatrist', '🛋️', 140000, 22, 85, CARE_Q, true, 'medicine', ['Resident Psychiatrist', 'Psychiatrist', 'Senior Psychiatrist', 'Chief Psychiatrist']],
  ['doctor', 'Doctor', '🩻', 160000, 22, 88, [
    q('What organ pumps blood?', ['The heart', 'The elbow', 'The hair']),
    q('An X-ray is used to see...', ['Bones', 'The future', 'Wi-Fi']),
    q('A patient has a fever. Their temperature is...', ['Higher than normal', 'Lower than normal', 'Purple']),
    q('What do you do first in an emergency?', ['Check the patient is breathing', 'Update your status', 'Order lunch']),
    q('Antibiotics treat...', ['Bacterial infections', 'Broken hearts', 'Bad luck']),
  ], true, 'medicine', ['Resident Doctor', 'Doctor', 'Senior Doctor', 'Chief of Medicine']],
  ['surgeon', 'Surgeon', '🔪', 220000, 22, 92, CARE_Q, true, 'medicine', ['Surgical Resident', 'Surgeon', 'Senior Surgeon', 'Chief Surgeon']],

  // ----- New major-locked careers -----
  ['psychologist', 'Psychologist', '🧠', 82000, 22, 72, CARE_Q, true, 'psychology', ['Trainee Psychologist', 'Psychologist', 'Senior Psychologist', 'Clinical Director']],
  ['counselor', 'Counselor', '🫂', 46000, 22, 55, CARE_Q, true, 'psychology', ['Junior Counselor', 'Counselor', 'Senior Counselor', 'Lead Counselor']],
  ['economist', 'Economist', '💹', 90000, 22, 74, FINANCE_Q, true, 'economics', ['Junior Economist', 'Economist', 'Senior Economist', 'Chief Economist']],
  ['actuary', 'Actuary', '📐', 100000, 22, 78, FINANCE_Q, true, 'mathematics', ['Trainee Actuary', 'Actuary', 'Senior Actuary', 'Chief Actuary']],
  ['statistician', 'Statistician', '📊', 76000, 22, 74, SCIENCE_Q, true, 'mathematics', ['Junior Statistician', 'Statistician', 'Senior Statistician', 'Head of Statistics']],
  ['physicist', 'Physicist', '🔭', 92000, 22, 82, SCIENCE_Q, true, 'physics', ['Research Assistant', 'Physicist', 'Senior Physicist', 'Lead Physicist']],
  ['astronomer', 'Astronomer', '🌌', 86000, 22, 80, SCIENCE_Q, true, 'physics', ['Junior Astronomer', 'Astronomer', 'Senior Astronomer', 'Observatory Director']],
  ['pr-manager', 'PR Manager', '📢', 62000, 22, 55, SOCIAL_Q, true, 'communications', ['PR Associate', 'PR Manager', 'Senior PR Manager', 'Head of Comms']],
  ['news-anchor', 'News Anchor', '📺', 78000, 22, 60, SOCIAL_Q, true, 'communications', ['Field Reporter', 'News Anchor', 'Prime-Time Anchor', 'Network Star']],
  ['diplomat', 'Diplomat', '🕊️', 90000, 22, 72, SOCIAL_Q, true, 'political-science', ['Attaché', 'Diplomat', 'Senior Diplomat', 'Ambassador']],
  ['politician', 'Politician', '🏛️', 80000, 25, 66, SOCIAL_Q, true, 'political-science', ['City Councillor', 'Mayor', 'Governor', 'Head of State']],
  ['physiotherapist', 'Physiotherapist', '🩹', 62000, 22, 62, SPORT_Q, true, 'sports-science', ['Junior Physio', 'Physiotherapist', 'Senior Physio', 'Head Physio']],
  ['sports-coach', 'Sports Coach', '🏋️', 58000, 22, 50, SPORT_Q, true, 'sports-science', ['Assistant Coach', 'Head Coach', 'Elite Coach', 'Championship Coach']],
  ['nutritionist', 'Nutritionist', '🥗', 52000, 22, 58, SPORT_Q, true, 'sports-science', ['Junior Nutritionist', 'Nutritionist', 'Senior Nutritionist', 'Lead Nutritionist']],
  ['music-teacher', 'Music Teacher', '🎼', 45000, 22, 50, EDU_Q, true, 'music', ['Trainee Tutor', 'Music Teacher', 'Senior Music Teacher', 'Head of Music']],
  ['composer', 'Composer', '🎹', 60000, 22, 62, CREATIVE_Q, true, 'music', ['Aspiring Composer', 'Composer', 'Renowned Composer', 'Maestro']],
]

/**
 * Fame careers. You don't apply on the job board — you try out, and a
 * roll on `auditionStat` (vs `auditionMin`) decides whether you make it.
 * Salaries are high and climb steeply as you rise to stardom.
 */
export const SPECIAL_JOBS: Job[] = [
  {
    id: 'basketball-player',
    title: 'Basketball Player',
    emoji: '🏀',
    salary: 150000,
    minAge: 16,
    minSmarts: 0,
    questions: [],
    special: true,
    auditionStat: 'health',
    auditionMin: 60,
    tiers: ['Rookie', 'Starter', 'All-Star', 'Hall of Famer'],
  },
  {
    id: 'football-player',
    title: 'Football Player',
    emoji: '⚽',
    salary: 150000,
    minAge: 16,
    minSmarts: 0,
    questions: [],
    special: true,
    auditionStat: 'health',
    auditionMin: 60,
    tiers: ['Academy Prospect', 'Pro Footballer', 'Star Player', 'Legend'],
  },
  {
    id: 'singer',
    title: 'Singer',
    emoji: '🎤',
    salary: 90000,
    minAge: 16,
    minSmarts: 0,
    questions: [],
    special: true,
    auditionStat: 'looks',
    auditionMin: 50,
    tiers: ['Bar Singer', 'Recording Artist', 'Chart-Topper', 'Music Icon'],
  },
  {
    id: 'actor',
    title: 'Actor',
    emoji: '🎬',
    salary: 90000,
    minAge: 16,
    minSmarts: 0,
    questions: [],
    special: true,
    auditionStat: 'looks',
    auditionMin: 55,
    tiers: ['Extra', 'TV Actor', 'Movie Star', 'Hollywood Legend'],
  },
]

export const JOBS: Job[] = [
  ...ROWS.map(
    ([id, title, emoji, salary, minAge, minSmarts, questions, requiresDegree, requiredMajor, tiers]) => ({
      id,
      title,
      emoji,
      salary,
      minAge,
      minSmarts,
      questions,
      ...(requiresDegree ? { requiresDegree } : {}),
      ...(requiredMajor ? { requiredMajor } : {}),
      ...(tiers ? { tiers } : {}),
    }),
  ),
  ...SPECIAL_JOBS,
]
