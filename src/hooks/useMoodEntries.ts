import { useEffect, useMemo, useState } from 'react';
import {
  getMoodEntries,
  isMoodStoreLoaded,
  loadMoodEntries,
  subscribeToMoodStore,
} from '../storage/moodStore';
import { groupEntriesByDay } from '../utils/date';

export function useMoodEntries() {
  const [entries, setEntries] = useState(getMoodEntries());
  const [loading, setLoading] = useState(!isMoodStoreLoaded());

  useEffect(() => {
    const unsubscribe = subscribeToMoodStore(() => {
      setEntries(getMoodEntries());
      setLoading(false);
    });
    loadMoodEntries();
    return unsubscribe;
  }, []);

  const days = useMemo(() => groupEntriesByDay(entries), [entries]);

  return { entries, days, loading };
}
