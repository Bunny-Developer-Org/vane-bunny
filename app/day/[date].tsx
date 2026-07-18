import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { EntryListItem } from '../../src/components/EntryListItem';
import { useMoodEntries } from '../../src/hooks/useMoodEntries';
import { pluralEntryKey, useI18n } from '../../src/i18n';
import { deleteMoodEntry } from '../../src/storage/moodStore';
import { useTheme, spacing, type Palette } from '../../src/theme';
import { formatDayLabel } from '../../src/utils/date';

export default function DayDetail() {
  const { date: rawDate } = useLocalSearchParams<{ date: string }>();
  // useLocalSearchParams's generic is a compile-time assertion only — a
  // duplicate query param would actually make this a string[] at runtime.
  const date = Array.isArray(rawDate) ? rawDate[0] : rawDate;
  const insets = useSafeAreaInsets();
  const { days, loading } = useMoodEntries();
  const { palette } = useTheme();
  const { language, t } = useI18n();
  const styles = createStyles(palette);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const day = days.find((d) => d.dateKey === date);

  function runDelete() {
    if (!pendingDeleteId) return;
    deleteMoodEntry(pendingDeleteId).catch((err) => console.error('Failed to delete entry', err));
    setPendingDeleteId(null);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accents.history} />
        </View>
      ) : !day ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('dayDetail.noEntries')}</Text>
        </View>
      ) : (
        <FlatList
          data={day.entries}
          keyExtractor={(entry) => entry.id}
          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={styles.title}>{formatDayLabel(day.dateKey, language)}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{day.average}</Text>
                  <Text style={styles.statLabel}>{t('common.average')}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{day.median}</Text>
                  <Text style={styles.statLabel}>{t('common.median')}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{day.count}</Text>
                  <Text style={styles.statLabel}>{t(pluralEntryKey(day.count, language))}</Text>
                </View>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <EntryListItem entry={item} onDelete={() => setPendingDeleteId(item.id)} />
          )}
        />
      )}

      <ConfirmDialog
        visible={pendingDeleteId !== null}
        title={t('dayDetail.deleteTitle')}
        message={t('dayDetail.deleteMessage')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={runDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </View>
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
    listContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    summary: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.ink,
      marginBottom: spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.xl,
    },
    statBlock: {
      alignItems: 'flex-start',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.ink,
    },
    statLabel: {
      fontSize: 12,
      color: colors.inkMuted,
      marginTop: 2,
    },
  });
}
