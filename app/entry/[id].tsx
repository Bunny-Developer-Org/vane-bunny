import { useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
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
import { MoodPicker } from '../../src/components/MoodPicker';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useMoodEntries } from '../../src/hooks/useMoodEntries';
import { useI18n } from '../../src/i18n';
import { updateMoodEntry } from '../../src/storage/moodStore';
import { useTheme, radii, spacing, type Palette } from '../../src/theme';
import { formatDayLabel, formatTime, toDateKey } from '../../src/utils/date';

interface Draft {
  entryId: string;
  score: number;
  note: string;
}

export default function EditEntry() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  // Same caveat as the day route: the generic is a compile-time assertion, so
  // a duplicated query param would really arrive as string[].
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const insets = useSafeAreaInsets();
  const { entries, loading } = useMoodEntries();
  const { palette } = useTheme();
  const { language, t } = useI18n();
  const styles = createStyles(palette);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const savingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set on the way in as well as cleared on the way out: an effect can run
    // more than once for a single mount (Fast Refresh today, StrictMode's
    // double-invoke if it's ever switched on), and without this the cleanup
    // from the first run would leave the ref false forever — every later save
    // would then return before `dismiss()`, leaving the entry saved but the
    // button spinning on a screen that never goes away.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const entry = entries.find((candidate) => candidate.id === id);

  // Seed the form from the entry during render rather than in an Effect (the
  // same pattern Toast uses): the store loads asynchronously, so the entry
  // usually isn't there on the first render, and an Effect would paint one
  // frame of an empty form first. Keyed on the id so a later store update —
  // including this screen's own save — doesn't overwrite what's been typed.
  if (entry && draft?.entryId !== entry.id) {
    setDraft({ entryId: entry.id, score: entry.score, note: entry.note ?? '' });
  }

  const dirty =
    entry !== undefined &&
    draft !== null &&
    // Both sides trimmed: the store trims on the way in, so a stored note
    // should already match — but an untrimmed legacy one would otherwise open
    // the form pre-dirty and let an untouched visit stamp `updatedAt`.
    (draft.score !== entry.score || draft.note.trim() !== (entry.note ?? '').trim());

  // `router.back()` does nothing when this route was opened directly rather
  // than pushed — a pasted web URL or a `vanebunny://` link — which would
  // strand the user here, and after a save would leave the button spinning
  // on a screen that never goes away. Fall back to the day the entry belongs
  // to, which is where the push would have come from.
  function dismiss() {
    if (router.canGoBack()) {
      router.back();
    } else if (entry) {
      router.replace({ pathname: '/day/[date]', params: { date: toDateKey(entry.timestamp) } });
    } else {
      router.replace('/history');
    }
  }

  function editDraft(change: Partial<Omit<Draft, 'entryId'>>) {
    // Any edit clears a previous failure notice — leaving it up while the
    // user reworks the check-in would keep blaming a save they've moved on
    // from.
    setFailed(false);
    setDraft((current) => (current ? { ...current, ...change } : current));
  }

  async function handleSave() {
    // Synchronous guard against a double-tap landing before `saving` disables
    // the button, matching the check-in screen.
    if (!draft || !dirty || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setFailed(false);
    try {
      await updateMoodEntry(draft.entryId, draft.score, draft.note);
      // If the user already navigated away while the write was in flight,
      // dismissing now would pop the day screen out from under them too.
      if (!mountedRef.current) return;
      // Deliberately leaves `saving` set: the screen is on its way out, and
      // clearing it would flash the button back to its idle state first.
      dismiss();
    } catch (err) {
      console.error('Failed to update entry', err);
      setFailed(true);
      savingRef.current = false;
      setSaving(false);
    }
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={dismiss} hitSlop={12}>
        <Text style={styles.back}>{t('common.back')}</Text>
      </Pressable>
    </View>
  );

  if (loading || !entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        {header}
        <View style={styles.center}>
          {loading ? (
            <ActivityIndicator color={palette.accents.history} />
          ) : (
            <Text style={styles.emptyText}>{t('editEntry.notFound')}</Text>
          )}
        </View>
      </View>
    );
  }

  // Keyboard handling mirrors the check-in screen: the save button sits
  // outside the ScrollView so it stays reachable while the note is focused.
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top + spacing.md }}>{header}</View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('editEntry.title')}</Text>
        {/* The original date and time, so it reads as amending that check-in
            rather than logging a new one now. */}
        <Text style={styles.subtitle}>
          {formatDayLabel(toDateKey(entry.timestamp), language)} ·{' '}
          {formatTime(entry.timestamp, language)}
        </Text>

        <MoodPicker
          value={draft?.score ?? entry.score}
          onChange={(score) => editDraft({ score })}
        />

        <TextInput
          style={styles.note}
          placeholder={t('checkIn.notePlaceholder')}
          placeholderTextColor={palette.inkFaint}
          value={draft?.note ?? ''}
          onChangeText={(note) => editDraft({ note })}
          multiline
          maxLength={200}
        />
      </ScrollView>

      {/* Unlike the check-in screen, nothing sits below this footer to absorb
          the safe-area inset — under Android's edge-to-edge window the button
          would otherwise run underneath the navigation bar. */}
      <View style={[styles.footer, { paddingBottom: spacing.lg + insets.bottom }]}>
        {failed ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {t('editEntry.saveError')}
          </Text>
        ) : null}
        <PrimaryButton
          label={t('editEntry.save')}
          onPress={handleSave}
          disabled={!dirty}
          loading={saving}
          accentColor={palette.accents.history}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.sm,
    },
    back: {
      fontSize: 15,
      color: colors.sageDark,
      fontWeight: '600',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: colors.inkMuted,
      fontSize: 15,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.ink,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.inkMuted,
      textAlign: 'center',
      marginBottom: spacing.lg,
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
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      // paddingBottom is applied inline — it has to carry the safe-area inset.
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
  });
}
