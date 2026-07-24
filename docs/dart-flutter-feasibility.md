# Feasibility: porting Vane Bunny to Dart/Flutter

Requested by: pawel@gradziel.com — evaluate rewriting the current Expo/React
Native app in Dart/Flutter, with two goals: (1) require zero Android
permissions, (2) smaller app size. This report estimates whether those goals
are actually achievable via a rewrite, and how much work it would take.

## Verdict

**Feasible as a rewrite, but neither goal is a strong reason to do it.**

- The "no permissions" goal is *already ~95% true today*. The only gap
  Flutter closes is a single, user-invisible manifest permission
  (`INTERNET`) that never triggers a prompt and isn't shown as a grantable
  permission on-device — closing it is real but cosmetic.
- The "smaller app size" goal is not reliably achievable by switching
  frameworks. Flutter carries its own rendering engine (Skia/Impeller) and
  ICU data in every build; for an app this simple, that fixed engine cost
  is comparable to or larger than what Hermes/RN needs. Published
  benchmarks disagree on which is smaller, and the delta is single-digit
  MB either way.
- The app itself is small (~2,500 lines) and has no backend, no native
  modules besides local storage, and no risky permissions to begin with —
  so a rewrite is *tractable* (roughly 1.5–2 weeks for someone fluent in
  Flutter). But it buys little beyond what's already true, and costs a
  full rebuild of UI, i18n, storage, theming, tests, and the Play
  Store/CI pipeline.

If the real motivation is something other than these two goals (e.g.
wanting iOS support, wanting a different long-term stack, or general
interest in Flutter), that's a separate and more legitimate case — happy
to evaluate that angle too.

## Current app profile

- ~2,500 lines of TypeScript/TSX across 4 screens (check-in, history, day
  detail, settings), 7 shared components, a theme system, a hand-rolled
  i18n layer (EN/PL with pluralization), and a local-only storage layer.
- Single dependency for persistence: `@react-native-async-storage/async-storage`,
  storing one JSON blob under one key. No SQL, no files, no native modules
  beyond that.
- No backend, no accounts, no analytics, no crash reporting, no network
  calls of any kind (`docs/privacy-policy.html` states this explicitly).
- Shipping target: **Android only** (Play Store, via EAS build + GitHub
  Actions). Web build exists (`npm run web`) but is a local dev/preview
  target, not something published anywhere. iOS is unconfigured.
- Android permissions today, per `app.json`'s `android.blockedPermissions`
  and `docs/privacy-policy.html`:
  - Explicitly blocked: `SYSTEM_ALERT_WINDOW`, `VIBRATE`,
    `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`.
  - One permission left and currently *not* removable in this Expo/RN
    setup: `INTERNET`. It's unused by app code — it's baked into React
    Native's Android template for Metro/dev-tooling connectivity, and
    Expo's managed build can't strip it without breaking the framework.

## Goal 1: "require no permissions"

Two different things get conflated under "permissions," and the distinction
matters for how much this goal is even worth pursuing:

1. **Runtime/dangerous permissions** — the ones that pop a system dialog
   asking the user to grant camera, location, contacts, storage, etc.
   Vane Bunny requests **none of these today**, on either stack. Nothing
   changes here with a rewrite; there's no user-facing prompt to remove
   because there isn't one now.
2. **Manifest-declared "normal" permissions** — like `INTERNET`, which
   Android grants automatically at install time, never prompts for, and
   doesn't surface in Settings → App permissions. It's still listed in the
   Play Console's technical manifest and visible to anyone who inspects
   the APK/AAB.

Today's gap is entirely category 2: `INTERNET`, declared but unused,
non-blockable in the current Expo managed workflow.

Flutter can close this gap cleanly. Flutter's official Android template
ships `INTERNET` only in the **debug and profile** manifests (needed for
the VM service / hot reload); the **release** manifest doesn't declare it
unless you add it yourself. This is a supported, common pattern — the
Flutter docs explicitly say to remove `INTERNET` from the release manifest
if the app doesn't need network access. For an app like this, a Flutter
release build would ship with **zero declared Android permissions**.

