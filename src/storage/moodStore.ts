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
let loadFailed = false;
let loadPromise: Promise<void> | null = null;
// Serializes mutations so overlapping add/delete calls can't race each
// other's AsyncStorage writes, and each mutation always starts from the
// latest committed state rather than a stale snapshot taken at call time.
let writeQueue: Promise<void> = Promise.resolve();

const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    try {
      listener();
    } catch (error) {
      // A throwing subscriber must not take down the thing that notified it.
      // For a mutation that would mean reporting a save that already reached
      // disk as failed; for the initial load — whose promise is cached
      // forever and awaited by every mutation — it would lock the app out of
      // saving for the rest of the session.
      console.error('A mood store listener threw', error);
    }
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback if the runtime has no crypto.randomUUID: timestamp prefix plus
  // two random segments for meaningfully more entropy than one.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}

// A row that can't be read back — not an object, or a timestamp that doesn't
// parse — can't be grouped into a day, and re-serializing it would throw
// (`Invalid Date.toISOString()`), taking down every later write rather than
// just this row. Dropping it keeps the rest of the history usable and
// writable. Note the row survives on disk only until the next mutation
// rewrites the array, which discards it for good; that's the cost of staying
// writable, and it only applies to rows that were already unreadable.
function hydrateEntry(stored: StoredEntry): MoodEntry | null {
  if (typeof stored !== 'object' || stored === null) {
    console.error('Discarding an unreadable stored mood entry', stored);
    return null;
  }
  const timestamp = new Date(stored.timestamp);
  if (Number.isNaN(timestamp.getTime())) {
    console.error('Discarding a stored mood entry with an unreadable timestamp', stored.id);
    return null;
  }
  const updatedAt = stored.updatedAt ? new Date(stored.updatedAt) : undefined;
  return {
    ...stored,
    timestamp,
    // An unreadable edit stamp only costs the "edited" marker, so it isn't
    // worth dropping the whole entry over.
    updatedAt: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : undefined,
  };
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
    // `loadMoodEntries` dedupes to a single read and never rejects, so
    // awaiting it here is cheap — but it can come back having failed, which
    // is what the next check is for.
    await loadMoodEntries();
    if (loadFailed) {
      // The read failed, so the empty `entries` is a fallback, not a fact
      // about what's on disk. Writing now would put this one change over a
      // history we simply couldn't read. Refuse instead — the data survives,
      // and the caller gets to say so.
      throw new Error('Mood entries could not be loaded; refusing to overwrite stored data');
    }
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
    loadFailed = false;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          throw new Error('Stored mood entries are not an array');
        }
        entries = (parsed as StoredEntry[])
          .map(hydrateEntry)
          .filter((entry): entry is MoodEntry => entry !== null)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }
    } catch (error) {
      // `entries` stays empty so the app still renders, but this is a
      // fallback, not a reading of what's on disk — `loadFailed` stops
      // mutations from treating it as one and writing over the real data.
      console.error('Failed to load mood entries', error);
      entries = [];
      loadFailed = true;
      // Drop the cached promise so the next call reads again instead of
      // replaying this failure for the life of the process — a read that
      // failed once at startup may well succeed by the time something tries
      // to save.
      loadPromise = null;
    } finally {
      loaded = true;
      notify();
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
