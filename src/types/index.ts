export interface MoodEntry {
  id: string;
  score: number; // 1-10
  note?: string;
  timestamp: Date;
}

export interface DaySummary {
  dateKey: string; // YYYY-MM-DD, local
  average: number;
  median: number;
  count: number;
  entries: MoodEntry[];
}

