import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FuelStation, FuelType } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../theme';

interface StationRowProps {
  station: FuelStation;
  fuelType: FuelType;
  isCheapest?: boolean;
  onPress: () => void;
}

const URGENCY_COLOR = {
  fill_now: Colors.success,
  wait: Colors.danger,
  neutral: Colors.textSecondary,
};

const TREND_ICON: Record<string, string> = {
  rising: '↑',
  falling: '↓',
  stable: '→',
  unknown: '?',
};

const TREND_COLOR: Record<string, string> = {
  rising: Colors.fuelRising,
  falling: Colors.fuelFalling,
  stable: Colors.fuelStable,
  unknown: Colors.textDisabled,
};

export function StationRow({ station, fuelType, isCheapest, onPress }: StationRowProps) {
  const price = station.prices[fuelType];
  const urgencyColor = URGENCY_COLOR[station.urgency] ?? Colors.textSecondary;

  return (
    <TouchableOpacity style={[styles.card, isCheapest && styles.cheapestCard]} onPress={onPress} activeOpacity={0.82}>
      {isCheapest && (
        <View style={styles.cheapestBadge}>
          <Text style={styles.cheapestBadgeText}>🏆 Cheapest Nearby</Text>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.brand}>{station.brand}</Text>
          <Text style={styles.address} numberOfLines={1}>{station.address}</Text>
          <Text style={styles.distance}>{station.distance_km.toFixed(1)} km away</Text>
        </View>
        <View style={styles.priceBlock}>
          {price != null ? (
            <>
              <Text style={styles.price}>{price.toFixed(1)}¢</Text>
              <View style={styles.trendRow}>
                <Text style={[styles.trend, { color: TREND_COLOR[station.trend] }]}>
                  {TREND_ICON[station.trend]} {station.trend}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noPrice}>N/A</Text>
          )}
        </View>
      </View>
      {station.advice && (
        <View style={[styles.adviceRow, { borderLeftColor: urgencyColor }]}>
          <Ionicons
            name={station.urgency === 'fill_now' ? 'checkmark-circle' : station.urgency === 'wait' ? 'time' : 'information-circle'}
            size={14}
            color={urgencyColor}
          />
          <Text style={[styles.advice, { color: urgencyColor }]}>{station.advice}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cheapestCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cheapestBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cheapestBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1, marginRight: Spacing.base },
  brand: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  address: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  distance: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.fuel },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  trend: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  noPrice: { fontSize: FontSize.base, color: Colors.textDisabled },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
  },
  advice: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, flex: 1 },
});
