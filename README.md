# Simlife

A life-simulation game. **The full game lives in [`mobile/`](mobile/)** — a React Native (Expo) app that runs on iOS, Android, and the web (via react-native-web). It has countries, careers, school, relationships, activities, belongings, and more.

> 🌐 **The deployed website builds the mobile app for web.** `vercel.json` at the repo root points Vercel at `mobile/` (`expo export --platform web`), so the live site is the same full game you play on your phone — not the legacy Vite app below.

> 🧪 **Legacy Vite app (this directory, `src/`):** the original minimal scaffold (Age-Up loop + events only). It's kept for reference but is no longer what gets deployed. Run the real game from `mobile/`.

## ⚠️ Building for iOS / Android — always run EAS from `mobile/`

This repo root is **not** an Expo project (no `expo`/`react-native` dependency), so
`eas build` here will build the legacy Vite app and the **iOS build fails immediately**.
Every EAS command must run inside `mobile/`:

```bash
cd mobile
npx eas build --platform ios --profile production
npx eas submit --platform ios --latest
```

If you ever ran `eas init`/`eas build` from the repo root, delete the stray `app.json`,
`eas.json` and `.expo/` it left **at the root** (the real ones live in `mobile/`) —
otherwise EAS keeps picking up the wrong project. The mobile app is `GitLife`
(slug `gitlife`, bundle id `com.giorgosstrata.gitlife`); a build log showing any
other slug or bundle id means it ran from the wrong directory.

---

## Legacy Vite app

Live a randomized life one year at a time: hit **Age Up**, face a random life event with 2–3 choices, and watch your stats and life story evolve. Progress is saved to `localStorage` automatically, so your life persists between sessions.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

Other scripts:

- `npm run build` — type-check and produce a production build in `dist/`
- `npm run preview` — serve the production build locally

## How the game works

- **Character creation** — new lives start on a creation screen: pick or randomize a name, reroll your birth stats, then start life.
- **Stats** — four 0–100 attributes (Health, Happiness, Smarts, Looks) plus Money, which is an open-ended currency amount. Stats are rolled randomly at birth.
- **Age Up** — a fixed floating button; advances one year, applies late-life health decline, then draws a random event eligible for your age. Events pop up as a modal (the layout underneath never moves) and must be resolved before aging again.
- **Events** — each event offers 2–3 choices; each choice applies stat/money effects and writes an outcome line to the life log. Events don't repeat until the eligible pool for your age is exhausted.
- **Death** — health reaching 0 ends the life, and past age 70 an old-age mortality roll kicks in. A "Start a New Life" button rerolls a fresh character.
- **Saving** — the whole game state is persisted via Zustand's `persist` middleware under the `simlife-save` localStorage key.

## Project structure

```
src/
  types.ts              # Shared types: Stats, GameEvent, EventChoice, LogEntry
  data/events.ts        # Event content — add new events here, no logic changes needed
  store/gameStore.ts    # Zustand store: game state, ageUp/chooseOption/startNewLife
  components/
    CharacterCreation.tsx # New-life screen: name inputs + stat reroll
    StatsPanel.tsx        # Stat bars + money badge
    StatBar.tsx           # Single labeled progress bar
    EventModal.tsx        # Popup event dialog with choice buttons
    GameOverModal.tsx     # Death overlay with new-life button
    LifeLog.tsx           # Scrollable, auto-scrolling life history
  App.tsx                 # Layout, header (name/age/year), fixed Age Up button
```

## Adding events

Append entries to `EVENTS` in `src/data/events.ts`:

```ts
{
  id: 'unique-slug',
  title: 'Headline',
  description: 'The situation the player faces.',
  minAge: 18,
  maxAge: 65,
  choices: [
    { label: 'Option A', outcome: 'What happened.', effects: { happiness: 5, money: -100 } },
    { label: 'Option B', outcome: 'What happened instead.', effects: { health: -3 } },
  ],
}
```

`effects` accepts any subset of `health`, `happiness`, `smarts`, `looks` (clamped to 0–100) and `money`.
