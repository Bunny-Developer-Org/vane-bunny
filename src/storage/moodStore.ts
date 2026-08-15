import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MoodEntry } from '../types';

// Everything lives on-device only — nothing here ever talks to a server.
const STORAGE_KEY = 'vane-bunny/mood-entries';

type Listener = () => void;
type StoredEntry = Omit<MoodEntry, 'timestamp' | 'updatedAt'> & {
  timestamp: string;
  updatedAt?: string;
};

let entries: MoodEntry[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
// Serializes mutations so overlapping add/delete calls can't race each
// other's AsyncStorage writes, and each mutation always starts from the
// latest committed state rather than a stale snapshot taken at call time.
let writeQueue: Promise<void> = Promise.resolve();

const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback if the runtime has no crypto.randomUUID: timestamp prefix plus
  // two random segments for meaningfully more entropy than one.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function persistEntries(list: MoodEntry[]): Promise<void> {
  const payload: StoredEntry[] = list.map((entry) => ({
    ...entry,
    timestamp: entry.timestamp.toISOString(),
    updatedAt: entry.updatedAt ? entry.updatedAt.toISOString() : undefined,
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

// Runs `mutate` and persists its result before committing it as the new
// live state, so a save/delete that fails to persist never gets reported
// to subscribers as having happened. Queued behind any earlier mutation so
// writes land on disk in the order they were requested.
function enqueueMutation(mutate: (current: MoodEntry[]) => MoodEntry[]): Promise<void> {
  const task = writeQueue.then(async () => {
    // Never mutate a half-hydrated store. Until the initial read lands,
    // `entries` is still the empty array it starts as, so persisting a
    // mutation of it would write that one change over everything already on
    // disk — a check-in saved during startup would wipe the whole history.
    // `loadMoodEntries` dedupes to a single read and handles its own
    // failures, so awaiting it here is cheap and can't reject.
    await loadMoodEntries();
    const next = mutate(entries);
    await persistEntries(next);
    entries = next;
    notify();
  });
  // Keep the queue alive even if this mutation fails, so a later one isn't
  // blocked forever; the failure still propagates to this call's caller
  // via the returned (non-caught) `task` promise.
  writeQueue = task.catch(() => {});
  return task;
}

export function loadMoodEntries(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredEntry[];
        entries = parsed
          .map((entry) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
            updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : undefined,
          }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }
    } catch (error) {
      console.error('Failed to load mood entries; starting from empty', error);
      entries = [];
    } finally {
      loaded = true;
      try {
        notify();
      } catch (error) {
        // `loadPromise` is cached forever and every mutation awaits it, so
        // letting a throwing subscriber reject it here would lock the app
        // out of saving for the rest of the session — long after the load
        // itself succeeded.
        console.error('A mood store listener threw while handling the load', error);
      }
    }
  })();
  return loadPromise;
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

export function addMoodEntry(score: number, note: string): Promise<void> {
  const trimmedNote = note.trim();
  return enqueueMutation((current) => [
    {
      id: generateId(),
      score,
      note: trimmedNote ? trimmedNote : undefined,
      timestamp: new Date(),
    },
    ...current,
  ]);
}

// Edits an existing entry in place. `timestamp` is deliberately left alone —
// an edited check-in still belongs to the moment it was logged, so it keeps
// its position in its day — and `updatedAt` records that it was changed.
export function updateMoodEntry(id: string, score: number, note: string): Promise<void> {
  const trimmedNote = note.trim();
  return enqueueMutation((current) =>
    current.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            score,
            note: trimmedNote ? trimmedNote : undefined,
            updatedAt: new Date(),
          }
        : entry,
    ),
  );
}

export function deleteMoodEntry(id: string): Promise<void> {
  return enqueueMutation((current) => current.filter((entry) => entry.id !== id));
}
