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
App.tsx                   # Layout, header, fixed cyan Age Up button, hydration gate
src/
  theme.ts                # Color palette (mirrors the web app's Tailwind colors)
  types.ts                # Shared types (same as web)
  data/events.ts          # Event content (same as web) — add new events here
  store/gameStore.ts      # Zustand store, persisted to AsyncStorage (v1 saves)
  components/
    CharacterCreation.tsx # New-life screen: name inputs + stat reroll
    StatsPanel.tsx        # Stat bars + money badge
    StatBar.tsx           # Single labeled progress bar
    EventModal.tsx        # Slide-up event popup with choice buttons
    GameOverModal.tsx     # Death overlay with new-life button
    LifeLog.tsx           # Auto-scrolling FlatList life history
```

The game logic (`types.ts`, `data/events.ts`, and the store minus its storage adapter) is intentionally identical to the web app's `src/` — if you add events, copy the file between the two apps.
