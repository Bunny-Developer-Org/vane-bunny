# Vane Bunny — Remaining Work

Everything below is outside what code alone can finish — it needs a Firebase
project, a Google Cloud project, and a Google Play Developer account.

## 1. App polish (before first real users)

- [ ] Replace the default Expo icon/splash/adaptive-icon assets in `assets/`
      with real Vane Bunny artwork (abstract, no literal mood iconography —
      see Design direction in README.md)
- [ ] Test the full flow on a physical Android device / emulator, not just
      web (`npm run android`) — Google Sign-In's native flow is untested
      outside the web popup path
- [ ] Decide on and write real copy for the welcome-screen tagline, empty
      states, etc. if the current placeholder text isn't final
- [ ] Add a privacy policy page (see §4 — required for the Play Store listing
      regardless of how minimal the data collection is)

## 2. Firebase project (production)

- [ ] Create the Firebase project (or promote a dev/staging one)
- [ ] Authentication → Sign-in method → enable **Google**
- [ ] Firestore → create database
- [ ] Deploy `firestore.rules`:
      `npx firebase-tools deploy --only firestore:rules --project <project-id>`
- [ ] Add a Web app in Firebase to get the `EXPO_PUBLIC_FIREBASE_*` config
      values, put them in `.env` (or your CI/build secrets)

## 3. Google Sign-In OAuth setup

- [ ] In Google Cloud Console (same project as Firebase) → APIs & Services →
      Credentials: confirm the **Web application** OAuth client (Firebase
      usually creates this automatically) → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- [ ] Create an **Android** OAuth client:
      - package name `com.vanebunny.app`
      - SHA-1 certificate fingerprint (see §5 — you need the *Play App
        Signing* SHA-1, not just your local debug keystore's, before the
        production build will work)
      - → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- [ ] OAuth consent screen: set support email, app name/logo, and (once out
      of internal testing) submit for verification if prompted

## 4. Play Store compliance basics

- [ ] Host a privacy policy (a static page is enough) covering: Google
      Sign-In, the mood/note data stored per-user in Firestore, and that
      there's no ad tracking / third-party data sharing
- [ ] Fill out Play Console's **Data safety** section — this app collects
      account info (name/email via Google) and user-generated content
      (mood score + optional note), stored server-side, tied to the user;
      no data is shared with third parties
- [ ] Complete the **content rating** questionnaire
- [ ] Set **target audience** (this is a general wellness journaling app,
      not for children — set age targeting accordingly)

## 5. Android build & signing

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
      (default and recommended) — grab the resulting SHA-1 from Play Console
      → Setup → App signing, and add it to the Android OAuth client from §3
      (Google Sign-In will fail in the Play-distributed build until this is
      done)
- [ ] For `eas submit`, generate a Google Play service account JSON key
      (Play Console → Setup → API access) and save it as
      `google-service-account.json` in the project root (already gitignored)

## 6. Play Console listing

- [ ] Create the app in Play Console, set package name `com.vanebunny.app`
- [ ] Store listing: title, short description, full description
- [ ] Graphics: app icon (512×512), feature graphic (1024×500), phone
      screenshots (at least 2, ideally showing check-in + history)
- [ ] Set pricing (free) and country availability
- [ ] Upload the `.aab` from §5 to an **internal testing** track first
- [ ] Add internal testers, verify the Google Sign-In + Firestore flow works
      end-to-end on a real signed build (this is the first point the real
      SHA-1/OAuth wiring gets exercised)
- [ ] Promote internal → closed/open testing → production once verified

## 7. Post-launch (not required for v1 launch, just flagged for later)

- [ ] Monitor Firestore usage/costs (free Spark plan tier should comfortably
      cover early usage; watch read counts as history grows)
- [ ] Everything in the README's "Out of scope for v1" list (push
      notifications, data export, sharing, iOS) if there's ever a v2
