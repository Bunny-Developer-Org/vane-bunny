# Changelog

All notable changes to Vane Bunny are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Fixed
- Recentered the three-leaf mark in `assets/icon.png`,
  `android-icon-foreground.png`, `splash-icon.png`, and `favicon.png` —
  the mark's pivot point (where the three leaves meet) was off-center by
  ~45px on the 1024px icon, visible as an obvious lopsided crop once
  installed (including in the Google Play Store small-icon preview).
- `store-assets/icon-512.png` was regenerated directly from the corrected
  `assets/icon.png` so the Play Store listing icon always matches the
  real app icon.

### Removed
- `assets/android-icon-monochrome.png` and the `monochromeImage` entry in
  `app.json`'s `android.adaptiveIcon` config — its artwork didn't match
  the two-color mark used everywhere else (missing the third leaf), so
  the Android adaptive icon now just uses the foreground/background
  layers without a themed-icon monochrome variant.

### Changed
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
