import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { Colors, FontSize } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused, label }: { name: IconName; focused: boolean; label: string }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons name={name} size={24} color={focused ? Colors.tabBarActive : Colors.tabBarInactive} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'list' : 'list-outline'} focused={focused} label="Lists" />,
        }}
      />
      <Tabs.Screen
        name="optimize"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'cart' : 'cart-outline'} focused={focused} label="Optimize" />,
        }}
      />
      <Tabs.Screen
        name="fuel"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'flame' : 'flame-outline'} focused={focused} label="Fuel" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Account" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: FontSize.xs, color: Colors.tabBarInactive },
  tabLabelActive: { color: Colors.tabBarActive },
});
