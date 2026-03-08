import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow, StoreLabels } from '../../../src/theme';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import { StoreChain, FuelType } from '../../../src/types';

const RADIUS_OPTIONS = [5, 10, 15, 20, 30];
const STORE_OPTIONS: StoreChain[] = ['woolworths', 'coles', 'aldi'];
const FUEL_OPTIONS: { type: FuelType; label: string }[] = [
  { type: 'ulp91', label: 'Unleaded 91' },
  { type: 'e10', label: 'E10' },
  { type: 'ulp95', label: 'Premium 95' },
  { type: 'ulp98', label: 'Premium 98' },
  { type: 'diesel', label: 'Diesel' },
];

export default function SettingsScreen() {
  const {
    searchRadiusKm, setSearchRadius,
    preferredStores, setPreferredStores,
    defaultFuelType, setDefaultFuelType,
    distanceWeight, setDistanceWeight,
    pushEnabled, setPushEnabled,
    darkMode, setDarkMode,
  } = useSettingsStore();

  const toggleStore = (chain: StoreChain) => {
    if (preferredStores.includes(chain)) {
      setPreferredStores(preferredStores.filter((s) => s !== chain));
    } else {
      setPreferredStores([...preferredStores, chain]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Search Radius</Text>
        <View style={styles.card}>
          <View style={styles.chipRow}>
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, searchRadiusKm === r && styles.chipActive]}
                onPress={() => setSearchRadius(r)}
              >
                <Text style={[styles.chipText, searchRadiusKm === r && styles.chipTextActive]}>
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.section}>Preferred Stores</Text>
        <View style={styles.card}>
          <Text style={styles.hint}>Leave empty to compare all stores</Text>
          <View style={styles.chipRow}>
            {STORE_OPTIONS.map((chain) => (
              <TouchableOpacity
                key={chain}
                style={[styles.chip, preferredStores.includes(chain) && styles.chipActive]}
                onPress={() => toggleStore(chain)}
              >
                <Text style={[styles.chipText, preferredStores.includes(chain) && styles.chipTextActive]}>
                  {StoreLabels[chain]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.section}>Default Fuel Type</Text>
        <View style={styles.card}>
          <View style={styles.chipRow}>
            {FUEL_OPTIONS.map((f) => (
              <TouchableOpacity
                key={f.type}
                style={[styles.chip, defaultFuelType === f.type && styles.chipActive]}
                onPress={() => setDefaultFuelType(f.type)}
              >
                <Text style={[styles.chipText, defaultFuelType === f.type && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.section}>Optimisation Priority</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Price vs Distance</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Price 💰</Text>
            <View style={styles.sliderBtns}>
              {[0, 0.25, 0.5, 0.75, 1].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.sliderBtn, distanceWeight === val && styles.sliderBtnActive]}
                  onPress={() => setDistanceWeight(val)}
                >
                  <Text style={[styles.sliderBtnText, distanceWeight === val && styles.sliderBtnTextActive]}>
                    {val === 0 ? 'Price' : val === 0.25 ? 'Mostly' : val === 0.5 ? 'Balanced' : val === 0.75 ? 'Mostly' : 'Distance'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sliderLabel}>📍 Distance</Text>
          </View>
        </View>

        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Push Notifications</Text>
              <Text style={styles.switchSublabel}>Price drops & fuel alerts</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={pushEnabled ? Colors.primary : Colors.textDisabled}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  content: { padding: Spacing.base, paddingBottom: 48 },
  section: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  hint: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  chipTextActive: { color: Colors.textInverse },
  rowLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.md },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sliderLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sliderBtns: { flex: 1, flexDirection: 'row', gap: 4 },
  sliderBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
  },
  sliderBtnActive: { backgroundColor: Colors.primary },
  sliderBtnText: { fontSize: 8, color: Colors.textSecondary, textAlign: 'center' },
  sliderBtnTextActive: { color: Colors.textInverse },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text },
  switchSublabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
});
