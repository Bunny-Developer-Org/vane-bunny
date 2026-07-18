import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, radii, spacing, type Palette } from '../theme';
import { scoreColor } from '../theme/score';
import { formatDayLabel } from '../utils/date';
import type { DaySummary } from '../types';

interface DaySummaryCardProps {
  day: DaySummary;
  onPress: () => void;
}

export function DaySummaryCard({ day, onPress }: DaySummaryCardProps) {
  const { palette } = useTheme();
  const styles = createStyles(palette);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.dot, { backgroundColor: scoreColor(day.average, palette) }]} />
      <View style={styles.info}>
        <Text style={styles.dayLabel}>{formatDayLabel(day.dateKey)}</Text>
        <Text style={styles.entryCount}>
          {day.count} {day.count === 1 ? 'entry' : 'entries'}
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{day.average}</Text>
          <Text style={styles.statLabel}>avg</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{day.median}</Text>
          <Text style={styles.statLabel}>median</Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: {
      opacity: 0.85,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.md,
    },
    info: {
      flex: 1,
    },
    dayLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.ink,
    },
    entryCount: {
      fontSize: 13,
      color: colors.inkMuted,
      marginTop: 2,
    },
    stats: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    statBlock: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.ink,
    },
    statLabel: {
      fontSize: 11,
      color: colors.inkMuted,
      marginTop: 1,
    },
  });
}
