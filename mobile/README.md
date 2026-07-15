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
- **Activities tab (Do)** — `src/data/activities.ts`: gym, runs, meditation, library, hobbies, spa, makeover, doctor, vacation, volunteering, clubbing, casino (random win/loss), plastic surgery (big looks, small risk). One per year each, age-gated, with money costs and stat effects.
- **Belongings tab (Shop)** — `src/data/assets.ts`: buy cars (24), phones (9), homes (8), and luxury items (5), all with original parody names to avoid trademarks ("DMW Series 3", "Bercedes C-Klass", "Pear Phone 12", "Lambogotti Toro"). The shop is a category-tabbed modal; owned items show a net-worth total and resell for ~50%.
- **Names & gender** — pick Male/Female at creation. Names come from `src/data/names.ts`: ~19 cultural pools (25 male + 25 female first names and 25 surnames each) mapped to every country, so a Japanese character gets Japanese names and so does their family. Friends lean ~70% toward the player's gender; partners are the opposite gender for now (sexuality options planned); labels and avatars are gendered (Boyfriend/Girlfriend, Husband/Wife, Brother/Sister).
- **Interaction limits** — every relationship action (spend time, compliment, gift, pocket money, date) works once per person per year, resetting on each birthday, BitLife style.
- **Submenu pattern** — list rows open detail sheets (BitLife style): the school row opens your school (study + a classroom of 4 classmates and 2 teachers — befriend classmates at 60+ bond), the job row opens your **workplace** (work harder, ask for a raise — up to +50% salary, odds scale with boss bond — plus 3 coworkers and a boss to interact with), any person row opens their interaction sheet, "Find a job" opens the job board. Classrooms rotate per stage; workplaces rotate per job.
- **Role-specific interactions** — everyone: spend time, compliment, gift, insult (they might clap back). Parents: pocket money (under 18), life advice (+smarts). Siblings: pranks (50/50). Friends: movies. Classmates: study together, become friends. Teachers: extra help. Coworkers/boss: grab lunch. Partner: dates, weekend getaways, proposal, marriage, breakup/divorce. All once per person per year.
- **School names** — generated per country from `src/data/schools.ts` ("Palm Street High School", "Sakura Middle School", "University of Ubuntu"), using the same cultural pools as names.

- **Economy** (`src/data/economy.ts`) — you keep less than your salary. Every year from 19 you pay country-scaled living costs (~$20k/yr US base), plus per-friend and per-partner costs (relationships cost more the more serious), plus yearly upkeep on cars/homes/luxury. Balances can go **negative (debt)**, which grows 5%/year until repaid. Tuition is country-scaled too (~$18k/yr US). All of it uses the same country multiplier as salaries.
- **Job tiers & promotions** — professional careers (doctor, lawyer, finance, engineering, etc.) have promotion ladders in `src/data/jobs.ts` (`tiers`). You start at the entry tier (e.g. "Resident Doctor") and get promoted up (→ Doctor → Senior Doctor → Chief of Medicine) every 3 years, each promotion adding 40% to salary. Degree-locked jobs no longer have an age gate — hold the matching degree and you can start straight out of university.
- **Education/Career tab** (labeled Education until working age 16) — while in school (6–17) or university, once-per-year school actions: study harder (+smarts), hang out with classmates (+happiness, chance of a new friend), ask a teacher for help. At 18 a **graduation popup** offers university / job / gap year. **University requires picking a major** (`src/data/majors.ts`) and having the grades for it — Medicine wants 85 smarts, Arts takes 40. Some jobs are locked to a specific major (Doctor needs Medicine, Lawyer needs Law...), some take any degree. **76 jobs** live in `src/data/jobs.ts`, but only a rotating batch of 9 is hiring each year. **Applying asks one random interview question** (5 per job) — right answer hires you, wrong answer logs the flub and you can retry. Salary is paid automatically every Age Up.
- **Love tab** — parents (and often a sibling) at birth; friends via "Make a new friend" (once/year, max 4) or hanging out with classmates. Actions: spend time, gift, ask parents for pocket money (under 18, once/year each), date your partner, propose at 70+ bond, marry, break up/divorce. Family ages and eventually passes away.
- **Sounds** — small synthesized effects (expo-audio) for taps, popups, wins, fails, and death; assets in `assets/sfx/`, playback in `src/audio/sfx.ts`.
- **Settings (⚙️ in the header)** — sound volume (Off/Low/Medium/High, persisted across lives) and a confirm-guarded character reset.
- Events, stats, aging, and death work as on the web version. Scripted moments (like graduation) live in `src/data/specialEvents.ts`.

The game content (`types.ts`, `data/events.ts`) is kept identical to the web app's `src/` — if you add events, copy the file between the two apps. The career/relationship systems are currently mobile-only.
