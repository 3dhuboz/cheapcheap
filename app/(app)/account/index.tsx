import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import { useAuthStore } from '../../../src/stores/authStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function MenuItem({ icon, label, sublabel, onPress, danger }: {
  icon: IconName; label: string; sublabel?: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? Colors.danger : Colors.primary} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const { user, signOut } = useAuthStore();
  const { isPremium } = useSubscriptionStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => router.push('/(app)/account/upgrade')}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeBannerEmoji}>⭐</Text>
            <View style={styles.upgradeBannerText}>
              <Text style={styles.upgradeBannerTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeBannerSub}>Unlock all features & save more</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </TouchableOpacity>
        )}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🐥</Text>
          </View>
          <View>
            <Text style={styles.displayName}>{user?.display_name ?? 'Saver'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={[styles.tierBadge, user?.subscription_tier === 'premium' && styles.tierBadgePremium]}>
              <Text style={styles.tierText}>
                {user?.subscription_tier === 'premium' ? '⭐ Premium' : '🐥 Free Plan'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.section}>Savings</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="trending-up"
            label="Savings Tracker"
            sublabel="View your all-time savings"
            onPress={() => router.push('/(app)/account/savings')}
          />
        </View>

        <Text style={styles.section}>Preferences</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="settings-outline"
            label="Settings"
            sublabel="Radius, preferred stores, fuel type"
            onPress={() => router.push('/(app)/account/settings')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            sublabel={user?.push_enabled ? 'On' : 'Off'}
            onPress={() => router.push('/(app)/account/settings')}
          />
        </View>

        <Text style={styles.section}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => Alert.alert('Privacy', 'Coming soon.')}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'Email us at support@cheapcheap.com.au')}
          />
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
        </View>

        <Text style={styles.version}>Cheap Cheap v1.0.0 · Made in Australia 🦘</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 34 },
  displayName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  tierBadge: {
    marginTop: 6,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  tierBadgePremium: { backgroundColor: Colors.secondaryLight },
  tierText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text },
  section: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.dangerLight },
  menuText: { flex: 1 },
  menuLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text },
  menuLabelDanger: { color: Colors.danger },
  menuSublabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    ...Shadow.sm,
  },
  upgradeBannerEmoji: { fontSize: 24 },
  upgradeBannerText: { flex: 1 },
  upgradeBannerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  upgradeBannerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
