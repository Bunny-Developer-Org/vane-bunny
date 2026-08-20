# Changelog

All notable changes to Vane Bunny are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## 1.1.1 — 2026-08-20

### Fixed

- **Complete data loss when upgrading from 1.0.3 to 1.1.0.** The async-storage
  downgrade (3.1.1 → 2.2.0) silently switched database files on Android:
  v1.0.0–1.0.3 wrote to Room DB (`AsyncStorage`), but v1.1.0 looked for data
  in the legacy SQLite file (`RKStorage`), which was never created, rendering
  all stored check-ins, language, and theme settings unreachable. Enable
  AsyncStorage's `next` storage via `expo-build-properties`, pointing the
  native module back at the Room DB. On first launch, the v2 native layer
  auto-migrates from `RKStorage` (if present) to `AsyncStorage`, recovering
  any data written by 1.1.0 and making the app see its original entries again.
  Users upgrading from 1.0.3 → 1.1.1 get all data back; users who upgraded to
  1.1.0 find theirs reappears on first launch of 1.1.1.

## 1.1.0 — 2026-08-15

The version in `app.json` moves 1.0.3 → 1.1.0; everything below ships in
that build.

### Fixed

- **Saving a check-in while the app was still starting up wiped the
  stored history.** Store mutations ran independently of the initial
  read from on-device storage, so one issued before hydration finished
  built its result from the still-empty in-memory list and persisted
  that over everything on disk — losing every earlier entry
  irrecoverably. Mutations now await the initial load before touching
  anything. Found while adding tests around the new edit feature; the
  bug predates it and could be hit from the check-in screen, which
  renders its save button before the store has loaded.
- **A failed read of on-device storage wiped it on the next save**, by
  the same mechanism: a read error fell back to an empty list and marked
  the store loaded, so the next check-in persisted just itself over a
  history the app had merely failed to _read_. A failed load is now
  remembered, and mutations refuse to write rather than overwrite data
  they couldn't see; the next attempt re-reads storage rather than
  replaying the failure, so a momentary read error doesn't leave the app
  read-only until it's restarted. Saving reports the failure instead, on
  the check-in screen as well as the edit screen, and what you typed is
  kept rather than cleared.
- **One entry with an unreadable date on disk broke every future save.**
  Hydration accepted an unparseable `timestamp` as an Invalid Date, and
  re-serializing the list then threw on it — so a single corrupt row
  made every add, edit and delete fail, permanently, including ones
  touching healthy entries. Such rows are now dropped as the store
  loads; an unreadable `updatedAt` just costs that entry its "edited"
  marker.
- **A screen opened directly — a `vanebunny://` link, a reloaded web
  URL — had a dead Back control**, because the stack started on that
  screen with nothing beneath it to pop. The root layout now anchors the
  tab navigator under deep-linked routes. Pre-existing on the day and
  privacy screens; the edit screen would have inherited it.
- **A refused write is now reported instead of passing silently.** The
  check-in screen showed no toast and cleared nothing (it previously
  showed a thank-you for a save that had in fact destroyed data), and
  deleting closed its dialog over an entry that was still there. Both
  now surface the failure and keep what you typed.
- **A throwing store subscriber could report a successful save as
  failed.** Notification happened after the write had already committed
  but outside any guard, so one bad listener rejected the mutation —
  and on the edit screen that meant an error message on a save that had
  in fact landed, with the button then disabled because the entry was
  already up to date. Subscriber errors are now contained to the
  subscriber.
