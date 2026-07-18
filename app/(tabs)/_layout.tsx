import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

// Bigger than the library's own default UIKit content height (49) to leave
// room for our bold 12px label's extra line-height; anything added on top of
// this must go equally into height and paddingBottom or the label gets
// squeezed out of the remaining space.
const TAB_BAR_CONTENT_HEIGHT = 58;
const TAB_BAR_BUFFER = 8;

function TabDot({ focused, color, inactiveColor }: { focused: boolean; color: string; inactiveColor: string }) {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: focused ? color : inactiveColor,
      }}
    />
  );
}

export default function TabsLayout() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: palette.inkFaint,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom + TAB_BAR_BUFFER,
          paddingBottom: insets.bottom + TAB_BAR_BUFFER,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Check in',
          tabBarActiveTintColor: palette.accents.checkIn,
          tabBarIcon: ({ focused }) => (
            <TabDot focused={focused} color={palette.accents.checkIn} inactiveColor={palette.inkFaint} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarActiveTintColor: palette.accents.history,
          tabBarIcon: ({ focused }) => (
            <TabDot focused={focused} color={palette.accents.history} inactiveColor={palette.inkFaint} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarActiveTintColor: palette.accents.settings,
          tabBarIcon: ({ focused }) => (
            <TabDot focused={focused} color={palette.accents.settings} inactiveColor={palette.inkFaint} />
          ),
        }}
      />
    </Tabs>
  );
}
