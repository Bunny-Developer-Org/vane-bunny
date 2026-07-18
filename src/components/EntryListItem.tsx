import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, radii, spacing, type Palette } from '../theme';
import { scoreColor } from '../theme/score';
import { formatTime } from '../utils/date';
import type { MoodEntry } from '../types';

interface EntryListItemProps {
  entry: MoodEntry;
  onDelete?: () => void;
}

export function EntryListItem({ entry, onDelete }: EntryListItemProps) {
  const { palette } = useTheme();
  const styles = createStyles(palette);

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: scoreColor(entry.score, palette) }]}>
        <Text style={styles.badgeText}>{entry.score}</Text>
      </View>
      <View style={styles.body}>
        {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
        <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
      </View>
      {onDelete ? (
        <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="Delete entry">
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    badge: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
    body: {
      flex: 1,
    },
    note: {
      fontSize: 15,
      color: colors.ink,
      marginBottom: 2,
    },
    time: {
      fontSize: 12,
      color: colors.inkMuted,
    },
    delete: {
      fontSize: 12,
      color: colors.danger,
      fontWeight: '600',
    },
  });
}
