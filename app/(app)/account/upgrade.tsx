import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import {
  getOfferings, purchasePackage, restorePurchases, isPremium,
} from '../../../src/services/subscriptionService';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { PurchasesPackage } from 'react-native-purchases';
import { useQuery, useMutation } from '@tanstack/react-query';

const FEATURES = [
  { icon: '⚡', title: 'Unlimited Optimisations', desc: 'Run cart optimisations as many times as you like' },
  { icon: '🏪', title: 'Multi-Store Split Shopping', desc: 'Shop across up to 5 stores for maximum savings' },
  { icon: '📊', title: 'Full Savings History', desc: 'Detailed weekly breakdown and savings charts' },
  { icon: '🔔', title: 'Smart Price Alerts', desc: 'Get notified when tracked items drop in price' },
  { icon: '⛽', title: 'Fuel Price Predictions', desc: '7-day fuel price forecast to fill up at the right time' },
  { icon: '📤', title: 'Cart Export', desc: 'Send your shopping list directly to Woolworths & Coles' },
];

export default function UpgradeScreen() {
  const { setCustomerInfo } = useSubscriptionStore();
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);

  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      const info = await purchasePackage(pkg);
      setCustomerInfo(info);
      return info;
    },
    onSuccess: (info) => {
      if (isPremium(info)) {
        Alert.alert('🎉 Welcome to Premium!', 'You now have full access to all Cheap Cheap features.', [
          { text: 'Let\'s go!', onPress: () => router.back() },
        ]);
      }
    },
    onError: (err: any) => {
      if (!err.userCancelled) {
        Alert.alert('Purchase Failed', err.message ?? 'Please try again.');
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restorePurchases,
    onSuccess: (info) => {
      setCustomerInfo(info);
      if (isPremium(info)) {
        Alert.alert('Restored!', 'Your Premium subscription has been restored.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Purchase Found', 'No active Premium subscription was found for this account.');
      }
    },
    onError: (err: any) => Alert.alert('Restore Failed', err.message),
  });

  const handlePurchase = () => {
    if (!selectedPkg) {
      Alert.alert('Select a plan', 'Please choose a subscription plan below.');
      return;
    }
    purchaseMutation.mutate(selectedPkg);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.secondary, Colors.secondaryDark]} style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Cheap Cheap Premium</Text>
          <Text style={styles.heroSub}>Save more. Stress less.</Text>
        </LinearGradient>

        <View style={styles.featuresSection}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            </View>
          ))}
        </View>

        <Text style={styles.planLabel}>Choose Your Plan</Text>

        {loadingPackages ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
        ) : packages && packages.length > 0 ? (
          <View style={styles.plans}>
            {packages.map((pkg) => {
              const isSelected = selectedPkg?.identifier === pkg.identifier;
              const isAnnual = pkg.packageType === 'ANNUAL';
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.plan, isSelected && styles.planSelected]}
                  onPress={() => setSelectedPkg(pkg)}
                  activeOpacity={0.82}
                >
                  {isAnnual && (
                    <View style={styles.bestValueBadge}>
                      <Text style={styles.bestValueText}>Best Value</Text>
                    </View>
                  )}
                  <Text style={styles.planTitle}>
                    {pkg.product.title.replace(' (Cheap Cheap)', '')}
                  </Text>
                  <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                  <Text style={styles.planPer}>
                    {isAnnual ? 'per year · save ~40%' : 'per month'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noPackages}>
            <Text style={styles.noPackagesText}>
              Pricing unavailable. Please check your connection and try again.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.subscribeBtn, (!selectedPkg || purchaseMutation.isPending) && { opacity: 0.6 }]}
          onPress={handlePurchase}
          disabled={!selectedPkg || purchaseMutation.isPending}
        >
          {purchaseMutation.isPending
            ? <ActivityIndicator color={Colors.text} />
            : <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={() => restoreMutation.mutate()}
          disabled={restoreMutation.isPending}
        >
          <Text style={styles.restoreBtnText}>
            {restoreMutation.isPending ? 'Restoring…' : 'Restore Purchases'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Subscriptions auto-renew unless cancelled at least 24h before the renewal date. Manage in
          your App Store / Google Play account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'flex-end', padding: Spacing.base, paddingBottom: 0 },
  closeBtn: { padding: 4 },
  content: { paddingBottom: 48 },
  hero: {
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  heroEmoji: { fontSize: 48 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text },
  heroSub: { fontSize: FontSize.base, color: Colors.textSecondary },
  featuresSection: {
    padding: Spacing.base,
    gap: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: 4,
  },
  featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  featureDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  planLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  plans: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  plan: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  planSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryLight,
  },
  bestValueBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  bestValueText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.text },
  planTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'center' },
  planPrice: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary, marginTop: 4 },
  planPer: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2, textAlign: 'center' },
  noPackages: { padding: Spacing.xl, alignItems: 'center' },
  noPackagesText: { color: Colors.textSecondary, textAlign: 'center', fontSize: FontSize.sm },
  subscribeBtn: {
    backgroundColor: Colors.secondary,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.full,
    padding: 16,
    alignItems: 'center',
    ...Shadow.md,
  },
  subscribeBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  restoreBtn: { alignItems: 'center', padding: Spacing.base },
  restoreBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  legalText: {
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 16,
  },
});
