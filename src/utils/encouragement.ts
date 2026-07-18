import type { LanguageCode } from '../i18n';

// Short, positive, varied by how the check-in went. Never clinical, never
// guilt-tripping about low scores — just a warm acknowledgment. Polish
// messages avoid 2nd-person past-tense verbs (which inflect by gender in
// Polish) since we don't know the user's gender.
const MESSAGES: Record<LanguageCode, { low: string[]; mid: string[]; high: string[] }> = {
  en: {
    low: [
      'Thanks for checking in — that matters.',
      'Noted, gently. Glad you took a moment for this.',
      'Thank you for being honest with yourself.',
    ],
    mid: [
      'Logged. Nice work checking in.',
      'Thanks for showing up for yourself today.',
      'Noted — appreciate you taking the moment.',
    ],
    high: [
      'Love that. Thanks for sharing!',
      'Great to hear — keep it up.',
      'Wonderful. Thanks for checking in!',
    ],
  },
  pl: {
    low: [
      'Dzięki za wpis — to się liczy.',
      'Zapisane, z czułością. Dobrze, że jest na to chwila.',
      'Dziękujemy za szczerość wobec siebie.',
    ],
    mid: [
      'Zapisano. Dobra robota z wpisem.',
      'Dziękujemy za troskę o siebie dzisiaj.',
      'Zanotowane — doceniamy tę chwilę dla siebie.',
    ],
    high: [
      'Super, dziękujemy za podzielenie się!',
      'Świetnie to słyszeć — tak trzymaj.',
      'Wspaniale. Dzięki za wpis!',
    ],
  },
};

export function getThankYouMessage(score: number, language: LanguageCode = 'en'): string {
  const pools = MESSAGES[language];
  const pool = score <= 3 ? pools.low : score <= 7 ? pools.mid : pools.high;
  return pool[Math.floor(Math.random() * pool.length)];
}
