import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PriceComparison, StoreChain } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius, StoreColors, StoreLabels } from '../../theme';

const CHAINS: StoreChain[] = ['woolworths', 'coles', 'aldi'];

interface ComparisonTableProps {
  comparisons: PriceComparison[];
}

export function ComparisonTable({ comparisons }: ComparisonTableProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.colProduct}>Product</Text>
        {CHAINS.map((chain) => (
          <View key={chain} style={styles.colStore}>
            <View style={[styles.storeDot, { backgroundColor: StoreColors[chain] }]} />
            <Text style={styles.storeLabel}>{StoreLabels[chain]}</Text>
          </View>
        ))}
      </View>

      {comparisons.map((comp) => (
        <View key={comp.product.id} style={styles.dataRow}>
          <Text style={styles.productName} numberOfLines={2}>{comp.product.canonical_name}</Text>
          {CHAINS.map((chain) => {
            const entry = comp.prices[chain];
            const isCheapest = chain === comp.cheapest_chain;
            return (
              <View key={chain} style={[styles.priceCell, isCheapest && styles.cheapestCell]}>
                {entry ? (
                  <>
                    <Text style={[styles.price, isCheapest && styles.cheapestPrice]}>
                      ${entry.price.toFixed(2)}
                    </Text>
                    {entry.is_on_special && (
                      <Text style={styles.specialBadge}>SALE</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.noStock}>—</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  colProduct: {
    flex: 2,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colStore: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  storeDot: { width: 8, height: 8, borderRadius: 4 },
  storeLabel: { fontSize: 9, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  productName: {
    flex: 2,
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
    paddingRight: 4,
  },
  priceCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  cheapestCell: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.sm,
  },
  price: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  cheapestPrice: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  specialBadge: {
    fontSize: 8,
    color: Colors.accent,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  noStock: {
    fontSize: FontSize.base,
    color: Colors.textDisabled,
  },
});