- Realigned every native dependency to its Expo SDK 57 pin, which
  `expo-doctor` was flagging and which made the app unrunnable in Expo Go
  (it crashed on launch with "Native module is null" from AsyncStorage and
  a missing `installUIRuntimeBindings` from gesture-handler). The two
  majors ahead of the SDK were
  `@react-native-async-storage/async-storage` 3.1.1 → 2.2.0 and
  `react-native-gesture-handler` 3.1.0 → 2.32.0; `react-native`,
  `expo`, `expo-router`, `react-native-safe-area-context` and friends
  moved to their pinned patch/minor. **No stored data is affected by the
  async-storage downgrade:** that package's v3 default export is
  `getLegacyStorage()`, the v2-backed implementation, so the app has been
  reading and writing the v2 store all along. Native version ranges are
  now `~`/exact rather than `^`, which is what let them drift in the
  first place.
- The check-in screen's "Save check-in" button is now pinned to the bottom
  of the screen instead of sitting at the end of the scroll content, so it
  stays visible while the note field is focused — previously the software
  keyboard covered it and you had to dismiss the keyboard or scroll to
  reach it. The bottom tab bar now hides while the keyboard is up
  (`tabBarHideOnKeyboard`) so it doesn't sit between the keyboard and that
  button. The `KeyboardAvoidingView`'s existing `behavior` is unchanged —
  Android's `"height"` is what shrinks the view to the space above the
  keyboard and carries the pinned button up with it.
- Recentered the three-leaf mark in `assets/icon.png`,
  `android-icon-foreground.png`, `splash-icon.png`, and `favicon.png` —
  the mark's pivot point (where the three leaves meet) was off-center by
  ~45px on the 1024px icon, visible as an obvious lopsided crop once
  installed (including in the Google Play Store small-icon preview).
- `store-assets/icon-512.png` was regenerated directly from the corrected
  `assets/icon.png` so the Play Store listing icon always matches the
  real app icon.

### Removed

- `newArchEnabled` from `app.json` — the New Architecture is unconditional
  from Expo SDK 55 onward, so the key is no longer part of the config
  schema and `expo-doctor` rejected it.
- `eas-cli` as a project devDependency; Expo's tooling expects it global or
  run through `npx`, so the `build:*`/`submit:android` scripts now call
  `npx eas-cli`. CI is unaffected — the workflow installs its own copy via
  `expo/expo-github-action`.
- `assets/android-icon-monochrome.png` and the `monochromeImage` entry in
  `app.json`'s `android.adaptiveIcon` config — its artwork didn't match
  the two-color mark used everywhere else (missing the third leaf), so
  the Android adaptive icon now just uses the foreground/background
  layers without a themed-icon monochrome variant.

### Changed

- The entry row's actions are now real 44dp-tall tappable boxes rather
  than bare 12px labels with `hitSlop` — `hitSlop` isn't implemented in
  react-native-web at all, which left them roughly text-sized in a
  browser, and one of the two is destructive. Their screen-reader labels
  now name the check-in they act on ("Delete check-in 8 at 3:41 PM")
  instead of repeating an identical "Delete entry" once per row.
- `PrimaryButton` now reports its button role and disabled/busy state to
  screen readers. It previously announced as plain text, which matters
  most on the edit screen, where Save deliberately starts disabled.
- `app.config.js` now takes Expo's `({ config })` argument — the values
  from `app.json`, which Expo reads first — instead of `require`-ing
  `app.json` itself and returning a freshly built object. Same resolved
  config either way, but the static and dynamic halves are now visibly
  connected, which is what `expo-doctor` checks for.
- Redesigned `store-assets/feature-graphic-1024x500.png` — it previously
  used an unrelated circles motif instead of the app's actual leaf mark
  and brand colors; it now uses the corrected mark plus real copy.
- Reorganized `store-assets/screenshots/` into `web/` (the original
  desktop-browser captures, kept for reference) and `mobile/` (new
  captures at a real 1080×2340 phone viewport).

### Added

