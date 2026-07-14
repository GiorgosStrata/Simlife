---
name: verify
description: Build, launch, and drive Simlife in a headless browser to verify changes at the UI surface.
---

# Verifying Simlife

Simlife is a client-only Vite + React app; the surface is the browser UI.

## Build & launch

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
