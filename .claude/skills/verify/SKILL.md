---
name: verify
description: Build, launch, and drive Simlife in a headless browser to verify changes at the UI surface.
---

# Verifying Simlife

Two apps share the same game logic: the web app at the repo root (Vite + React) and an Expo/React Native app in `mobile/`. The surface for both is the UI.

## mobile/ (Expo) — build & launch

No iOS simulator here; verify via the react-native-web target, which renders the same component tree:

```bash
cd mobile && npm install
npx tsc --noEmit
npx expo export --platform ios --output-dir /tmp/ios-export   # proves the native bundle compiles
npx expo export --platform web --output-dir <dir> && python3 -m http.server 4174 -d <dir>
```

Drive it like the web app (below), with RN-web differences: buttons need `getByRole('button')` (Pressables carry `accessibilityRole="button"`); Age Up disabled state is `aria-disabled`, the element never unmounts; name inputs are `[data-testid=first-name]` / `[data-testid=last-name]`; there's a brief AsyncStorage hydration spinner before the first screen; saves land in localStorage key `simlife-save` on web.

Mobile-only systems (v4 saves): bottom tabs (`aria-label` "Education tab" under age 16, "Career tab" after; "Life tab", "Love tab"), Career (76 jobs in `src/data/jobs.ts`, only the ~9 ids in persisted `jobOpenings` listed each year, one interview question on apply, salary lands each Age Up), university majors (`src/data/majors.ts`, grade bars; graduation popup at 18 opens the major picker; major-locked jobs like doctor→medicine), Relationships (family at birth, friends, Find Love at 18, propose at 70+ bond, marry). When resolving the event modal in a driver, click `getByRole('button').last()` — modals mount last in the DOM and buttons behind the backdrop intercept anything else. The persisted save in localStorage (`simlife-save`) is the easiest oracle AND fixture: read `state.log` for outcomes, or inject state (age, smarts, jobOpenings, major) + reload to set up deterministic probes. Worth probing: older-version save migration, openings rotation across an Age Up, major rejection vs acceptance.

## Web app — build & launch

```bash
npm install
npm run build                      # tsc -b && vite build
npm run preview -- --port 4173 &   # serves dist/ at http://localhost:4173
```

For iterating without a build, `npm run dev` (port 5173) works too.

## Drive it (headless)

Playwright is installed globally in the remote environment (`/opt/node22/lib/node_modules/playwright`); Chromium lives under `/opt/pw-browsers/chromium-*/chrome-linux/chrome` — pass it as `executablePath`, do NOT run `playwright install`. In a `.mjs` script, import by absolute path (`NODE_PATH` is ignored by ESM):

```js
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
```

## Flows worth driving

- Fresh load shows the **character creation screen** ("New Life"): two name inputs, 🎲 Randomize / Reroll buttons, "Start Life" begins the game.
- Click **Age Up +** (fixed cyan button, always visible) until an event modal pops (`[role=dialog]`, events start around age 5–7); pick a choice, confirm stat bars (`[role=progressbar]` `aria-valuenow`) and the life log (`[data-testid=life-log]`) update.
- Reload mid-event: the pending event must persist and keep blocking Age Up.
- Reload after resolving: age/year/log must survive (localStorage key `simlife-save`, persist version 1; v0 saves without `screen` must migrate straight to the life screen, not creation).
- Loop age-up/choose ~400 iterations to reach the death modal ("Rest in Peace"), then "Start a New Life" returns to character creation.

## Gotchas

- Collect `console`/`pageerror` events in the driver — the app itself logs nothing, so anything appearing is a finding.
- Choice buttons live inside the modal (`[role=dialog] button`); "Age Up +" stays visible but disabled while an event is pending.
- On a mobile viewport the modal is a bottom sheet that covers the Age Up button's coordinates — don't probe "click through the backdrop" at those coordinates, you'll hit a choice button instead.
