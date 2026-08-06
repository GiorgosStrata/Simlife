/**
 * Guard: this repo root is NOT the Expo app.
 *
 * The React Native / Expo app lives in `mobile/`. The root is the legacy Vite
 * web app and has no `expo` or `react-native` dependency, so running EAS here
 * produces a project that cannot build for iOS (the iOS job fails immediately).
 *
 * Expo reads this file before doing anything, so any `expo`/`eas` command run
 * from the root stops here with an explanation instead of building the wrong
 * project. Run every EAS command from `mobile/` instead:
 *
 *   cd mobile
 *   npx eas build --platform ios --profile production
 *   npx eas submit --platform ios --latest
 */
throw new Error(
  [
    '',
    'This directory is not the Expo app — the app lives in ./mobile',
    '',
    'Run EAS from there instead:',
    '',
    '  cd mobile',
    '  npx eas build --platform ios --profile production',
    '',
    'If a previous `eas init` left an app.json / eas.json / .expo at the repo',
    'root, delete them — the real ones are in mobile/.',
    '',
  ].join('\n'),
)
