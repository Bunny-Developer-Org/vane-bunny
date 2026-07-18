import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme, radii, spacing, type Palette } from '../theme';
import { scoreColor } from '../theme/score';

const SCORES = Array.from({ length: 10 }, (_, i) => i + 1);

interface MoodPickerProps {
  value: number | null;
  onChange: (score: number) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const { palette } = useTheme();
  const styles = createStyles(palette);

  return (
    <View>
      <View style={styles.display}>
        <Text
          style={[
            styles.displayValue,
            { color: value ? scoreColor(value, palette) : palette.inkFaint },
          ]}
        >
          {value ?? '–'}
        </Text>
        <Text style={styles.displayLabel}>out of 10</Text>
      </View>
      <View style={styles.grid}>
        {SCORES.map((score) => {
          const selected = value === score;
          const pillColor = scoreColor(score, palette);
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
                  backgroundColor: selected ? pillColor : palette.surfaceMuted,
                  borderColor: selected ? pillColor : palette.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.pillLabel, { color: selected ? palette.white : palette.inkMuted }]}
              >
                {score}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
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
}