**Net effect of switching:** removes one cosmetic, invisible-to-users
manifest line. It doesn't change what a user experiences (no dialog exists
either way), and Play Console's "Data safety" section already correctly
says "No data collected" today regardless of `INTERNET` being declared.
It's a legitimate but small win — worth having if the rewrite happens for
other reasons, not a strong reason on its own.

## Goal 2: "smaller app size"

This doesn't hold up as a rewrite justification:

- Flutter bundles its own graphics engine (Skia or Impeller) and ICU
  locale data into every release build, regardless of app complexity.
  That's a fixed cost on the order of several MB (compressed, per-ABI)
  that a React Native/Hermes app doesn't pay in the same way — Hermes
  bytecode is compact and RN's native footprint is generally lighter for
  small apps.
- Expo's managed build does carry some baseline overhead from autolinked
  Expo modules (`expo-router`, `expo-constants`, `expo-linking`,
  `expo-splash-screen`, `expo-status-bar` here), but this app's dependency
  list is already minimal — there's not much fat to trim by leaving Expo.
- Public benchmarks on this are inconsistent and contradict each other
  (some show RN ~2-4MB smaller than Flutter; others show the reverse for
  optimized builds) — treat any single number from a blog post skeptically.
  For an app this size, with Play's per-device App Bundle delivery and R8
  shrinking/ABI splitting on either stack, the realistic difference is
  low single-digit MB, and could go either direction.
- If Web is ever actually shipped (not just used for local dev), Flutter
  Web is typically *heavier* than `react-native-web` for a simple app
  (CanvasKit/renderer payload), which would work against this goal.

**Net effect of switching:** no reliable size win, possibly a slight loss.

## What a rewrite would actually involve

| Area | Current (Expo/RN) | Flutter equivalent | Est. effort |
|---|---|---|---|
| Screens (check-in, history, day detail, settings) — 615 lines | expo-router file routes | `go_router` or Navigator 2.0 | 2–3 days |
| Shared components (MoodPicker, DaySummaryCard, EntryListItem, ConfirmDialog, PrimaryButton, Toast, Logo) — ~500 lines | RN views/styles | Flutter widgets | included above |
| Theme system (palettes, score→color, type scale) — ~215 lines | custom `ThemeContext` | `ThemeData`/custom `InheritedWidget` | 0.5 day |
| i18n (EN/PL + pluralization) — ~140 lines + context | hand-rolled `I18nContext` | `intl`/ARB + Flutter's built-in localization gen | 0.5–1 day |
| Storage (single JSON blob, pub-sub) | AsyncStorage + hand-rolled store | `shared_preferences` + `ChangeNotifier`/Riverpod | 0.5 day |
| Pure logic (date/stats/encouragement) + tests | TS + Jest | Dart + `flutter_test` | 0.5–1 day |
| Android packaging (icons, splash, signing continuity, permission stripping) | `app.json`, EAS | `flutter_launcher_icons`, Gradle, same `applicationId`/keystore | 0.5 day |
| CI/CD (build + auto-submit to Play Store) | GitHub Actions + EAS | GitHub Actions + Flutter build + fastlane (or manual) | 1 day |
| Manual QA (both languages, all screens, regression) | — | — | 1 day |

**Estimate: ~7–10 working days** for a developer already fluent in
Flutter/Dart. Add 1–2 weeks of buffer if this is a first Flutter project —
the learning curve (widget model, state management choice, Gradle/Play
publishing differences) is the single biggest variable in this estimate,
larger than the app's actual size.

Play Store continuity is manageable either way: same `applicationId`
(`com.bunnydeveloper.vanebunny`), same Play App Signing enrollment, existing
users get it as a normal update — no data migration needed since storage
is already just a JSON blob that a Dart rewrite can read/write in the same
shape if desired, or accept a clean slate given the app already discloses
that reinstalls lose history.

## Recommendation

Don't rewrite for these two goals specifically — the permissions gap is
real but invisible to users and Play Store already reports "No data
collected" either way, and the size argument doesn't hold up under
scrutiny. If there's a different underlying motivation (iOS support,
wanting to standardize on Flutter for other projects, etc.), that's worth
discussing separately since it would change the cost/benefit math
considerably.
