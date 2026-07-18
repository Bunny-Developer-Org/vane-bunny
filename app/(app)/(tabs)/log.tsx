import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../../../src/components/Logo';
import { MoodPicker } from '../../../src/components/MoodPicker';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { useAuth } from '../../../src/context/AuthContext';
import { addMoodEntry } from '../../../src/firebase/moodEntries';
import { colors } from '../../../src/theme/colors';
import { radii, spacing } from '../../../src/theme';

export default function Log() {
  const { user, signOutUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    if (!user || score === null) return;
    setSaving(true);
    try {
      await addMoodEntry(user.uid, score, note);
      setScore(null);
      setNote('');
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 2500);
    } catch (err) {
      console.error('Failed to save entry', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={18} />
          <Pressable onPress={signOutUser} hitSlop={8}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.prompt}>How are you, right now?</Text>

        <MoodPicker value={score} onChange={setScore} />

        <TextInput
          style={styles.note}
          placeholder="Add a short note (optional)"
          placeholderTextColor={colors.inkFaint}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={200}
        />

        <PrimaryButton
          label={savedAt ? 'Saved' : 'Save check-in'}
          onPress={handleSave}
          disabled={score === null}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  signOut: {
    fontSize: 13,
    color: colors.inkMuted,
  },
  prompt: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  note: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 64,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: 'top',
    marginBottom: spacing.xl,
  },
});
