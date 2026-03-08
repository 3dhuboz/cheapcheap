import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../theme';
import { buildWeeklyShop } from '../../services/optimizeService';
import { useSettingsStore } from '../../stores/settingsStore';

export function WeeklyShopButton() {
  const [loading, setLoading] = useState(false);
  const { searchRadiusKm, distanceWeight } = useSettingsStore();

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const result = await buildWeeklyShop({
        radius_km: searchRadiusKm,
        distance_weight: distanceWeight,
        include_delivery: false,
      });
      router.push(`/(app)/optimize/${result.id}`);
    } catch (err) {
      console.warn('Weekly shop failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.88} disabled={loading}>
      <View style={styles.inner}>
        <Text style={styles.chick}>{loading ? '⏳' : '🐥'}</Text>
        <View style={styles.text}>
          <Text style={styles.title}>Weekly Cheapest Shop</Text>
          <Text style={styles.subtitle}>Tap to build your lowest-cost basket</Text>
        </View>
        {loading
          ? <ActivityIndicator color={Colors.textInverse} />
          : <Text style={styles.arrow}>→</Text>
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
    marginBottom: Spacing.base,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  chick: { fontSize: 36 },
  text: { flex: 1 },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  arrow: {
    fontSize: FontSize.xl,
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
});
