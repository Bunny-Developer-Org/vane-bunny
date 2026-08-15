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
import { pluralCheckInKey, useI18n } from '../../src/i18n';
import { addMoodEntry } from '../../src/storage/moodStore';
import { useTheme, radii, spacing, type Palette } from '../../src/theme';
import { formatHeaderDate, toDateKey } from '../../src/utils/date';
import { getThankYouMessage } from '../../src/utils/encouragement';

const TOAST_DURATION_MS = 3500;

export default function Log() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { language, t } = useI18n();
  const styles = createStyles(palette);
  const { days } = useMoodEntries();
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; failed: boolean } | null>(null);
  const savingRef = useRef(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = days.find((day) => day.dateKey === toDateKey(new Date()));

  function showToast(message: string, failed = false) {
    setToast({ message, failed });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }

  async function handleSave() {
    // Synchronous guard: `saving` only disables the button after a
    // re-render, which isn't fast enough to rule out a rapid double-tap.
    if (score === null || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await addMoodEntry(score, note);
      showToast(getThankYouMessage(score, language));
      setScore(null);
      setNote('');
    } catch (err) {
      // A save can genuinely fail — the store refuses to write when it
      // couldn't read what's already stored — and silently clearing the
      // spinner would look like it worked, so say so and keep what was
      // typed.
      console.error('Failed to save entry', err);
      showToast(t('checkIn.saveError'), true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  // The save button lives outside the ScrollView (see styles.footer) so it stays
  // pinned to the bottom of this view instead of scrolling out of reach behind
  // the keyboard.
  //
  // Android keeps behavior="height" (see the edge-to-edge note in git history):
  // mandatory edge-to-edge means the window no longer auto-resizes for the
  // keyboard, so without it the footer would just sit underneath. "height"
  // shrinks this view to the space above the keyboard, taking the footer with
  // it — and it stays correct even where the window does resize, since RN then
  // measures the keyboard overlap as zero and shrinks by nothing.
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.md }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={18} />
          <Text style={styles.date}>{formatHeaderDate(new Date(), language)}</Text>
        </View>

        <Text style={styles.prompt}>{t('checkIn.prompt')}</Text>

        {today ? (
          <View style={styles.todayStats}>
            <View style={styles.todayStatBlock}>
              <Text style={styles.todayStatValue}>{today.average}</Text>
              <Text style={styles.todayStatLabel}>{t('checkIn.avgToday')}</Text>
            </View>
            <View style={styles.todayStatBlock}>
              <Text style={styles.todayStatValue}>{today.median}</Text>
              <Text style={styles.todayStatLabel}>{t('common.median')}</Text>
            </View>
            <View style={styles.todayStatBlock}>
              <Text style={styles.todayStatValue}>{today.count}</Text>
              <Text style={styles.todayStatLabel}>
                {t(pluralCheckInKey(today.count, language))}
              </Text>
            </View>
          </View>
        ) : null}

        <MoodPicker value={score} onChange={setScore} />

        <TextInput
          style={styles.note}
          placeholder={t('checkIn.notePlaceholder')}
          placeholderTextColor={palette.inkFaint}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={200}
        />
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('checkIn.save')}
          onPress={handleSave}
          disabled={score === null}
          loading={saving}
          accentColor={palette.accents.checkIn}
        />
      </View>

      <Toast
        message={toast?.message ?? null}
        accentColor={toast?.failed ? palette.danger : palette.accents.checkIn}
        insetBottom={insets.bottom}
      />
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
      paddingBottom: spacing.lg,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      // Opaque, with a hairline rule: the scroll content passes underneath this
      // bar, so it needs to read as a surface rather than let text bleed through.
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      textAlign: 'center',
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
    },
  });
}
