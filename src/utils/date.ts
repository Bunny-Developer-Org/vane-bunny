import type { DaySummary, MoodEntry } from '../types';
import { average, median, roundToOneDecimal } from './stats';

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
    const sorted = [...dayEntries].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
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

export function formatDayLabel(dateKey: string): string {
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
