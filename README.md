# Vane Bunny

A soft, minimal mood-tracking app. Log a mood score (1–10) as many times a day as you like — no daily limit, no clutter. Past check-ins can be edited or deleted from the day they belong to, so a mistyped score or a note you'd rather rephrase isn't stuck there. Built with Expo (React Native), targeting Android and Web from one codebase.

**Privacy stance:** nothing about you ever leaves the device. There's no login, no account, no server — mood entries live in local on-device storage only. This trades away cross-device sync (a device reinstall or switch loses your history) for having genuinely no personal data collection to reason about.

## Stack

- **Expo SDK 57** / React Native 0.86, [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- **`@react-native-async-storage/async-storage`** for on-device persistence — the only storage layer, nothing cloud-backed
- Platforms: **Android** and **Web**. iOS is out of scope for v1 (the code isn't iOS-specific, but it hasn't been configured or tested there).

## Project structure

```
app/                      expo-router routes
  (tabs)/index.tsx           quick-add check-in screen (the default route)
  (tabs)/history.tsx         list of past days (avg/median)
  day/[date].tsx              individual entries for one day
  entry/[id].tsx              edit one past check-in (mood + note)
src/
  components/               MoodPicker, DaySummaryCard, EntryListItem, ...
  storage/moodStore.ts      local on-device store (AsyncStorage) + pub-sub for React
  hooks/useMoodEntries.ts   subscribes to the store, groups entries by day
  theme/                    colors, spacing, type scale, score-to-color mapping
  utils/                    average/median, day grouping, date formatting
```

## Data model

Everything lives under a single AsyncStorage key (`vane-bunny/mood-entries`) as a JSON array:

```ts
{
  id: string
  score: number   // 1-10
  note?: string
  timestamp: string  // ISO 8601
  updatedAt?: string // ISO 8601, present only once the entry has been edited
}
```

Editing an entry overwrites its `score` and `note` in place and stamps `updatedAt`; `timestamp` is deliberately left alone, so an edited check-in keeps the position in its day that it was logged at. `updatedAt` is absent on entries that have never been edited — including everything stored before editing existed — so old data loads as-is and there's no migration to run.

Daily average/median are computed client-side from that day's entries on every read — there's no backend to push the computation to, and at this data volume it doesn't need one.

## Install and run

Requires Node 20.19.4+, 22.13.0+, or 24.3.0+ (whatever React Native 0.86 supports — see `package.json`'s `engines` field). The exact version this project is developed against is pinned in `.nvmrc`; run `nvm use` to switch to it.

```
nvm use             # optional, matches .nvmrc
npm install
npm start           # Metro + QR code; scan it with Expo Go
npm run web         # http://localhost:8081
npm run android     # local native build onto an emulator/device (needs the Android SDK)
```

`npm start` with Expo Go is the quick path for JS-only changes. It only works while every native dependency matches the versions Expo Go bundles for the SDK — run `npx expo-doctor` if the app crashes on launch with "Native module is null" or a missing-native-function error, since that means a native package has drifted off its SDK 57 pin. Install native packages with `npx expo install <pkg>`, never plain `npm install <pkg>`, to keep them pinned.

No environment variables, no setup steps beyond `npm install` — there's nothing external to configure.

### Tests

```
npm test
```

Unit tests cover the pure logic in `src/utils/` — `stats.ts` (average/median edge cases), `date.ts` (local-timezone day bucketing, day-label formatting) and `encouragement.ts` — plus `src/storage/moodStore.ts`, whose load/add/update/delete behaviour runs against an in-memory `jest.mock` of `@react-native-async-storage/async-storage` instead of the real native module. It's all Jest + ts-jest in plain Node: no React Native rendering involved, so there's no `jest-expo` dependency to manage.

## Building for Android (EAS)

Build profiles live in `eas.json` (`development`, `preview`, `production`). `eas-cli` is deliberately _not_ a project dependency — Expo's tooling expects it installed globally or invoked via `npx` (the `build:*` npm scripts below do the latter), so:

```
npx eas-cli login       # your Expo account
npx eas-cli init        # one-time: creates the EAS project, writes projectId into app.json
npm run build:preview    # installable .apk for testing on a device
npm run build:production # .aab for the Play Store, versionCode auto-incremented by EAS
npm run submit:android   # uploads the latest production build to Play Console
```

`eas submit` needs a Google Play service account key saved as `google-service-account.json` in the project root (gitignored). See `TODO.md` for the full Play Store deployment checklist.

### Continuous deployment (GitHub Actions)

[`.github/workflows/eas-build-submit.yml`](.github/workflows/eas-build-submit.yml) automates the `build:production` + `submit:android` steps above. It triggers on:

- pushing a version tag matching `v*.*.*` (e.g. `git push origin v1.0.2`)
- manually, via the "Run workflow" button on the Actions tab (`workflow_dispatch`)

The job runs `eas build --platform android --profile production --auto-submit --no-wait`. The `--no-wait` flag is deliberate: the actual build compile and Play Store upload happen entirely on Expo's (EAS's) infrastructure, not the GitHub runner, so the CI job just queues both and exits in under a minute instead of blocking (and burning GitHub Actions minutes) for the ~15-20 minutes a full build + submit takes.

Trade-off: because of `--no-wait`, the GitHub Actions run only confirms that the build and submission were successfully _queued_ — not that they actually succeeded. Check [expo.dev](https://expo.dev) (the project's Builds/Submissions dashboard) for real status. There's no feedback loop back into GitHub yet (e.g. a Slack ping or a status check once the build/submit finishes) — that's a possible future improvement, not currently wired up.

Two repository secrets must be set under Settings → Secrets and variables → Actions before the workflow can run:

- **`EXPO_TOKEN`** — an Expo access token (expo.dev → account/org settings → Access Tokens) scoped to the `bunny-developer` org
- **`GOOGLE_SERVICE_ACCOUNT_JSON`** — the full contents of the local `google-service-account.json` used for `eas submit`

## Design direction

Muted, rounded, calm — the app deliberately avoids mood/emotion iconography (no emoji faces, no literal "tracker" branding). The 1–10 selector uses an abstract low-to-high color gradient instead.

## Out of scope for v1

- Cross-device sync (traded away for the no-account, no-server privacy stance — see above)
- Push notifications / reminders
- Data export
- Social or sharing features
- iOS build
