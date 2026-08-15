export interface MoodEntry {
  id: string;
  score: number; // 1-10
  note?: string;
  timestamp: Date;
  // Set only once an entry has been edited after the fact. Entries written
  // before editing existed (and never-edited ones) simply don't have it, so
  // the field stays optional rather than defaulting to `timestamp`.
  updatedAt?: Date;
}

export interface DaySummary {
  dateKey: string; // YYYY-MM-DD, local
  average: number;
  median: number;
  count: number;
  entries: MoodEntry[];
}
