import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { spacing } from '../theme';
import { darken } from '../theme/score';

interface ToastProps {
  message: string;
  accentColor: string;
  /** Safe-area bottom inset, so text clears the home indicator without leaving a gap below the bar. */
  insetBottom: number;
}

export function Toast({ message, accentColor, insetBottom }: ToastProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: darken(accentColor, 0.4),
          paddingBottom: spacing.sm + insetBottom,
          opacity,
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
