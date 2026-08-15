import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import { useTheme, radii, spacing, type Palette } from '../theme';
import { scoreColor } from '../theme/score';
import { formatTime } from '../utils/date';
import type { MoodEntry } from '../types';

interface EntryListItemProps {
  entry: MoodEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EntryListItem({ entry, onEdit, onDelete }: EntryListItemProps) {
  const { palette } = useTheme();
  const { language, t } = useI18n();
  const styles = createStyles(palette);
  const time = formatTime(entry.timestamp, language);

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: scoreColor(entry.score, palette) }]}>
        <Text style={styles.badgeText}>{entry.score}</Text>
      </View>
      <View style={styles.body}>
        {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
        <Text style={styles.time}>
          {time}
          {entry.updatedAt ? ` · ${t('dayDetail.edited')}` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={t('dayDetail.editEntryLabel', { score: entry.score, time })}
          >
            <Text style={styles.edit}>{t('common.edit')}</Text>
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={t('dayDetail.deleteEntryLabel', { score: entry.score, time })}
          >
            <Text style={styles.delete}>{t('common.delete')}</Text>
          </Pressable>
        ) : null}
      </View>
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
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    // The labels are 12px text, so the tappable box has to come from padding
    // rather than `hitSlop` — hitSlop is a no-op in react-native-web, and one
    // of these two buttons is destructive. The gap then stays a real dead
    // zone between them instead of two hit rectangles meeting in the middle.
    actionButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    edit: {
      fontSize: 12,
      color: colors.sageDark,
      fontWeight: '600',
    },
    delete: {
      fontSize: 12,
      color: colors.danger,
      fontWeight: '600',
    },
  });
}
