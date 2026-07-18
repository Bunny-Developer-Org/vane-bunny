import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToMoodEntries } from '../firebase/moodEntries';
import { groupEntriesByDay } from '../utils/date';
import type { MoodEntry } from '../types';

export function useMoodEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMoodEntries(
      user.uid,
      (nextEntries) => {
        setEntries(nextEntries);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const days = useMemo(() => groupEntriesByDay(entries), [entries]);

  return { entries, days, loading, error };
}
