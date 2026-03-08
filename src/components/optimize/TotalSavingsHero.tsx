import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../theme';

interface TotalSavingsHeroProps {
  totalCost: number;
  totalSavings: number;
  baselineCost: number;
  storeCount: number;
}

export function TotalSavingsHero({ totalCost, totalSavings, baselineCost, storeCount }: TotalSavingsHeroProps) {
  const savingsPct = baselineCost > 0 ? Math.round((totalSavings / baselineCost) * 100) : 0;

  return (
    <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.card}>
      <Text style={styles.savingsLabel}>You save</Text>
      <Text style={styles.savingsAmount}>${totalSavings.toFixed(2)}</Text>
      <Text style={styles.savingsPct}>{savingsPct}% off regular price</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalCost.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Your total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${baselineCost.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Without app</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{storeCount}</Text>
          <Text style={styles.statLabel}>{storeCount === 1 ? 'Store' : 'Stores'}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  savingsLabel: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeight.medium,
  },
  savingsAmount: {
    fontSize: 52,
    fontWeight: FontWeight.extrabold,
    color: Colors.textInverse,
    letterSpacing: -2,
    marginTop: 4,
  },
  savingsPct: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontWeight: FontWeight.semibold,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '100%',
    marginVertical: Spacing.base,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'stretch',
  },
});
