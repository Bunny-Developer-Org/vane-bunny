import type { LanguageCode } from '../i18n';
import type { DaySummary, MoodEntry } from '../types';
import { average, median, roundToOneDecimal } from './stats';

const LOCALE_TAGS: Record<LanguageCode, string> = { en: 'en-US', pl: 'pl-PL' };
const TODAY_LABEL: Record<LanguageCode, string> = { en: 'Today', pl: 'Dzisiaj' };
const YESTERDAY_LABEL: Record<LanguageCode, string> = { en: 'Yesterday', pl: 'Wczoraj' };
const DEFAULT_LANGUAGE: LanguageCode = 'en';

// Local (device timezone) date key, so "today" lines up with what the user sees.
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function groupEntriesByDay(entries: MoodEntry[]): DaySummary[] {
  const byDay = new Map<string, MoodEntry[]>();

  for (const entry of entries) {
    const key = toDateKey(entry.timestamp);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      byDay.set(key, [entry]);
    }
  }

  const summaries: DaySummary[] = [];
  for (const [dateKey, dayEntries] of byDay) {
    const sorted = [...dayEntries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const scores = sorted.map((entry) => entry.score);
    summaries.push({
      dateKey,
      average: roundToOneDecimal(average(scores)),
      median: roundToOneDecimal(median(scores)),
      count: sorted.length,
      entries: sorted,
    });
  }

  return summaries.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
}

export function formatDayLabel(dateKey: string, language: LanguageCode = DEFAULT_LANGUAGE): string {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  if (dateKey === today) return TODAY_LABEL[language];
  if (dateKey === yesterday) return YESTERDAY_LABEL[language];

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(LOCALE_TAGS[language], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date, language: LanguageCode = DEFAULT_LANGUAGE): string {
  return date.toLocaleTimeString(LOCALE_TAGS[language], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ordinalSuffix(day: number): string {
  if (day % 10 === 1 && day !== 11) return 'st';
  if (day % 10 === 2 && day !== 12) return 'nd';
  if (day % 10 === 3 && day !== 13) return 'rd';
  return 'th';
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// "Saturday, July 18th" in English — Intl has no ordinal-day format, so build
// it by hand. Polish dates don't use ordinal suffixes ("18 lipca", not
// "18-ty lipca"), so it gets its own simpler weekday/day/month order.
export function formatHeaderDate(date: Date, language: LanguageCode = DEFAULT_LANGUAGE): string {
  const locale = LOCALE_TAGS[language];
  const weekday = capitalize(date.toLocaleDateString(locale, { weekday: 'long' }));
  const day = date.getDate();

  if (language === 'pl') {
    // day + month must be formatted together, not as separate calls — Polish
    // month names are only genitive ("18 lipca") in that combined form;
    // formatted alone they come back nominative ("lipiec").
    const dayMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
    return `${weekday}, ${dayMonth}`;
  }
  const month = date.toLocaleDateString(locale, { month: 'long' });
  return `${weekday}, ${month} ${day}${ordinalSuffix(day)}`;
}
