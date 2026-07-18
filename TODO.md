# Vane Bunny — Remaining Work

The app itself is fully local — no Firebase, no accounts, nothing to
provision there anymore. What's left needs only a Google Play Developer
account (and optionally an Expo account for EAS builds).

## 1. App polish (before first real users)

- [x] Replace the default Expo icon/splash/adaptive-icon assets in `assets/`
      with real Vane Bunny artwork (abstract, no literal mood iconography —
      see Design direction in README.md)
- [ ] Test the full flow on a physical Android device / emulator, not just
      web (`npm run android`)
- [ ] Decide on and write real copy for empty states etc. if the current
      placeholder text isn't final
- [ ] Decide whether app-reinstall data loss (no cloud backup, by design —
      see README's privacy stance) needs a warning somewhere in the UI, e.g.
      before uninstalling or on first launch

## 2. Play Store compliance basics

Much simpler than a typical app, since there's no account and no data ever
leaves the device:

- [x] `docs/privacy-policy.html` written — self-contained static page stating
      the no-collection stance
- [ ] **Fill in the placeholder contact email** in
      `docs/privacy-policy.html` (search for `REPLACE_WITH_CONTACT_EMAIL`)
      before publishing it anywhere
- [ ] Host it somewhere with a stable URL for the Play Console listing —
      easiest is enabling GitHub Pages on this repo (Settings → Pages →
      deploy from branch → `/docs` folder), which would serve it at
      `https://<you>.github.io/vane-bunny/privacy-policy.html`
- [ ] Fill out Play Console's **Data safety** section as **"No data
      collected"** — accurate here since there's no account, no analytics,
      no crash reporting, no network calls at all
- [ ] Complete the **content rating** questionnaire
- [ ] Set **target audience** (general wellness journaling app, not for
      children — set age targeting accordingly)

## 3. Android build & signing

- [x] Add `eas.json` with `development` / `preview` / `production` build
      profiles (`production` outputs an `.aab` for the Play Store) and a
      `submit.production` profile wired for `eas submit`
- [x] Add `eas-cli` as a dev dependency and `build:dev` / `build:preview` /
      `build:production` / `submit:android` npm scripts
- [x] `cli.appVersionSource: "remote"` + `autoIncrement: true` on the
      production profile — EAS manages `versionCode` for you, no manual
      bumps needed in `app.json`
- [ ] **Requires your Expo account** — `npx eas login`, then `npx eas init`
      to create the EAS project and write `extra.eas.projectId` into
      `app.json` (can't be done without your credentials)
- [ ] Run `npm run build:production` (or `build:preview` first for a quick
      installable APK to sanity-check on a device before a store build)
- [ ] Enroll in **Play App Signing** when you create the app in Play Console
      (default and recommended)
- [ ] For `eas submit`, generate a Google Play service account JSON key
      (Play Console → Setup → API access) and save it as
      `google-service-account.json` in the project root (already gitignored)

## 4. Play Console listing

- [x] All listing text and graphics prepared in `store-assets/` — title,
      short/full description in `listing.md`, `icon-512.png`,
      `feature-graphic-1024x500.png`, and 4 real phone screenshots in
      `screenshots/` (generated from the actual running app, not mockups)
- [ ] Create the app in Play Console, set package name `com.vanebunny.app`
- [ ] Paste in the store listing text and upload the graphics from
      `store-assets/`
- [ ] Set pricing (free) and country availability
- [ ] Upload the `.aab` from §3 to an **internal testing** track first,
      verify on a real signed build, then promote internal → closed/open
      testing → production

## 5. Post-launch (not required for v1 launch, just flagged for later)

- [ ] Everything in the README's "Out of scope for v1" list (cross-device
      sync, push notifications, data export, sharing, iOS) if there's ever a
      v2 — note that reintroducing sync would mean revisiting the privacy
      stance this version is built around, not just flipping a flag
