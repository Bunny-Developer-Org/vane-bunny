import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../../src/components/Logo';
import { MoodPicker } from '../../src/components/MoodPicker';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Toast } from '../../src/components/Toast';
import { useMoodEntries } from '../../src/hooks/useMoodEntries';
import { addMoodEntry } from '../../src/storage/moodStore';
import { useTheme, radii, spacing, type Palette } from '../../src/theme';
import { formatHeaderDate, toDateKey } from '../../src/utils/date';
import { getThankYouMessage } from '../../src/utils/encouragement';

const TOAST_DURATION_MS = 3500;

export default function Log() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const styles = createStyles(palette);
  const { days } = useMoodEntries();
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [thankYou, setThankYou] = useState<string | null>(null);
  const savingRef = useRef(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = days.find((day) => day.dateKey === toDateKey(new Date()));

  async function handleSave() {
    // Synchronous guard: `saving` only disables the button after a
    // re-render, which isn't fast enough to rule out a rapid double-tap.
    if (score === null || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await addMoodEntry(score, note);
      setThankYou(getThankYouMessage(score));
      setScore(null);
      setNote('');
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setThankYou(null), TOAST_DURATION_MS);
    } catch (err) {
      console.error('Failed to save entry', err);
    } finally {
      savingRef.current = false;
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
          <Text style={styles.date}>{formatHeaderDate(new Date())}</Text>
        </View>

        <Text style={styles.prompt}>How are you, right now?</Text>

        {today ? (
          <View style={styles.todayStats}>
            <View style={styles.todayStatBlock}>
              <Text style={styles.todayStatValue}>{today.average}</Text>
              <Text style={styles.todayStatLabel}>avg today</Text>
            </View>
            <View style={styles.todayStatBlock}>
              <Text style={styles.todayStatValue}>{today.median}</Text>
              <Text style={styles.todayStatLabel}>median</Text>
            </View>
            <View style={styles.todayStatBlock}>
              <Text style={styles.todayStatValue}>{today.count}</Text>
              <Text style={styles.todayStatLabel}>
                {today.count === 1 ? 'check-in' : 'check-ins'}
              </Text>
            </View>
          </View>
        ) : null}

        <MoodPicker value={score} onChange={setScore} />

        <TextInput
          style={styles.note}
          placeholder="Add a short note (optional)"
          placeholderTextColor={palette.inkFaint}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={200}
        />

        <PrimaryButton
          label="Save check-in"
          onPress={handleSave}
          disabled={score === null}
          loading={saving}
          accentColor={palette.accents.checkIn}
        />
      </ScrollView>

      {thankYou ? (
        <Toast
          message={thankYou}
          accentColor={palette.accents.checkIn}
          bottom={insets.bottom + spacing.lg}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
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
    date: {
      fontSize: 13,
      color: colors.inkMuted,
    },
    prompt: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.ink,
      marginBottom: spacing.lg,
    },
    todayStats: {
      flexDirection: 'row',
      gap: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
      alignSelf: 'center',
    },
    todayStatBlock: {
      alignItems: 'flex-start',
    },
    todayStatValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.ink,
    },
    todayStatLabel: {
      fontSize: 11,
      color: colors.inkMuted,
      marginTop: 1,
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
}
