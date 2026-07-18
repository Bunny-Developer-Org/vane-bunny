import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { MoodEntry } from '../types';

function entriesRef(uid: string) {
  return collection(db, 'users', uid, 'moodEntries');
}

export function subscribeToMoodEntries(
  uid: string,
  onChange: (entries: MoodEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const entriesQuery = query(entriesRef(uid), orderBy('timestamp', 'desc'));
  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnap): MoodEntry => {
        const data = docSnap.data();
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
        return {
          id: docSnap.id,
          score: data.score,
          note: typeof data.note === 'string' ? data.note : undefined,
          timestamp,
        };
      });
      onChange(entries);
    },
    onError
  );
}

export async function addMoodEntry(uid: string, score: number, note: string): Promise<void> {
  const payload: Record<string, unknown> = {
    score,
    timestamp: serverTimestamp(),
  };
  const trimmedNote = note.trim();
  if (trimmedNote) {
    payload.note = trimmedNote;
  }
  await addDoc(entriesRef(uid), payload);
}

export async function deleteMoodEntry(uid: string, entryId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'moodEntries', entryId));
}
