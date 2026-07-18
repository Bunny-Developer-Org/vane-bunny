import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EntryListItem } from '../../../src/components/EntryListItem';
import { useMoodEntries } from '../../../src/hooks/useMoodEntries';
import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme';
import { formatDayLabel } from '../../../src/utils/date';

export default function DayDetail() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const insets = useSafeAreaInsets();
  const { days, loading } = useMoodEntries();

  const day = days.find((d) => d.dateKey === date);

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
          renderItem={({ item }) => <EntryListItem entry={item} />}
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
