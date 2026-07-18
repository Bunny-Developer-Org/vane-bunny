import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, radii, spacing, type Palette } from '../theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'ghost';
  /** Overrides the solid variant's fill color — lets each screen use its own tab accent. */
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  accentColor,
  style,
}: PrimaryButtonProps) {
  const { palette } = useTheme();
  const styles = createStyles(palette);
  const isGhost = variant === 'ghost';
  const fill = accentColor ?? palette.sage;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isGhost ? styles.ghost : { backgroundColor: fill },
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? palette.sageDark : palette.white} />
      ) : (
        <Text style={[styles.label, isGhost ? styles.ghostLabel : styles.solidLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    base: {
      borderRadius: radii.pill,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.85,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
    },
    solidLabel: {
      color: colors.white,
    },
    ghostLabel: {
      color: colors.ink,
    },
  });
}
