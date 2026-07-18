import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { spacing } from '../theme';
import { darken } from '../theme/score';

interface ToastProps {
  /** null hides the toast — it slides down and unmounts itself once the exit animation finishes. */
  message: string | null;
  accentColor: string;
  /** Safe-area bottom inset, so text clears the home indicator without leaving a gap below the bar. */
  insetBottom: number;
}

const ANIM_DURATION_MS = 220;
// Comfortably taller than the bar ever gets (text + paddings + largest safe-area inset), so the
// slide fully clears the screen instead of being guessed from a measured, possibly-stale layout.
const SLIDE_DISTANCE = 100;

export function Toast({ message, accentColor, insetBottom }: ToastProps) {
  const visible = message !== null;
  const [rendered, setRendered] = useState(visible);
  const [displayMessage, setDisplayMessage] = useState(message);
  const [translateY] = useState(() => new Animated.Value(visible ? 0 : SLIDE_DISTANCE));

  // Sync displayMessage/rendered to a changed `message` prop during render
  // (React's recommended alternative to an Effect for this) so the text
  // updates immediately rather than one render behind.
  const [prevMessage, setPrevMessage] = useState(message);
  if (message !== prevMessage) {
    setPrevMessage(message);
    if (visible) {
      setDisplayMessage(message);
      setRendered(true);
    }
  }

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }).start();
    } else if (rendered) {
      Animated.timing(translateY, {
        toValue: SLIDE_DISTANCE,
        duration: ANIM_DURATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
    // rendered is read but intentionally excluded — re-running this effect when it flips to
    // false would restart the exit animation the change itself just finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, translateY]);

  if (!rendered) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: darken(accentColor, 0.4),
          paddingBottom: spacing.sm + insetBottom,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.text}>{displayMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    // left+right alone already span the box edge-to-edge unambiguously; adding
    // width: '100%' on top over-constrains it (left/right/width all set), so
    // the browser silently drops `right` and resolves the edge from a
    // percentage instead — which can round a fraction of a pixel off from the
    // true edge once the transform animation promotes this to its own
    // compositing layer, showing up as a flickering hairline gap.
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
