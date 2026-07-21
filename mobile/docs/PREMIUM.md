# Premium & save slots — shipping notes

Simlife has a one-time **Premium** unlock and a **save-slot** system.

## What premium gives (already wired)

- Removes all ads (banner + interstitial).
- Raises the saved-lives cap from **3** to **10** (`premiumStore.ts`).
- Lets you **switch to a child at any time** (PersonModal → "Take over as …"),
  not just after death — same inheritance rules apply.
- **Unlimited generations** (free play stops continuing the bloodline after
  `FREE_MAX_GENERATION`).
- **Edit starting stats** on the character-creation screen.

## Save slots

- `slotsStore.ts` holds a roster of full game snapshots; `saves.ts` is the glue
  that snapshots/loads the live game and enforces the per-tier cap.
- "My Lives" (Settings → My Lives) switches, adds, and deletes saved lives.
- The active game still persists to `simlife-save`; the roster persists to
  `simlife-slots`. On boot, `ensureSeeded()` makes sure the current game is a
  slot.

## Turning the mock purchase into a real IAP (before store submission)

`premiumStore.purchase()` currently just flips a local flag. For the App Store /
Play Store:

1. Add an IAP layer — **RevenueCat** is the easiest cross-platform option
   (`react-native-purchases`), or StoreKit 2 / Google Play Billing directly.
2. Configure a **non-consumable** product (the €10 unlock) in App Store Connect
   and Google Play Console; RevenueCat maps both to one "premium" entitlement.
3. In `purchase()`, call the SDK's purchase flow; set `premium` from the
   resulting entitlement (not before the receipt is verified).
4. Implement `restorePurchase()` with the SDK's restore call so buyers can
   re-unlock on a new device (required by both stores).
5. Show the store's **localized price** instead of the hardcoded `PREMIUM_PRICE`.

Keep the rest of the app unchanged — everything reads `usePremiumStore().premium`.
