import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../theme';
import { useSubscriptionStore } from '../../stores/subscriptionStore';

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
}

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const { isPremium } = useSubscriptionStore();

  if (isPremium) return <>{children}</>;

  return (
    <View style={styles.gate}>
      <View style={styles.lockBadge}>
        <Ionicons name="star" size={22} color={Colors.secondary} />
      </View>
      <Text style={styles.title}>Premium Feature</Text>
      <Text style={styles.subtitle}>{feature} is available on the Premium plan.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/(app)/account/upgrade')}>
        <Text style={styles.btnText}>Upgrade to Premium ✨</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  lockBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: Spacing.base,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  btnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
