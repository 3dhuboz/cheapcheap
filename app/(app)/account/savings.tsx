import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import { getAllTimeSavings, getWeeklySavings } from '../../../src/services/savingsService';
import { SkeletonCard } from '../../../src/components/common/SkeletonLoader';
import { WeeklySavings } from '../../../src/types';

const { width } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 100;

export default function SavingsScreen() {
  const { data: allTime, isLoading: loadingTotal } = useQuery({
    queryKey: ['savings', 'all-time'],
    queryFn: getAllTimeSavings,
  });

  const { data: weekly, isLoading: loadingWeekly } = useQuery({
    queryKey: ['savings', 'weekly'],
    queryFn: () => getWeeklySavings(12),
  });

  const maxWeeklySaving = Math.max(...(weekly?.map((w) => w.amount_saved) ?? [1]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Savings Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loadingTotal ? <SkeletonCard /> : (
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Saved with Cheap Cheap</Text>
            <Text style={styles.heroAmount}>${(allTime?.total ?? 0).toFixed(2)}</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{allTime?.shop_count ?? 0}</Text>
                <Text style={styles.heroStatLabel}>Shops</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>${(allTime?.avg_per_shop ?? 0).toFixed(2)}</Text>
                <Text style={styles.heroStatLabel}>Avg per shop</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>🐥</Text>
                <Text style={styles.heroStatLabel}>Super saver</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Last 12 Weeks</Text>

        {loadingWeekly ? <SkeletonCard /> : (
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {(weekly ?? []).map((w: WeeklySavings) => {
                const barH = maxWeeklySaving > 0
                  ? Math.max(8, (w.amount_saved / maxWeeklySaving) * BAR_MAX_HEIGHT)
                  : 8;
                const weekLabel = new Date(w.week_start).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
                return (
                  <View key={w.week_start} style={styles.barColumn}>
                    <Text style={styles.barAmount}>
                      {w.amount_saved > 0 ? `$${w.amount_saved.toFixed(0)}` : ''}
                    </Text>
                    <View style={[styles.bar, { height: barH }]} />
                    <Text style={styles.barLabel}>{weekLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
  content: { padding: Spacing.base, paddingBottom: 40 },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
    ...Shadow.md,
  },
  heroLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  heroAmount: {
    fontSize: 56,
    fontWeight: FontWeight.extrabold,
    color: Colors.textInverse,
    letterSpacing: -2,
    marginVertical: Spacing.sm,
  },
  heroStats: { flexDirection: 'row', width: '100%' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textInverse },
  heroStatLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 48,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barAmount: { fontSize: 7, color: Colors.primary, fontWeight: FontWeight.bold },
  bar: {
    width: '65%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
    minHeight: 4,
  },
  barLabel: { fontSize: 7, color: Colors.textTertiary, textAlign: 'center' },
});