- **Editing a past check-in.** Each entry on a day's detail screen now has
  an "Edit" action next to "Delete", opening a full-screen form
  (`app/entry/[id].tsx`) with the same mood picker and note field as the
  check-in screen, pre-filled with what was logged. Previously the only
  way to correct a typo or a mis-tapped score was to delete the entry and
  log a new one, which moved it to the current time and so quietly
  rewrote when it happened.
  - The score is editable alongside the note. A check-in is one thing —
    showing its note in an edit form while locking the score it belongs
    to would be the odd behaviour — and a mis-tapped score was the case
    delete-and-relog handled worst.
  - `timestamp` is never touched by an edit, so a corrected entry stays
    in the day it was logged in, and a corrected score is reflected in
    that day's average and median rather than today's.
  - Entries carry a new optional `updatedAt`, surfaced as a quiet
    "edited" marker on the row. The edit form's Save stays disabled
    until the score or note actually differs from what's stored, so an
    entry is only ever stamped on a real change — opening the form and
    backing out leaves no trace.
  - No storage migration: `updatedAt` is absent on every entry written
    before this, and absent is exactly what "never edited" means, so the
    existing on-device store loads unchanged.
- `store-assets/screenshots/mobile/` — four Play Store-ready screenshots
  (check-in, history, day detail, settings) captured from the actual
  running app at a real phone viewport size, replacing the wide desktop
  web-preview captures that were there before.
- `store-assets/listing-EN.md` / `listing-PL.md` — language-specific
  title/description text split out from `listing.md`.
- This changelog.

## 2026-07-24

- Stripped `INTERNET` ("full network access") from production and
  preview Android builds too — `app.config.js` now removes it
  dynamically based on the EAS build profile, keeping it only for the
  development client build where Metro needs it to serve the JS bundle.
  Store builds now request zero Android permissions.

## 2026-07-22

- Minimized Android permissions requested by the app —
  `android.blockedPermissions` in `app.json` now strips
  `SYSTEM_ALERT_WINDOW`, `VIBRATE`, `READ_EXTERNAL_STORAGE`, and
  `WRITE_EXTERNAL_STORAGE` from Expo's default template.
- Updated the Android package name to include the Bunny Developer org
  (`com.bunnydeveloper.vanebunny`).

## 2026-07-19

- Replaced the icon, favicon, splash screen, and Android adaptive icon
  (foreground + monochrome) with the app's three-wing leaf logo mark, and
  added the Google Play developer header image.
- Fixed the Android keyboard obscuring the check-in note field.
- Switched the `android`/`ios` npm scripts to `expo run:android` /
  `expo run:ios` instead of `expo start`.
- Updated the privacy policy contact email.

## 2026-07-18

Initial build and the day's iteration on it:

- Built Vane Bunny: an Expo mood-tracking app, initially with Firebase
  auth and Firestore sync.
- Removed Firebase/Google Sign-In and Firestore entirely — the app is now
  fully local-only, storing check-ins on-device with no account and no
  network calls, matching the privacy stance in the README.
- Added real branding, three swappable color themes (Meadow/Ocean/Dusk),
  a Settings tab, and fixed a History screen background bug.
- Added an i18n system with English/Polish translations and a language
  switcher.
- Added the privacy policy page (`docs/privacy-policy.html`) for the Play
  Store listing and set the real contact email.
- Configured EAS build profiles (`development`/`preview`/`production`)
  for Android builds and submission.
- Added unit tests for the stats/date utilities and pinned the Node
  version.
- Enforced Prettier formatting and added `npm run lint` via `expo lint`
  (ESLint + `eslint-config-expo`), then fixed the lint errors it
  surfaced.
- UI polish: centered the check-in prompt and today's-stats card, fixed
  the tab bar labels sitting flush against the bottom edge and a label
  clipping issue, replaced the inline thank-you banner with an animated
  transient toast (sliding up/down, no hairline edge artifact, full-width
  inverted bar), and swapped the Clay theme option for a blue Ocean
  theme.
- Added the initial Play Store publishing assets (icon, feature graphic,
  screenshots) and `TODO.md` tracking remaining setup, Android build, and
  Play Store deploy steps.
