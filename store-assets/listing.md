# Google Play Store Listing — Vane Bunny

## Language-specific text

See the language-specific files for app text that varies by locale:
- **English**: `listing-EN.md`
- **Polski (Polish)**: `listing-PL.md`

Each file includes title, short description, and full description with character
counts checked against Play's limits (title ≤30, short description ≤80, full
description ≤4000).

---

## Store graphics (shared across all languages)

| Asset | File | Spec |
|---|---|---|
| App icon | `icon-512.png` | 512×512, 32-bit PNG, no alpha |
| Feature graphic | `feature-graphic-1024x500.png` | 1024×500, PNG/JPEG |
| Phone screenshots | `screenshots/mobile/*.png` | 1080×2340, min 2 required |

Screenshots show, in order: the check-in screen with today's stats, the
History list, a day's individual entries, and the Settings screen with the
theme picker. `screenshots/mobile/` holds the ones to upload to Play
Console (real phone viewport, captured from the actual running app);
`screenshots/web/` keeps the earlier desktop-browser captures for
reference only — don't upload those, their aspect ratio doesn't match a
phone screen.

## Other Play Console fields (not asset/text files, just noted here)

- **Category**: Health & Fitness (or Lifestyle)
- **Content rating questionnaire**: no user-generated content shared with
  others, no ads, no account — should land in the lowest rating tier
- **Privacy policy URL**: `https://bunny-developer-org.github.io/vane-bunny/privacy-policy.html`
- **Data safety section**: "No data collected" — accurate, since nothing
  ever leaves the device
- **Target audience**: general audience, not designed for or directed at
  children
