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

- **Career tab** — while in school (6–17) or university, a School section offers once-per-year actions: study harder (+smarts), hang out with classmates (+happiness, chance of a new friend), ask a teacher for help. At 18 a **graduation popup** offers university / job / gap year. University: 4 years, $5k/yr tuition, needs 30 smarts, unlocks degree jobs. **Applying to a job asks one random interview question** (easy, job-themed, 5 per job in `src/data/jobs.ts`) — right answer hires you, wrong answer logs the flub and you can retry. Salary is paid automatically every Age Up.
- **Love tab** — parents (and often a sibling) at birth; friends via "Make a new friend" (once/year, max 4) or hanging out with classmates. Actions: spend time, gift, ask parents for pocket money (under 18, once/year each), date your partner, propose at 70+ bond, marry, break up/divorce. Family ages and eventually passes away.
- **Sounds** — small synthesized effects (expo-audio) for taps, popups, wins, fails, and death; assets in `assets/sfx/`, playback in `src/audio/sfx.ts`.
- **Settings (⚙️ in the header)** — sound volume (Off/Low/Medium/High, persisted across lives) and a confirm-guarded character reset.
- Events, stats, aging, and death work as on the web version. Scripted moments (like graduation) live in `src/data/specialEvents.ts`.

The game content (`types.ts`, `data/events.ts`) is kept identical to the web app's `src/` — if you add events, copy the file between the two apps. The career/relationship systems are currently mobile-only.
