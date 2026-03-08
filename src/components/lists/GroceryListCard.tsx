import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroceryList } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow, StoreLabels } from '../../theme';

interface GroceryListCardProps {
  list: GroceryList;
  onPress: () => void;
}

export function GroceryListCard({ list, onPress }: GroceryListCardProps) {
  const updatedAgo = getRelativeTime(list.updated_at);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name="list" size={22} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.name} numberOfLines={1}>{list.name}</Text>
          <Text style={styles.meta}>
            {list.total_items} item{list.total_items !== 1 ? 's' : ''} · {updatedAgo}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        {list.last_optimized_at && (
          <View style={styles.optimizedBadge}>
            <Text style={styles.optimizedText}>✓ Optimized</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  meta: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  optimizedBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  optimizedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
});
