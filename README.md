# Vane Bunny

A soft, minimal mood-tracking app. Log a mood score (1–10) as many times a day as you like — no daily limit, no clutter. Built with Expo (React Native), targeting Android and Web from one codebase, backed by Firebase Auth (Google Sign-In) and Firestore.

## Stack

- **Expo SDK 57** / React Native 0.86, [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- **Firebase Auth** (Google provider) for single-tap login
- **Firestore** for per-user, realtime-synced data
- Platforms: **Android** and **Web**. iOS is out of scope for v1 (the code isn't iOS-specific, but it hasn't been configured or tested there).

## Project structure

```
app/                      expo-router routes
  (auth)/welcome.tsx        sign-in screen
  (app)/(tabs)/log.tsx       quick-add check-in screen
  (app)/(tabs)/history.tsx   list of past days (avg/median)
  (app)/day/[date].tsx        individual entries for one day
src/
  components/               MoodPicker, DaySummaryCard, EntryListItem, ...
  context/AuthContext.tsx   Firebase auth state
  firebase/                 Firebase app/auth/firestore config + mood entry CRUD
  hooks/                    useGoogleSignIn, useMoodEntries
  theme/                    colors, spacing, type scale, score-to-color mapping
  utils/                    average/median, day grouping, date formatting
firestore.rules            per-user data isolation
```

## Data model

```
users/{uid}                          # profile fields live directly on this doc
  displayName, email, createdAt

users/{uid}/moodEntries/{entryId}
  score: number (1-10)
  note: string (optional)
  timestamp: Firestore Timestamp
```

Daily average/median are computed client-side from that day's entries — no Cloud Functions needed for v1.

## Setup

### 1. Firebase project

1. Create a project at the [Firebase console](https://console.firebase.google.com/).
2. **Authentication** → Sign-in method → enable **Google**.
3. **Firestore Database** → create a database (production mode is fine; rules below lock it down).
4. Add a **Web app** to the project (Project settings → General → Your apps) to get the config values.
5. Deploy the included security rules:
   ```
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```

### 2. Google Sign-In credentials

Google Sign-In on Android goes through `expo-auth-session`, which needs OAuth 2.0 client IDs from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (the same GCP project backing your Firebase project):

- A **Web application** client ID (also used by Firebase's web popup flow).
- An **Android** client ID, registered with your app's package name (`com.vanebunny.app`) and SHA-1 signing certificate fingerprint.

### 3. Environment variables

```
cp .env.example .env
```

Fill in the Firebase web app config and the two OAuth client IDs. All variables must keep the `EXPO_PUBLIC_` prefix to be readable in client code — none of them are secret enough to need server-side handling (Firebase web config is designed to be public; access control lives in the Firestore rules, not in hiding these values).

### 4. Install and run

```
npm install
npm run web        # http://localhost:8081
npm run android     # requires an emulator or device + Expo dev client / Expo Go
```

### Developing against the Firebase emulators (optional)

To avoid touching production data while developing:

```
npx firebase-tools emulators:start --only auth,firestore
```

Set `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env` and restart the app — it will connect to the local Auth and Firestore emulators instead of your real project. The emulator UI is at `http://localhost:4000`.

## Building for Android (EAS)

Build profiles live in `eas.json` (`development`, `preview`, `production`) and `eas-cli` is a dev dependency, so:

```
npx eas login          # your Expo account
npx eas init            # one-time: creates the EAS project, writes projectId into app.json
npm run build:preview    # installable .apk for testing on a device
npm run build:production # .aab for the Play Store, versionCode auto-incremented by EAS
npm run submit:android   # uploads the latest production build to Play Console
```

`eas submit` needs a Google Play service account key saved as `google-service-account.json` in the project root (gitignored). See `TODO.md` for the full Play Store deployment checklist, including the Play App Signing / Google OAuth SHA-1 dependency.

## Design direction

Muted, rounded, calm — the app deliberately avoids mood/emotion iconography (no emoji faces, no literal "tracker" branding). The 1–10 selector uses an abstract low-to-high color gradient instead.

## Out of scope for v1

- Push notifications / reminders
- Data export
- Social or sharing features
- iOS build
