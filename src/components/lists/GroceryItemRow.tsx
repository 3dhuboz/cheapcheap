import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroceryListItem, StoreChain } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius, StoreColors, StoreLabels } from '../../theme';

interface GroceryItemRowProps {
  item: GroceryListItem;
  onToggleCheck: (item: GroceryListItem) => void;
  onIncrease: (item: GroceryListItem) => void;
  onDecrease: (item: GroceryListItem) => void;
  onDelete: (item: GroceryListItem) => void;
}

export function GroceryItemRow({ item, onToggleCheck, onIncrease, onDecrease, onDelete }: GroceryItemRowProps) {
  const name = item.product?.canonical_name ?? item.custom_name ?? 'Unknown item';
  const cheapestChain = item.cheapest_chain;
  const cheapestPrice = item.cheapest_price;

  return (
    <View style={[styles.row, item.is_checked && styles.rowChecked]}>
      <TouchableOpacity style={styles.checkBtn} onPress={() => onToggleCheck(item)} activeOpacity={0.7}>
        <View style={[styles.checkbox, item.is_checked && styles.checkboxChecked]}>
          {item.is_checked && <Ionicons name="checkmark" size={14} color={Colors.textInverse} />}
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.name, item.is_checked && styles.nameChecked]} numberOfLines={1}>
          {name}
        </Text>
        {item.product?.brand && (
          <Text style={styles.brand}>{item.product.brand} · {item.product.unit_display}</Text>
        )}
        {cheapestChain && cheapestPrice != null && (
          <View style={styles.priceBadge}>
            <View style={[styles.storeDot, { backgroundColor: StoreColors[cheapestChain] }]} />
            <Text style={styles.priceText}>
              ${cheapestPrice.toFixed(2)} at {StoreLabels[cheapestChain]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.qty}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => onDecrease(item)}>
          <Ionicons name="remove" size={16} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => onIncrease(item)}>
          <Ionicons name="add" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
        <Ionicons name="trash-outline" size={18} color={Colors.textDisabled} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: 6,
    gap: Spacing.sm,
  },
  rowChecked: { opacity: 0.55 },
  checkBtn: { padding: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  info: { flex: 1 },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text },
  nameChecked: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  brand: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  priceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  storeDot: { width: 6, height: 6, borderRadius: 3 },
  priceText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, minWidth: 20, textAlign: 'center' },
  deleteBtn: { padding: 4 },
});
