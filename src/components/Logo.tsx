import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type Palette } from '../theme';

// Abstract wordmark — deliberately no mood/emotion iconography (no faces, no bunny glyph).
export function Logo({ size = 22 }: { size?: number }) {
  const { palette } = useTheme();
  const styles = createStyles(palette);
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: size * 0.4, height: size * 0.4, borderRadius: size }]} />
      <Text style={[styles.text, { fontSize: size }]}>vane bunny</Text>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mark: {
      backgroundColor: colors.clay,
    },
    text: {
      color: colors.ink,
      fontWeight: '600',
      letterSpacing: -0.3,
    },
  });
}
