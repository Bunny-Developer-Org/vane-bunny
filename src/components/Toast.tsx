import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { radii, spacing } from '../theme';

interface ToastProps {
  message: string;
  accentColor: string;
  bottom: number;
}

export function Toast({ message, accentColor, bottom }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

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
      style={[styles.toast, { borderColor: accentColor, bottom, opacity }]}
    >
      <Animated.View style={[styles.dot, { backgroundColor: accentColor }]} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
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
