# Vane Bunny

A soft, minimal mood-tracking app. Log a mood score (1–10) as many times a day as you like — no daily limit, no clutter. Built with Expo (React Native), targeting Android and Web from one codebase.

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
}
```

Daily average/median are computed client-side from that day's entries on every read — there's no backend to push the computation to, and at this data volume it doesn't need one.

## Install and run

```
npm install
npm run web        # http://localhost:8081
npm run android     # requires an emulator or device + Expo dev client / Expo Go
```

No environment variables, no setup steps beyond `npm install` — there's nothing external to configure.

## Building for Android (EAS)

Build profiles live in `eas.json` (`development`, `preview`, `production`) and `eas-cli` is a dev dependency, so:

```
npx eas login          # your Expo account
npx eas init            # one-time: creates the EAS project, writes projectId into app.json
npm run build:preview    # installable .apk for testing on a device
npm run build:production # .aab for the Play Store, versionCode auto-incremented by EAS
npm run submit:android   # uploads the latest production build to Play Console
```

`eas submit` needs a Google Play service account key saved as `google-service-account.json` in the project root (gitignored). See `TODO.md` for the full Play Store deployment checklist.

## Design direction

Muted, rounded, calm — the app deliberately avoids mood/emotion iconography (no emoji faces, no literal "tracker" branding). The 1–10 selector uses an abstract low-to-high color gradient instead.

## Out of scope for v1

- Cross-device sync (traded away for the no-account, no-server privacy stance — see above)
- Push notifications / reminders
- Data export
- Social or sharing features
- iOS build
