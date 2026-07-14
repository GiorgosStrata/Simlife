# Simlife

A life-simulation game built with React + TypeScript + Vite, Tailwind CSS, and Zustand.

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

- **Stats** — four 0–100 attributes (Health, Happiness, Smarts, Looks) plus Money, which is an open-ended currency amount. Stats are rolled randomly at birth.
- **Age Up** — advances one year, applies late-life health decline, then draws a random event eligible for your age. You must resolve the event before aging again.
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
    StatsPanel.tsx      # Stat bars + money badge
    StatBar.tsx         # Single labeled progress bar
    EventCard.tsx       # Current event with choice buttons
    LifeLog.tsx         # Scrollable, auto-scrolling life history
  App.tsx               # Layout, header (name/age/year), Age Up / game-over UI
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
