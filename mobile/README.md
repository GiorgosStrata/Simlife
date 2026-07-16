# Simlife Mobile (iOS / Expo)

The React Native version of Simlife, built with Expo (SDK 57). Same game as the web app — character creation, Age Up loop, popup event choices, persistent saves — with saves stored in AsyncStorage instead of localStorage.

## Running on iOS

```bash
cd mobile
npm install
npm run ios        # opens in the iOS Simulator (requires macOS + Xcode)
```

No Mac? Run `npm start` and scan the QR code with the [Expo Go](https://expo.dev/go) app on your iPhone.

There's also a web target (`npm run web`) via react-native-web, used mainly for automated verification.

## Building for the App Store

The app is configured with bundle identifier `com.giorgosstrata.simlife`. Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build --platform ios
```

## Structure

```
App.tsx                   # Layout, header, tabs, fixed cyan Age Up button, hydration gate
src/
  theme.ts                # Color palette (mirrors the web app's Tailwind colors)
  types.ts                # Shared types (same as web)
  data/events.ts          # Event content (same as web) — add new events here
  data/jobs.ts            # Job listings for the Career tab — add new jobs here
  store/gameStore.ts      # Zustand store, persisted to AsyncStorage (v2 saves)
  components/
    CharacterCreation.tsx # New-life screen: name inputs + stat reroll
    StatsPanel.tsx        # Stat bars + money badge
    StatBar.tsx           # Single labeled progress bar
    TabBar.tsx            # Career / Life / Love bottom tabs
    CareerScreen.tsx      # Education, university, current job, job listings
    RelationshipsScreen.tsx # Family/partner cards: spend time, gift, love actions
    EventModal.tsx        # Slide-up event popup with choice buttons
    GameOverModal.tsx     # Death overlay with new-life button
    LifeLog.tsx           # Auto-scrolling FlatList life history
```

## Game systems

- **Countries** — character creation includes every country with its flag (`src/data/countries.ts`). Flags render as real SVG images at a fixed 3:2 aspect ratio (`Flag.tsx`, via `country-flag-icons` + `react-native-svg`), so they look identical on iOS and web (emoji flags don't render on Android/web). Each country has a salary multiplier derived from real World Bank GNI-per-capita data, calibrated to US-level base salaries: a Doctor earns ~$160k in the US, ~$95k in Germany, ~$8k in Tunisia.
- **Activities tab (Do)** — four categories (`src/data/activities.ts`). **Sport / Mind / Hobbies** are ongoing pursuits: pick one per category and the character keeps doing it every year (no re-picking), boosting a stat and quietly costing money each year from age 18 (the "hidden" cost, country-scaled). Sport (gym, basketball, soccer, running) boosts health; Mind (read books, learn a language, meditate, chess) boosts smarts/happiness; Hobbies (painting, guitar, cooking, gardening) vary. **Learning a language** takes 5 years and pops a "Fluent in X!" notification when done. **Crime** (pickpocket, rob a store, run a scam, steal a car, murder) is one-off per year with a chance of getting caught — get away with a cash payout, or get caught for a heavy fine and a criminal record.
- **Belongings tab (Shop)** — `src/data/assets.ts`: buy cars (24), phones (9), homes (8), and luxury items (5), all with original parody names to avoid trademarks ("DMW Series 3", "Bercedes C-Klass", "Pear Phone 12", "Lambogotti Toro"). The shop is a category-tabbed modal; owned items show a net-worth total and resell for ~50%.
- **Avatars** — every character has a BitLife-style flat-vector face rendered as SVG (`src/components/Avatar.tsx`, generated deterministically from a name seed in `src/data/avatar.ts`), so the same person always looks the same. Faces vary by **6 skin tones**, hair colour + style (masculine caps for men; long/bob/ponytail/bun for women; greying with age; wispy/bald for babies), eyes, eyebrows, mouth, optional facial hair for men, and rosy cheeks for kids and women (eyelashes + lip colour make gender read at a glance). Avatars appear in the header, on every relationship/classroom/workplace row, in the person sheet, on Cinder dating cards, and as a live preview on the character-creation screen. A matched Cinder profile keeps its face when they become your partner.
- **Names & gender** — pick Male/Female at creation. Names come from `src/data/names.ts`: ~19 cultural pools (25 male + 25 female first names and 25 surnames each) mapped to every country, so a Japanese character gets Japanese names and so does their family. Friends lean ~70% toward the player's gender; partners are the opposite gender for now (sexuality options planned); labels and avatars are gendered (Boyfriend/Girlfriend, Husband/Wife, Brother/Sister).
- **Interaction limits** — every relationship action (spend time, compliment, gift, pocket money, date) works once per person per year, resetting on each birthday, BitLife style.
- **Submenu pattern** — list rows open detail sheets (BitLife style): the school row opens your school (study + a classroom of 4 classmates and 2 teachers — befriend classmates at 60+ bond), the job row opens your **workplace** (work harder, ask for a raise — up to +50% salary, odds scale with boss bond — plus 3 coworkers and a boss to interact with), any person row opens their interaction sheet, "Find a job" opens the job board. Classrooms rotate per stage; workplaces rotate per job.
- **Role-specific interactions** — everyone: spend time, compliment, gift, insult (they might clap back). Parents: pocket money (under 18), life advice (+smarts). Siblings: pranks (50/50). Friends: movies. Classmates: study together, become friends. Teachers: extra help. Coworkers/boss: grab lunch. Partner: dates, weekend getaways, proposal, marriage, breakup/divorce. All once per person per year.
- **School names** — generated per country from `src/data/schools.ts` ("Palm Street High School", "Sakura Middle School", "University of Ubuntu"), using the same cultural pools as names.

- **Economy** (`src/data/economy.ts`) — you keep less than your salary. Every year from 19 you pay country-scaled living costs (~$20k/yr US base), plus per-friend and per-partner costs (relationships cost more the more serious), plus yearly upkeep on cars/homes/luxury. Balances can go **negative (debt)**, which grows 5%/year until repaid. Tuition is country-scaled too (~$18k/yr US). All of it uses the same country multiplier as salaries.
- **Job tiers & promotions** — professional careers (doctor, lawyer, finance, engineering, etc.) have promotion ladders in `src/data/jobs.ts` (`tiers`). You start at the entry tier (e.g. "Resident Doctor") and get promoted up (→ Doctor → Senior Doctor → Chief of Medicine) every 3 years, each promotion adding 40% to salary. Degree-locked jobs no longer have an age gate — hold the matching degree and you can start straight out of university.
- **Education/Career tab** (labeled Education until working age 16) — while in school (6–17) or university, once-per-year school actions: study harder (+smarts), hang out with classmates (+happiness, chance of a new friend), ask a teacher for help. At 18 a **graduation popup** offers university / job / gap year. **University requires picking a major** (`src/data/majors.ts`) and having the grades for it — Medicine wants 85 smarts, Arts takes 40. Some jobs are locked to a specific major (Doctor needs Medicine, Lawyer needs Law...), some take any degree. **76 jobs** live in `src/data/jobs.ts`, but only a rotating batch of 9 is hiring each year. **Applying asks one random interview question** (5 per job) — right answer hires you, wrong answer logs the flub and you can retry. Salary is paid automatically every Age Up.
- **Love tab** — parents (and often a sibling) at birth; friends via "Make a new friend" (once/year, max 4) or hanging out with classmates. Actions: spend time, gift, ask parents for pocket money (under 18, once/year each), date your partner, propose at 70+ bond, marry, break up/divorce. Family ages and eventually passes away.
- **Phone & apps** — once you own a phone (buy one in the Shop), a **📱 Phone** row at the top of the Love tab opens a home screen of apps (`PhoneModal`, `SocialModal`, `DatingModal`, `InvestingModal`; store logic in `gameStore.ts`). Two social platforms — **Rizzgram** (Instagram-like) and **FlickTok** (TikTok-like) — let you post once a year to grow followers (small viral jackpot, occasional flop), then **monetize** brand deals once past 10k followers (country-scaled payout). **Cinder** is a Tinder-style dating app: swipe (👎/❤️) through generated profiles and, on a mutual match, start dating them. **Vestr** is an investing placeholder for a future update. Without a phone the row is disabled with a hint to buy one.
- **Sounds & VFX** — a full library of ~19 synthesized, deliberately pleasant effects (expo-audio) covering the whole game, BitLife style: taps and popups, a coin *ching* for money, a *level-up* for promotions/raises, a graduation fanfare, a dating-match chime, wedding bells, a newborn twinkle, a car *honk* when you buy a car, a gym thump when you take up a sport, a sneaky crime cue and a police siren when you're caught, a thud for throwing/taking a hit, a heartbreak sting for breakups, and a somber toll for death. All are generated by a dependency-free Python synth (`scripts/gen_sfx.py` → `assets/sfx/*.wav`); playback and the effect list live in `src/audio/sfx.ts`. Outcome sounds fire from the store so they match what actually happened (viral post vs. flop, crime caught vs. clean), and event choices can name their own sound via an optional `sfx` field. On the visual side the Age button gently pulses and each event's illustration springs in with a little wiggle.
- **Settings (⚙️ in the header)** — sound volume (Off/Low/Medium/High, persisted across lives) and a confirm-guarded character reset.
- Events, stats, aging, and death work as on the web version. Scripted moments (graduation, parents divorcing) live in `src/data/specialEvents.ts`.
- **Random events** — every event card shows a big illustration emoji (`emoji` field). ~45 events including edgier BitLife-style ones (schoolyard bully picking a fight, a drug dealer's shady offer, getting mugged, viral videos, jury duty, speeding tickets), **illnesses** (flu, food poisoning, broken arm, appendicitis — see a doctor or tough it out), and a scripted **parents-divorce** event that fires once in childhood and drops both parents' bonds.

The game content (`types.ts`, `data/events.ts`) is kept identical to the web app's `src/` — if you add events, copy the file between the two apps. The career/relationship systems are currently mobile-only.
