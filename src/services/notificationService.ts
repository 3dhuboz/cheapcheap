import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function savePushToken(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({ push_token: token }).eq('id', user.id);
}

export async function schedulePriceAlertNotification(
  productName: string,
  storeName: string,
  newPrice: number,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📉 Price Drop Alert!',
      body: `${productName} is now $${newPrice.toFixed(2)} at ${storeName}`,
      data: { type: 'price_alert' },
    },
    trigger: null,
  });
}

export async function scheduleFuelAlertNotification(
  stationName: string,
  price: number,
  fuelType: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⛽ Good Time to Fill Up!',
      body: `${fuelType.toUpperCase()} at ${stationName} is ${price.toFixed(1)}¢/L`,
      data: { type: 'fuel_alert' },
    },
    trigger: null,
  });
}
