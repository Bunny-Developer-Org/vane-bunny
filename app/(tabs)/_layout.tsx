import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '../../src/theme';

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: palette.inkFaint,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          // The default tab bar height budgets for the default 10px label
          // font; our bumped-up 12px bold label needs a bit more room or
          // its own fixed-height inner slot clips the text's descenders.
          height: 64,
          paddingTop: 6,
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
