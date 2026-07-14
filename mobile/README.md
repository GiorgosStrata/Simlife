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

- **Career tab** — school is automatic through age 18; from 18 you can enroll in university (4 years, $5k/yr tuition, needs 30 smarts) to unlock degree jobs. Apply to any listing you qualify for (age/smarts/degree); salary is paid automatically every Age Up. Quit any time.
- **Love tab** — you're born with parents (and often a sibling). Bonds drift down a little each year; spend time or give gifts to keep them up. From 18, Find Love to date someone; at 70+ bond you can propose, then marry ($2,000 wedding). Divorce costs half your money. Family members age and eventually pass away.
- Events, stats, aging, and death work as on the web version.

The game content (`types.ts`, `data/events.ts`) is kept identical to the web app's `src/` — if you add events, copy the file between the two apps. The career/relationship systems are currently mobile-only.
