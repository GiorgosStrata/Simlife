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

- Click **Age Up +** until an event card appears (events start around age 5–7); pick a choice, confirm stat bars (`[role=progressbar]` `aria-valuenow`) and the life log (`[data-testid=life-log]`) update.
- Reload mid-event: the pending event must persist and keep blocking Age Up.
- Reload after resolving: age/year/log must survive (localStorage key `simlife-save`).
- Loop age-up/choose ~300 iterations to reach death ("Rest in Peace"), then "Start a New Life" resets to age 0 with a fresh name.

## Gotchas

- Collect `console`/`pageerror` events in the driver — the app itself logs nothing, so anything appearing is a finding.
- Choice buttons live inside the event card container (`.border-indigo-100 button`); "Age Up +" disappears while an event is pending.
