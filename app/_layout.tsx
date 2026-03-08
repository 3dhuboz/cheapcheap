import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/stores/authStore';
import { getProfile } from '../src/services/authService';
import { initRevenueCat, identifyUser, getCustomerInfo } from '../src/services/subscriptionService';
import { useSubscriptionStore } from '../src/stores/subscriptionStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 15, retry: 2 },
  },
});

export default function RootLayout() {
  const { setUser, setSession, setLoading } = useAuthStore();
  const { setCustomerInfo, setLoading: setSubLoading } = useSubscriptionStore();

  useEffect(() => {
    initRevenueCat(Platform.OS as 'ios' | 'android').catch(console.warn);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const profile = await getProfile();
          setUser(profile);
          identifyUser(profile.id).catch(console.warn);
          const info = await getCustomerInfo();
          setCustomerInfo(info);
        } catch {
          setUser(null);
        }
      }
      setSubLoading(false);
      setLoading(false);
      SplashScreen.hideAsync();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        try {
          const profile = await getProfile();
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
