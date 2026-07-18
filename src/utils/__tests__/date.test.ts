import { formatDayLabel, formatTime, groupEntriesByDay, toDateKey } from '../date';
import type { MoodEntry } from '../../types';

function entry(id: string, score: number, timestamp: Date, note?: string): MoodEntry {
  return { id, score, note, timestamp };
}

describe('toDateKey', () => {
  it('formats a date as local YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pads single-digit months and days', () => {
    expect(toDateKey(new Date(2026, 8, 3))).toBe('2026-09-03');
  });

  it('is based on local time, not UTC — a late-night entry keeps its local date', () => {
    // 2026-01-05 23:30 local time should still key to the 5th, not roll to the 6th.
    expect(toDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});

describe('groupEntriesByDay', () => {
  it('returns an empty array for no entries', () => {
    expect(groupEntriesByDay([])).toEqual([]);
  });

  it('buckets entries by local day and computes average/median/count per day', () => {
    const entries: MoodEntry[] = [
      entry('a', 4, new Date(2026, 0, 5, 9, 0)),
      entry('b', 8, new Date(2026, 0, 5, 18, 0)),
      entry('c', 6, new Date(2026, 0, 6, 10, 0)),
    ];

    const days = groupEntriesByDay(entries);

    expect(days).toHaveLength(2);
    const jan5 = days.find((d) => d.dateKey === '2026-01-05')!;
    expect(jan5.count).toBe(2);
    expect(jan5.average).toBe(6);
    expect(jan5.median).toBe(6);
    const jan6 = days.find((d) => d.dateKey === '2026-01-06')!;
    expect(jan6.count).toBe(1);
    expect(jan6.average).toBe(6);
  });

  it('sorts days most-recent-first', () => {
    const entries: MoodEntry[] = [
      entry('a', 5, new Date(2026, 0, 1)),
      entry('b', 5, new Date(2026, 0, 10)),
      entry('c', 5, new Date(2026, 0, 5)),
    ];

    const days = groupEntriesByDay(entries);

    expect(days.map((d) => d.dateKey)).toEqual(['2026-01-10', '2026-01-05', '2026-01-01']);
  });

  it('sorts entries within a day most-recent-first', () => {
    const entries: MoodEntry[] = [
      entry('early', 3, new Date(2026, 0, 5, 8, 0)),
      entry('late', 9, new Date(2026, 0, 5, 20, 0)),
    ];

    const [day] = groupEntriesByDay(entries);

    expect(day.entries.map((e) => e.id)).toEqual(['late', 'early']);
  });
});

describe('formatDayLabel', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 6, 18, 12, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('labels the current local date as Today', () => {
    expect(formatDayLabel('2026-07-18')).toBe('Today');
  });

  it('labels the previous local date as Yesterday', () => {
    expect(formatDayLabel('2026-07-17')).toBe('Yesterday');
  });

  it('formats older dates as a weekday/month/day string, not Today or Yesterday', () => {
    const label = formatDayLabel('2026-07-01');
    expect(label).not.toBe('Today');
    expect(label).not.toBe('Yesterday');
    expect(label.length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  it('returns a non-empty time string', () => {
    const label = formatTime(new Date(2026, 0, 1, 14, 5));
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);
  });
});
