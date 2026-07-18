import { StyleSheet, Text, View } from 'react-native';
import { radii, spacing } from '../theme';

interface BannerProps {
  message: string;
  accentColor: string;
}

export function Banner({ message, accentColor }: BannerProps) {
  return (
    <View style={[styles.banner, { borderColor: accentColor }]}>
      <View style={[styles.dot, { backgroundColor: accentColor }]} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
