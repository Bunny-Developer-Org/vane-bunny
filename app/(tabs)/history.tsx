import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DaySummaryCard } from '../../src/components/DaySummaryCard';
import { useMoodEntries } from '../../src/hooks/useMoodEntries';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme';
import type { DaySummary } from '../../src/types';

export default function History() {
  const insets = useSafeAreaInsets();
  const { days, loading } = useMoodEntries();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.sage} />
      </View>
    );
  }

  return (
    <FlatList
      data={days}
      keyExtractor={(day) => day.dateKey}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + spacing.md },
        days.length === 0 && styles.emptyContainer,
      ]}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      ListHeaderComponent={days.length > 0 ? <Text style={styles.title}>History</Text> : null}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>Your daily check-ins will show up here.</Text>
        </View>
      }
      renderItem={({ item }: { item: DaySummary }) => (
        <DaySummaryCard
          day={item}
          onPress={() => router.push({ pathname: '/day/[date]', params: { date: item.dateKey } })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.inkMuted,
  },
});
