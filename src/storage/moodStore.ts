import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodEntry } from '../types';

// Everything lives on-device only — nothing here ever talks to a server.
const STORAGE_KEY = 'vane-bunny/mood-entries';

type Listener = () => void;
type StoredEntry = Omit<MoodEntry, 'timestamp'> & { timestamp: string };

let entries: MoodEntry[] = [];
let loaded = false;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function persist(): Promise<void> {
  const payload: StoredEntry[] = entries.map((entry) => ({
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function loadMoodEntries(): Promise<void> {
  if (loaded) return;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as StoredEntry[];
    entries = parsed
      .map((entry) => ({ ...entry, timestamp: new Date(entry.timestamp) }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  loaded = true;
  notify();
}

export function isMoodStoreLoaded(): boolean {
  return loaded;
}

export function getMoodEntries(): MoodEntry[] {
  return entries;
}

export function subscribeToMoodStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function addMoodEntry(score: number, note: string): Promise<void> {
  const entry: MoodEntry = {
    id: generateId(),
    score,
    note: note.trim() ? note.trim() : undefined,
    timestamp: new Date(),
  };
  entries = [entry, ...entries];
  notify();
  await persist();
}

export async function deleteMoodEntry(id: string): Promise<void> {
  entries = entries.filter((entry) => entry.id !== id);
  notify();
  await persist();
}
