import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../theme';

interface SavingsStreakCardProps {
  totalSaved: number;
  weeksSaved: number;
  thisWeekSaved: number;
}

export function SavingsStreakCard({ totalSaved, weeksSaved, thisWeekSaved }: SavingsStreakCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push('/(app)/account/savings')} activeOpacity={0.85}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${thisWeekSaved.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Saved this week</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalSaved.toFixed(0)}</Text>
          <Text style={styles.statLabel}>All-time savings</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{weeksSaved}</Text>
          <Text style={styles.statLabel}>Week streak 🔥</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.borderLight,
  },
});
