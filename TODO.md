# Vane Bunny — Remaining Work

The app itself is fully local — no Firebase, no accounts, nothing to
provision there anymore. What's left needs only a Google Play Developer
account (and optionally an Expo account for EAS builds).

## 1. App polish (before first real users)

- [x] Replace the default Expo icon/splash/adaptive-icon assets in `assets/`
      with real Vane Bunny artwork (abstract, no literal mood iconography —
      see Design direction in README.md)
- [ ] Test the full flow on a physical Android device / emulator, not just
      web (`npm run android`). Two things to look at specifically, both
      reasoned from source rather than observed: the edit screen's footer
      adds `insets.bottom`, but safe-area insets don't shrink when the IME
      opens, so with the keyboard up the Save button may float an extra
      ~24-48dp above it; and deep-linking `vanebunny://entry/<id>` should
      now land with the tabs mounted beneath it (`unstable_settings.anchor`
      in `app/_layout.tsx`) so Back works
- [ ] The "‹ Back" links on the day, entry and privacy screens are bare
      15px text with `hitSlop` — which react-native-web doesn't implement,
      so on web their click target is the glyph box. Same fix the entry
      row's actions got (real padding instead of slop), applied to all
      three at once
- [ ] No test harness for components or routes: `jest.config.js` is
      `testEnvironment: 'node'` and only matches `*.test.ts`, so `.tsx` is
      excluded outright. The store is well covered; every UI regression
      found so far was caught by reading, not by tests. Adding `jest-expo` + `@testing-library/react-native` would cover the screens
- [ ] Decide on and write real copy for empty states etc. if the current
      placeholder text isn't final
- [ ] Decide whether app-reinstall data loss (no cloud backup, by design —
      see README's privacy stance) needs a warning somewhere in the UI, e.g.
      before uninstalling or on first launch
- [ ] Decide what the History screen shows when on-device storage can't be
      read. All three write paths now report a refused save (see CHANGELOG),
      but reads have the same gap from the other side: a failed read marks
      the store loaded with an empty list, so History renders its cheerful
      "Nothing here yet" about entries it simply couldn't read. The store
      knows — `loadMoodEntries` resolves `false` — it just isn't exposed to
      the hook, so `useMoodEntries` would need to carry it through.

## 2. Play Store compliance basics

Much simpler than a typical app, since there's no account and no data ever
leaves the device:

- [x] `docs/privacy-policy.html` written — self-contained static page stating
      the no-collection stance
- [x] **Fill in the placeholder contact email** in
      `docs/privacy-policy.html` (search for `REPLACE_WITH_CONTACT_EMAIL`)
      before publishing it anywhere
- [x] Host it somewhere with a stable URL for the Play Console listing —
      GitHub Pages is enabled and serves it at
      `https://bunny-developer-org.github.io/vane-bunny/privacy-policy.html`
- [x] Minimize Android permissions — `android.blockedPermissions` strips
      `SYSTEM_ALERT_WINDOW` / `VIBRATE` / `READ_EXTERNAL_STORAGE` /
      `WRITE_EXTERNAL_STORAGE`; production/preview builds also strip
      `INTERNET` (kept only for the development client so Metro works).
      Documented in the "Android permissions" section of
      `docs/privacy-policy.html`. Rebuild + resubmit the Play Store AAB
      so the listing reflects the trimmed set.
- [ ] Fill out Play Console's **Data safety** section as **"No data
      collected"** — accurate here since there's no account, no analytics,
      no crash reporting, no network calls at all
- [ ] Decide, deliberately, whether to set `android.allowBackup: false` in
      `app.json`. Expo's default is `true`, so Android's OS-level backup can
      copy the app's on-device storage to the user's Google Drive. The app
      itself still sends nothing — and store builds have no `INTERNET`
      permission — but the privacy policy's "nothing about the change is
      sent anywhere" is a stronger claim than the config currently backs.
      Either turn the backup off or keep it knowingly (it's also the only
      thing that survives a reinstall, which the item above is about)
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
- [x] **Requires your Expo account** — `npx eas login`, then `npx eas init`
      to create the EAS project and write `extra.eas.projectId` into
      `app.json`. Already done — `app.json`'s `extra.eas.projectId` is set,
      and a 2026-07-24 CI run confirmed `eas whoami` authenticates as the
      `bunny-developer` account.
- [x] Run `npm run build:production` (or `build:preview` first for a quick
      installable APK to sanity-check on a device before a store build) —
      queued successfully via the GitHub Actions workflow on 2026-07-24
      (App Version 1.0.3, versionCode 5); check
      https://expo.dev/accounts/bunny-developer/projects/vane-bunny/builds
      for the native build to finish.
- [ ] Enroll in **Play App Signing** when you create the app in Play Console
      (default and recommended)
- [x] For `eas submit`, generate a Google Play service account JSON key
      (Play Console → Setup → API access) and save it as
      `google-service-account.json` in the project root (already
      gitignored) — confirmed working via CI logs, authenticating as
      `vane-bunny-play-publisher@vane-bunny.iam.gserviceaccount.com`.
- [x] Automate build + submit via GitHub Actions — see the "Continuous
      deployment" section in README.md
      (`.github/workflows/eas-build-submit.yml`, triggered by pushing a
      `v*.*.*` tag or manually)
- [x] Set the `EXPO_TOKEN` and `GOOGLE_SERVICE_ACCOUNT_JSON` repository
      secrets in GitHub so the above workflow can actually run — verified
      via a manual `workflow_dispatch` run on 2026-07-24: `eas whoami`
      authenticated with `EXPO_TOKEN`, and the submission was scheduled to
      the internal Play Store track using `GOOGLE_SERVICE_ACCOUNT_JSON`.
- [ ] Optional follow-up: wire EAS build/submit completion back into
      something visible (Slack, GitHub status check, etc.) — not set up yet,
      see README's Continuous deployment section

## 4. Play Console listing

- [x] All listing text and graphics prepared in `store-assets/` — title and
      short/full description in `listing-EN.md` / `listing-PL.md`
      (`listing.md` is now just an index plus the shared graphics specs),
      `icon-512.png`, `feature-graphic-1024x500.png`, and 4 real phone
      screenshots in `screenshots/mobile/` (generated from the actual
      running app, not mockups — `screenshots/web/` is reference only,
      don't upload it)
- [ ] Recapture `store-assets/screenshots/mobile/3-day-detail.png` before
      uploading the listing — it predates entry editing, so its rows show
      only a Delete action and no "edited" marker
- [x] Create the app in Play Console, set package name `com.bunnydeveloper.vanebunny`
- [ ] Paste in the store listing text and upload the graphics from
      `store-assets/`
- [ ] Set pricing (free) and country availability
- [ ] Upload the `.aab` from §3 to an **internal testing** track first,
      verify on a real signed build, then promote internal → closed/open
      testing → production — a v1.0.3 build was queued and its submission
      scheduled to the internal track via CI on 2026-07-24; still needs
      confirming in Play Console that it finished processing, then
      verifying on a real device

## 5. Post-launch (not required for v1 launch, just flagged for later)

- [ ] Everything in the README's "Out of scope for v1" list (cross-device
      sync, push notifications, data export, sharing, iOS) if there's ever a
      v2 — note that reintroducing sync would mean revisiting the privacy
      stance this version is built around, not just flipping a flag
