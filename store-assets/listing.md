# Google Play Store Listing — Vane Bunny

Everything here is ready to paste into Play Console. Character counts are
checked against Play's limits (title ≤30, short description ≤80, full
description ≤4000).

## App title (10/30 chars)

```
Vane Bunny
```

## Short description (65/80 chars)

```
A quiet place to notice how you're doing, one check-in at a time.
```

## Full description (964/4000 chars)

```
Vane Bunny is a soft, minimal mood check-in app. No feeds, no streaks to
protect, no pressure — just a quick moment to notice how you're doing.

HOW IT WORKS
Log a mood score from 1 to 10 as many times a day as you like, with an
optional short note. The whole check-in takes under 10 seconds. See your
average and median for today right on the check-in screen, and browse your
history by day — tap into any day to see the individual entries behind it.

PRIVATE BY DESIGN
Vane Bunny collects nothing. There's no account, no sign-in, no analytics,
no crash reporting, and no network access at all. Every check-in is stored
only on your device. Nothing is ever sent anywhere — not to us, not to
anyone. Delete any entry any time; uninstalling removes everything.

CALM, NOT CLINICAL
Soft, muted colors and rounded shapes throughout, with three gentle color
themes to choose from in Settings. No emoji faces, no red/yellow/green
mood-o-meter, no guilt trips about "bad" days — just an honest, quiet
record of how you've been.

Vane Bunny is a personal tool, not a substitute for professional mental
health support.
```

## Store graphics

| Asset | File | Spec |
|---|---|---|
| App icon | `icon-512.png` | 512×512, 32-bit PNG, no alpha |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500, PNG/JPEG |
| Phone screenshots | `screenshots/*.png` | 1080×1920 (16:9), min 2 required |

Screenshots show, in order: the check-in screen with today's stats, the
History list across several days, a day's individual entries, and the
Settings screen with the theme picker.

## Other Play Console fields (not asset/text files, just noted here)

- **Category**: Health & Fitness (or Lifestyle)
- **Content rating questionnaire**: no user-generated content shared with
  others, no ads, no account — should land in the lowest rating tier
- **Privacy policy URL**: see `docs/privacy-policy.html` — needs hosting
  (e.g. GitHub Pages) before it can be linked here; see `TODO.md`
- **Data safety section**: "No data collected" — accurate, since nothing
  ever leaves the device
- **Target audience**: general audience, not designed for or directed at
  children
