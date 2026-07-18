import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '../../src/components/Logo';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/context/AuthContext';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme';

export default function Welcome() {
  const { user, initializing } = useAuth();
  const { signIn, isReady, signingIn, error } = useGoogleSignIn();

  useEffect(() => {
    if (error) console.warn(error);
  }, [error]);

  if (!initializing && user) {
    return <Redirect href="/log" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Logo size={26} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.tagline}>A quiet place to notice how you're doing.</Text>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label="Continue with Google"
          onPress={signIn}
          disabled={!isReady}
          loading={signingIn}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'flex-start',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    color: colors.ink,
    maxWidth: 320,
  },
  bottom: {
    gap: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
});
