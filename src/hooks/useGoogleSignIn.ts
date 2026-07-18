import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      setSigningIn(true);
      const credential = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, credential)
        .catch((err: Error) => setError(err.message))
        .finally(() => setSigningIn(false));
    } else if (response?.type === 'error') {
      setError(response.error?.message ?? 'Google sign-in failed.');
    }
  }, [response]);

  async function signIn(): Promise<void> {
    setError(null);
    try {
      if (Platform.OS === 'web') {
        setSigningIn(true);
        await signInWithPopup(auth, new GoogleAuthProvider());
        return;
      }
      await promptAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      if (Platform.OS === 'web') setSigningIn(false);
    }
  }

  const isReady = Platform.OS === 'web' || !!request;

  return { signIn, isReady, signingIn, error };
}
