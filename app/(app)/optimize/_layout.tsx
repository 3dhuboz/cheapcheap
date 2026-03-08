import { Stack } from 'expo-router';

export default function OptimizeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[resultId]" options={{ presentation: 'card' }} />
    </Stack>
  );
}
