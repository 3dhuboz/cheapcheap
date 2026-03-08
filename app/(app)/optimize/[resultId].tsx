import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import { getOptimizationResult, exportCart } from '../../../src/services/optimizeService';
import { TotalSavingsHero } from '../../../src/components/optimize/TotalSavingsHero';
import { StoreBreakdownCard } from '../../../src/components/optimize/StoreBreakdownCard';
import { SkeletonCard } from '../../../src/components/common/SkeletonLoader';

export default function OptimizationResultScreen() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();

  const { data: result, isLoading } = useQuery({
    queryKey: ['optimize-result', resultId],
    queryFn: () => getOptimizationResult(resultId),
    enabled: !!resultId,
  });

  const shareMutation = useMutation({
    mutationFn: () => exportCart(resultId, 'share_link'),
    onSuccess: async ({ url }) => {
      await Share.share({ message: `My Cheap Cheap shopping plan: ${url}` });
    },
    onError: (err: any) => Alert.alert('Error', err.message),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
          <Text style={styles.title}>Optimising…</Text>
        </View>
        <View style={{ padding: Spacing.base }}>{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</View>
      </SafeAreaView>
    );
  }

  if (!result) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cheapest Shop</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={() => shareMutation.mutate()}>
          <Ionicons name="share-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TotalSavingsHero
          totalCost={result.total_cost}
          totalSavings={result.total_savings}
          baselineCost={result.baseline_cost}
          storeCount={result.stores.length}
        />

        <Text style={styles.sectionLabel}>Shopping Plan</Text>
        {result.stores.map((breakdown, i) => (
          <StoreBreakdownCard key={breakdown.store.id} breakdown={breakdown} rank={i} />
        ))}

        {result.unmatched_items.length > 0 && (
          <View style={styles.unmatchedCard}>
            <Text style={styles.unmatchedTitle}>⚠️ {result.unmatched_items.length} item{result.unmatched_items.length > 1 ? 's' : ''} not found</Text>
            {result.unmatched_items.map(({ item, reason }) => (
              <Text key={item.id} style={styles.unmatchedItem}>
                • {item.product?.canonical_name ?? item.custom_name} — {reason}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.exportRow}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={async () => {
              const { url } = await exportCart(resultId, 'woolworths_cart');
              Alert.alert('Woolworths', 'Cart link copied! Open in Woolworths app.', [
                { text: 'OK' },
              ]);
            }}
          >
            <Text style={[styles.exportBtnText, { color: Colors.woolworths }]}>Add to Woolworths</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={async () => {
              await exportCart(resultId, 'coles_cart');
              Alert.alert('Coles', 'Cart link ready! Open in Coles app.');
            }}
          >
            <Text style={[styles.exportBtnText, { color: Colors.coles }]}>Add to Coles</Text>
          </TouchableOpacity>
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
  title: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  shareBtn: { padding: 4 },
  content: { padding: Spacing.base, paddingTop: 0, paddingBottom: 40 },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  unmatchedCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  unmatchedTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.warning, marginBottom: 6 },
  unmatchedItem: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 3 },
  exportRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  exportBtn: {
    flex: 1,
    padding: 13,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  exportBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
