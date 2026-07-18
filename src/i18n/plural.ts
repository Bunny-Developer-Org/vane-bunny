import type { LanguageCode } from './I18nContext';
import type { TranslationKey } from './translations';

// English distinguishes one/other; Polish distinguishes one/few/many, with
// "few" (2-4, excluding 12-14) and "many" (0, 5+, 11-14) taking different
// noun endings — e.g. "1 wpis", "3 wpisy", "5 wpisów". Getting this wrong
// (a plain singular/plural ternary) reads as a grammar mistake to any
// Polish speaker, so counts route through this instead.
function pluralForm(count: number, language: LanguageCode): 'One' | 'Few' | 'Many' {
  if (count === 1) return 'One';
  if (language !== 'pl') return 'Many';
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
    return 'Few';
  }
  return 'Many';
}

export function pluralEntryKey(count: number, language: LanguageCode): TranslationKey {
  const form = pluralForm(count, language);
  return form === 'One'
    ? 'common.entryOne'
    : form === 'Few'
      ? 'common.entryFew'
      : 'common.entryMany';
}

export function pluralCheckInKey(count: number, language: LanguageCode): TranslationKey {
  const form = pluralForm(count, language);
  return form === 'One'
    ? 'checkIn.checkInOne'
    : form === 'Few'
      ? 'checkIn.checkInFew'
      : 'checkIn.checkInMany';
}
