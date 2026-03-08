import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import { getLists } from '../../../src/services/listService';
import { getListPriceComparison } from '../../../src/services/priceService';
import { optimizeCart } from '../../../src/services/optimizeService';
import { ComparisonTable } from '../../../src/components/prices/ComparisonTable';
import { SkeletonCard } from '../../../src/components/common/SkeletonLoader';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import { GroceryList, OptimizeMode } from '../../../src/types';

export default function OptimizeIndexScreen() {
  const params = useLocalSearchParams<{ listId?: string }>();
  const { searchRadiusKm, distanceWeight } = useSettingsStore();
  const [selectedListId, setSelectedListId] = useState<string>(params.listId ?? '');
  const [mode, setMode] = useState<OptimizeMode>('multi_store');

  const { data: lists } = useQuery({
    queryKey: ['lists'],
    queryFn: getLists,
  });

  const { data: comparisons, isLoading: loadingPrices } = useQuery({
    queryKey: ['list-prices', selectedListId],
    queryFn: () => getListPriceComparison(selectedListId),
    enabled: !!selectedListId,
  });

  const optimizeMutation = useMutation({
    mutationFn: () => optimizeCart({
      list_id: selectedListId,
      mode,
      max_stores: mode === 'single_store' ? 1 : 3,
      include_delivery: false,
      radius_km: searchRadiusKm,
      distance_weight: distanceWeight,
    }),
    onSuccess: (result) => router.push(`/(app)/optimize/${result.id}`),
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  const activeList = lists?.find((l) => l.id === selectedListId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Price Compare</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Select List</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listChips}>
          {lists?.map((list: GroceryList) => (
            <TouchableOpacity
              key={list.id}
              style={[styles.chip, selectedListId === list.id && styles.chipActive]}
              onPress={() => setSelectedListId(list.id)}
            >
              <Text style={[styles.chipText, selectedListId === list.id && styles.chipTextActive]}>
                {list.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!selectedListId && (
          <EmptyState
            emoji="🛒"
            title="Pick a list above"
            subtitle="Select one of your grocery lists to compare prices across stores"
            actionLabel="Create List"
            onAction={() => router.push('/(app)/lists')}
          />
        )}

        {selectedListId && (
          <>
            <Text style={styles.sectionLabel}>Optimisation Mode</Text>
            <View style={styles.modeRow}>
              {(['multi_store', 'single_store'] as OptimizeMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                  onPress={() => setMode(m)}
                >
                  <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                    {m === 'multi_store' ? '🏪 Split Shops' : '🏬 One Store'}
                  </Text>
                  <Text style={[styles.modeBtnSub, mode === m && styles.modeBtnSubActive]}>
                    {m === 'multi_store' ? 'Best overall saving' : 'Convenience first'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Price Comparison</Text>
            {loadingPrices
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : comparisons && comparisons.length > 0
                ? <ComparisonTable comparisons={comparisons} />
                : <Text style={styles.emptyText}>No price data yet for this list.</Text>
            }

            <TouchableOpacity
              style={[styles.optimizeBtn, optimizeMutation.isPending && { opacity: 0.6 }]}
              onPress={() => optimizeMutation.mutate()}
              disabled={optimizeMutation.isPending}
            >
              <Ionicons name="flash" size={20} color={Colors.textInverse} />
              <Text style={styles.optimizeBtnText}>
                {optimizeMutation.isPending ? 'Finding cheapest…' : 'Optimise My Shop'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.base },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  content: { padding: Spacing.base, paddingTop: 0, paddingBottom: 32 },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  listChips: { marginBottom: 4 },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  chipTextActive: { color: Colors.textInverse },
  modeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 4 },
  modeBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadow.sm,
  },
  modeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.successLight },
  modeBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  modeBtnTextActive: { color: Colors.primary },
  modeBtnSub: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  modeBtnSubActive: { color: Colors.primaryDark },
  optimizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: 16,
    gap: Spacing.sm,
    marginTop: Spacing.base,
    ...Shadow.md,
  },
  optimizeBtnText: { fontSize: FontSize.base, color: Colors.textInverse, fontWeight: FontWeight.bold },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', padding: Spacing.xl },
});
