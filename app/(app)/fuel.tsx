import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/theme';
import { FuelTypeSelector } from '../../src/components/fuel/FuelTypeSelector';
import { StationRow } from '../../src/components/fuel/StationRow';
import { EmptyState } from '../../src/components/common/EmptyState';
import { SkeletonListItem } from '../../src/components/common/SkeletonLoader';
import { getNearbyFuel } from '../../src/services/fuelService';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { FuelStation, FuelType } from '../../src/types';

export default function FuelScreen() {
  const { defaultFuelType, searchRadiusKm } = useSettingsStore();
  const [fuelType, setFuelType] = useState<FuelType>(defaultFuelType);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [cheapest, setCheapest] = useState<FuelStation | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    loadStations();
  }, [fuelType]);

  const loadStations = async () => {
    setLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Enable it in Settings to find nearby fuel.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const data = await getNearbyFuel(loc.coords.latitude, loc.coords.longitude, searchRadiusKm, fuelType);
      setCheapest(data.cheapest);
      setStations(data.stations);
    } catch (err: any) {
      setLocationError(err.message ?? 'Could not load fuel prices.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationPress = (station: FuelStation) => {
    const url = `https://maps.google.com/?q=${station.lat},${station.lng}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>⛽ Fuel Finder</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadStations}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FuelTypeSelector selected={fuelType} onChange={setFuelType} />

      {locationError ? (
        <EmptyState
          emoji="📍"
          title="Location needed"
          subtitle={locationError}
          actionLabel="Try Again"
          onAction={loadStations}
        />
      ) : loading ? (
        <View style={{ padding: Spacing.base }}>
          {[1, 2, 3, 4].map((i) => <SkeletonListItem key={i} />)}
        </View>
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <StationRow
              station={item}
              fuelType={fuelType}
              isCheapest={item.id === cheapest?.id}
              onPress={() => handleStationPress(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              emoji="⛽"
              title="No stations found"
              subtitle={`No fuel stations with ${fuelType.toUpperCase()} data within ${searchRadiusKm} km`}
              actionLabel="Increase Radius"
              onAction={loadStations}
            />
          }
          ListHeaderComponent={
            cheapest ? (
              <View style={styles.cheapestBanner}>
                <Text style={styles.cheapestBannerTitle}>
                  {cheapest.brand} — {cheapest.suburb}
                </Text>
                <Text style={styles.cheapestBannerPrice}>
                  {cheapest.prices[fuelType]?.toFixed(1)}¢/L cheapest nearby
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  refreshBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  refreshText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  list: { padding: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 32 },
  cheapestBanner: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cheapestBannerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  cheapestBannerPrice: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2 },
});
