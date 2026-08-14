# Ads & Accounts — shipping notes

This build adds the **account gate** and **ad placements** the app needs for the
iOS/App Store and Android/Play Store releases. The web build (Vercel preview)
uses on-device accounts and house-ad placeholders so everything is testable
without native modules. Below is what to wire before a store submission.

## Accounts (`src/store/authStore.ts`)

- Players sign up / log in before reaching the game (`AuthScreen`).
- Accounts currently live in local storage on the device (a real, working
  flow, but single-device and not secure — passwords are only hashed on
  device).
- **For production:** replace the bodies of `signUp` / `logIn` with calls to a
  real auth backend (e.g. Supabase Auth, Firebase Auth, or your own API). The
  rest of the app only reads `currentEmail`, so nothing else needs to change.
  Cloud save sync can hang off the same account id.

## Ads

Placeholders live in `AdBanner` (bottom-anchored banner slot) and
`InterstitialAd` (full-screen, shown ~every 10 minutes via the timer in
`App.tsx`, `AD_INTERVAL_MS`). Both are swapped for **Google AdMob** on native:

1. Add the dependency and Expo config plugin:
   ```
   npx expo install react-native-google-mobile-ads
   ```
   Configure your AdMob app ids in `app.json` under the plugin.
2. **Banner** — in `AdBanner`, mount the real unit (keep the 52px height so the
   layout doesn't shift):
   ```tsx
   import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
   <BannerAd unitId={BANNER_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
   ```
3. **Interstitial** — preload an `InterstitialAd` from the SDK and `.show()` it
   from the timer; keep the countdown-close UX in the placeholder as the
   fallback. Respect the frequency-capping/consent (UMP) requirements.
4. Gate ads behind a "Remove ads / Premium" IAP entitlement — the placeholders
   already advertise it, so the removal path is just skipping the mounts.

Real AdMob has no web support, which is why the imports are intentionally kept
out of the shared bundle; add them only in the native build.
