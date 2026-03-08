import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { OptimizationStoreBreakdown } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow, StoreColors, StoreLabels } from '../../theme';

interface StoreBreakdownCardProps {
  breakdown: OptimizationStoreBreakdown;
  rank: number;
}

export function StoreBreakdownCard({ breakdown, rank }: StoreBreakdownCardProps) {
  const [expanded, setExpanded] = useState(rank === 0);
  const chain = breakdown.store.chain;
  const storeColor = StoreColors[chain] ?? Colors.primary;

  return (
    <View style={[styles.card, { borderLeftColor: storeColor }]}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={[styles.rankBadge, { backgroundColor: storeColor }]}>
          <Text style={styles.rankText}>#{rank + 1}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.storeName}>{StoreLabels[chain] ?? chain}</Text>
          <Text style={styles.storeAddress} numberOfLines={1}>{breakdown.store.suburb}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.subtotal}>${breakdown.subtotal.toFixed(2)}</Text>
          <Text style={styles.itemCount}>{breakdown.items.length} items</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textTertiary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.itemList}>
          {breakdown.items.map(({ item, price, line_total }, i) => {
            const name = item.product?.canonical_name ?? item.custom_name ?? 'Item';
            return (
              <View key={item.id} style={[styles.itemRow, i === breakdown.items.length - 1 && styles.itemRowLast]}>
                <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>${line_total.toFixed(2)}</Text>
              </View>
            );
          })}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${breakdown.subtotal.toFixed(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },
  headerInfo: { flex: 1 },
  storeName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  storeAddress: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  headerRight: { alignItems: 'flex-end' },
  subtotal: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  itemCount: { fontSize: FontSize.xs, color: Colors.textTertiary },
  itemList: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  itemRowLast: { borderBottomWidth: 0 },
  itemName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  itemQty: { fontSize: FontSize.sm, color: Colors.textTertiary, width: 28, textAlign: 'center' },
  itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, width: 56, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1.5,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  totalValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
});
