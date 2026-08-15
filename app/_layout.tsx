import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '../src/i18n';
import { ThemeProvider, useTheme } from '../src/theme';

// Mount the tab navigator underneath any route opened directly — a
// `vanebunny://` link, a reloaded web URL — instead of starting the stack on
// that screen alone. Without it a deep-linked detail screen has nothing to go
// back to, so its Back control silently does nothing.
export const unstable_settings = {
  anchor: '(tabs)',
};

function RootStack() {
  const { palette } = useTheme();
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <RootStack />
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
