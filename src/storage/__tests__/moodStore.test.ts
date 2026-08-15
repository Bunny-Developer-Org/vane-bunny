import type { MoodEntry } from '../../types';

const STORAGE_KEY = 'vane-bunny/mood-entries';

// The real package is a native module and can't load under jest, so the whole
// store is exercised against this in-memory stand-in. `mock`-prefixed names are
// the only out-of-scope references jest allows inside a hoisted mock factory.
const mockStorage: { value: string | null } = { value: null };

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (_key: string) => mockStorage.value),
    setItem: jest.fn(async (_key: string, value: string) => {
      mockStorage.value = value;
    }),
  },
}));

type MoodStore = typeof import('../moodStore');
type AsyncStorageMock = {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

type StoredEntry = {
  id: string;
  score: number;
  note?: string;
  timestamp: string;
  updatedAt?: string;
};

// moodStore keeps its entries in module-level state, so each test needs a fresh
// copy of the module rather than a shared one carrying the previous test's data.
// Omitting `stored` leaves whatever is already in storage alone, which is how a
// second instance can be pointed at what the first one wrote.
function freshStore(stored?: StoredEntry[]): { store: MoodStore; storage: AsyncStorageMock } {
  if (stored) mockStorage.value = JSON.stringify(stored);
  jest.resetModules();
  /* eslint-disable @typescript-eslint/no-require-imports --
     `jest.resetModules()` only changes what a later `require` resolves to.
     A static import is bound once when this file loads, so it would keep
     handing back the first instance and every test would share its state. */
  const storage = (
    require('@react-native-async-storage/async-storage') as { default: AsyncStorageMock }
  ).default;
  return { store: require('../moodStore') as MoodStore, storage };
  /* eslint-enable @typescript-eslint/no-require-imports */
}

// A real AsyncStorage read crosses the native bridge and takes milliseconds;
// the default mock resolves in a microtask, which is far too fast to expose
// anything racing hydration.
function delayReads(storage: AsyncStorageMock, ms = 20) {
  storage.getItem.mockImplementation(
    () => new Promise((resolve) => setTimeout(() => resolve(mockStorage.value), ms)),
  );
}

function lastWrite(storage: AsyncStorageMock): StoredEntry[] {
  const calls = storage.setItem.mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  return JSON.parse(calls[calls.length - 1][1] as string) as StoredEntry[];
}

const SEED: StoredEntry[] = [
  { id: 'older', score: 3, note: 'rough morning', timestamp: '2026-01-05T08:00:00.000Z' },
  {
    id: 'newer',
    score: 8,
    note: 'good evening',
    timestamp: '2026-01-06T19:00:00.000Z',
    updatedAt: '2026-01-06T20:00:00.000Z',
  },
];

beforeEach(() => {
  mockStorage.value = null;
  jest.resetModules();
  jest.clearAllMocks();
});

describe('loadMoodEntries', () => {
  it('hydrates entries from stored JSON, revives dates, and sorts newest-first', async () => {
    const { store } = freshStore(SEED);

    await store.loadMoodEntries();
    const entries = store.getMoodEntries();

    expect(store.isMoodStoreLoaded()).toBe(true);
    expect(entries.map((e) => e.id)).toEqual(['newer', 'older']);
    expect(entries[0].timestamp).toBeInstanceOf(Date);
    expect(entries[0].timestamp.toISOString()).toBe('2026-01-06T19:00:00.000Z');
    expect(entries[0].updatedAt).toBeInstanceOf(Date);
    expect(entries[0].updatedAt?.toISOString()).toBe('2026-01-06T20:00:00.000Z');
  });

  it('leaves updatedAt undefined for entries written before editing existed', async () => {
    const { store } = freshStore(SEED);

    await store.loadMoodEntries();

    expect(store.getMoodEntries().find((e) => e.id === 'older')?.updatedAt).toBeUndefined();
  });

  it('starts from an empty list when nothing has been stored yet', async () => {
    const { store } = freshStore();

    await store.loadMoodEntries();

    expect(store.getMoodEntries()).toEqual([]);
  });
});

describe('addMoodEntry', () => {
  it('prepends the new entry and trims the note', async () => {
    const { store } = freshStore(SEED);
    await store.loadMoodEntries();

    await store.addMoodEntry(6, '  steady  ');
    const entries = store.getMoodEntries();

    expect(entries).toHaveLength(3);
    expect(entries[0].score).toBe(6);
    expect(entries[0].note).toBe('steady');
    expect(entries[0].timestamp).toBeInstanceOf(Date);
    expect(entries.slice(1).map((e) => e.id)).toEqual(['newer', 'older']);
  });

  it('stores no note at all when given only whitespace', async () => {
    const { store } = freshStore();
    await store.loadMoodEntries();

    await store.addMoodEntry(5, '   ');

    expect(store.getMoodEntries()[0].note).toBeUndefined();
  });
});

describe('updateMoodEntry', () => {
  it('edits only the matching entry, keeps its timestamp, and records updatedAt', async () => {
    const { store } = freshStore(SEED);
    await store.loadMoodEntries();
    const before = Date.now();

    await store.updateMoodEntry('older', 7, '  actually fine  ');
    const entries = store.getMoodEntries();
    const edited = entries.find((e) => e.id === 'older') as MoodEntry;
    const untouched = entries.find((e) => e.id === 'newer') as MoodEntry;

    expect(edited.score).toBe(7);
    expect(edited.note).toBe('actually fine');
    expect(edited.timestamp.toISOString()).toBe('2026-01-05T08:00:00.000Z');
    expect(edited.updatedAt).toBeInstanceOf(Date);
    expect(edited.updatedAt!.getTime()).toBeGreaterThanOrEqual(before);
    expect(untouched.score).toBe(8);
    expect(untouched.note).toBe('good evening');
    expect(untouched.updatedAt?.toISOString()).toBe('2026-01-06T20:00:00.000Z');
  });

  it('clears the note when passed an empty or whitespace-only string', async () => {
    const { store } = freshStore(SEED);
    await store.loadMoodEntries();

    await store.updateMoodEntry('newer', 8, '  ');

    expect(store.getMoodEntries().find((e) => e.id === 'newer')?.note).toBeUndefined();
  });

  it('leaves every entry unchanged for an unknown id', async () => {
    const { store } = freshStore(SEED);
    await store.loadMoodEntries();
    const snapshot = store.getMoodEntries().map((e) => ({ ...e }));

    await store.updateMoodEntry('does-not-exist', 1, 'ignored');

    expect(store.getMoodEntries()).toEqual(snapshot);
  });

  it('persists the edit, round-tripping updatedAt as an ISO string', async () => {
    const { store, storage } = freshStore(SEED);
    await store.loadMoodEntries();

    await store.updateMoodEntry('older', 9, 'better now');
    const written = lastWrite(storage);

    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
    const persisted = written.find((e) => e.id === 'older') as StoredEntry;
    expect(persisted.score).toBe(9);
    expect(persisted.note).toBe('better now');
    expect(persisted.timestamp).toBe('2026-01-05T08:00:00.000Z');
    expect(new Date(persisted.updatedAt as string).toISOString()).toBe(persisted.updatedAt);

    // A reload from the same storage must see the edit, not the seeded values.
    const reloaded = freshStore();
    await reloaded.store.loadMoodEntries();
    expect(reloaded.store.getMoodEntries().find((e) => e.id === 'older')?.score).toBe(9);
  });
});

describe('deleteMoodEntry', () => {
  it('removes only the matching entry and persists the rest', async () => {
    const { store, storage } = freshStore(SEED);
    await store.loadMoodEntries();

    await store.deleteMoodEntry('older');

    expect(store.getMoodEntries().map((e) => e.id)).toEqual(['newer']);
    expect(lastWrite(storage).map((e) => e.id)).toEqual(['newer']);
  });
});

// Regression tests for a data-loss bug: mutations used to run against the
// still-empty `entries` array while the initial read was in flight, so one
// check-in saved during startup persisted itself over the entire history.
describe('mutations racing hydration', () => {
  it('keeps stored entries when an add is issued mid-load', async () => {
    const { store, storage } = freshStore(SEED);
    delayReads(storage);

    const load = store.loadMoodEntries();
    await store.addMoodEntry(5, 'during load');

    expect(store.getMoodEntries().map((e) => e.id)).toEqual([expect.any(String), 'newer', 'older']);
    expect(lastWrite(storage).map((e) => e.id)).toEqual([expect.any(String), 'newer', 'older']);
    await load;
  });

  it('edits the stored entry when an update is issued mid-load', async () => {
    const { store, storage } = freshStore(SEED);
    delayReads(storage);

    const load = store.loadMoodEntries();
    await store.updateMoodEntry('older', 9, 'reconsidered');

    const edited = store.getMoodEntries().find((e) => e.id === 'older') as MoodEntry;
    expect(edited.score).toBe(9);
    expect(edited.note).toBe('reconsidered');
    expect(edited.timestamp.toISOString()).toBe('2026-01-05T08:00:00.000Z');
    expect(lastWrite(storage)).toHaveLength(2);
    await load;
  });

  it('does not let the hydrated snapshot overwrite a mutation that already committed', async () => {
    const { store, storage } = freshStore(SEED);
    delayReads(storage);

    const load = store.loadMoodEntries();
    await store.deleteMoodEntry('newer');
    const afterMutation = store.getMoodEntries().map((e) => e.id);
    await load;

    expect(afterMutation).toEqual(['older']);
    expect(store.getMoodEntries().map((e) => e.id)).toEqual(afterMutation);
    expect(JSON.parse(mockStorage.value as string).map((e: StoredEntry) => e.id)).toEqual([
      'older',
    ]);
  });

  it('hydrates on its own when a mutation arrives before anything called load', async () => {
    const { store, storage } = freshStore(SEED);
    delayReads(storage);

    await store.addMoodEntry(7, 'first thing');

    expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(store.isMoodStoreLoaded()).toBe(true);
    expect(store.getMoodEntries()).toHaveLength(3);
    expect(lastWrite(storage).map((e) => e.id)).toContain('older');
  });

  it('still runs queued mutations when hydration fails to read storage', async () => {
    const { store, storage } = freshStore(SEED);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    storage.getItem.mockRejectedValue(new Error('bridge exploded'));

    // A failed read falls back to an empty store rather than rejecting, so the
    // write queue must not be left stuck behind it.
    await expect(store.addMoodEntry(6, 'after failure')).resolves.toBeUndefined();
    await expect(store.addMoodEntry(4, 'and another')).resolves.toBeUndefined();

    expect(store.getMoodEntries()).toHaveLength(2);
    consoleError.mockRestore();
  });
});

describe('subscribeToMoodStore', () => {
  it('notifies subscribers once a mutation has committed', async () => {
    const { store } = freshStore(SEED);
    await store.loadMoodEntries();
    const seenAtNotify: number[] = [];
    const unsubscribe = store.subscribeToMoodStore(() => {
      seenAtNotify.push(store.getMoodEntries().length);
    });

    await store.addMoodEntry(4, 'meh');

    expect(seenAtNotify).toEqual([3]);
    unsubscribe();
    await store.deleteMoodEntry('newer');
    expect(seenAtNotify).toEqual([3]);
  });
});
