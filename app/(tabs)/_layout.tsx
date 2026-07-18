import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { colors } from '../../src/theme/colors';

function TabDot({ focused }: { focused: boolean }) {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: focused ? colors.sageDark : colors.inkFaint,
      }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.sageDark,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused }) => <TabDot focused={focused} />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Check in' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}
