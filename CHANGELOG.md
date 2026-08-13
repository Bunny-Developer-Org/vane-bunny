# Changelog

All notable changes to Vane Bunny are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Fixed
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
