import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryListItem } from '../../src/components/EntryListItem';
import { useMoodEntries } from '../../src/hooks/useMoodEntries';
import { deleteMoodEntry } from '../../src/storage/moodStore';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme';
import { formatDayLabel } from '../../src/utils/date';

export default function DayDetail() {
  const { date: rawDate } = useLocalSearchParams<{ date: string }>();
  // useLocalSearchParams's generic is a compile-time assertion only — a
  // duplicate query param would actually make this a string[] at runtime.
  const date = Array.isArray(rawDate) ? rawDate[0] : rawDate;
  const insets = useSafeAreaInsets();
  const { days, loading } = useMoodEntries();

  const day = days.find((d) => d.dateKey === date);

  function confirmDelete(entryId: string) {
    const runDelete = () => {
      deleteMoodEntry(entryId).catch((err) => console.error('Failed to delete entry', err));
    };

    // react-native-web's Alert.alert() is a no-op — RN's Alert only has a
    // real implementation on native, so web needs its own confirm path.
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this entry? This can’t be undone.')) {
        runDelete();
      }
      return;
    }

    Alert.alert('Delete this entry?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.sage} />
        </View>
      ) : !day ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No entries for this day.</Text>
        </View>
      ) : (
        <FlatList
          data={day.entries}
          keyExtractor={(entry) => entry.id}
          ListHeaderComponent={
            <View style={styles.summary}>
              <Text style={styles.title}>{formatDayLabel(day.dateKey)}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{day.average}</Text>
                  <Text style={styles.statLabel}>average</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{day.median}</Text>
                  <Text style={styles.statLabel}>median</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{day.count}</Text>
                  <Text style={styles.statLabel}>{day.count === 1 ? 'entry' : 'entries'}</Text>
                </View>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <EntryListItem entry={item} onDelete={() => confirmDelete(item.id)} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
