import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme';
import { scoreColor } from '../theme/score';

const SCORES = Array.from({ length: 10 }, (_, i) => i + 1);

interface MoodPickerProps {
  value: number | null;
  onChange: (score: number) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View>
      <View style={styles.display}>
        <Text style={[styles.displayValue, { color: value ? scoreColor(value) : colors.inkFaint }]}>
          {value ?? '–'}
        </Text>
        <Text style={styles.displayLabel}>out of 10</Text>
      </View>
      <View style={styles.grid}>
        {SCORES.map((score) => {
          const selected = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(score)}
              accessibilityRole="button"
              accessibilityLabel={`Mood ${score} of 10`}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: selected ? scoreColor(score) : colors.surfaceMuted,
                  borderColor: selected ? scoreColor(score) : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.pillLabel, { color: selected ? colors.white : colors.inkMuted }]}>
                {score}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  display: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  displayValue: {
    fontSize: 64,
    fontWeight: '600',
    letterSpacing: -1,
  },
  displayLabel: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: -spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pill: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  pillLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
});
