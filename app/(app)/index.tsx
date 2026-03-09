import { ScrollView, View, Text, StyleSheet, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/theme';
import { WeeklyShopButton } from '../../src/components/home/WeeklyShopButton';
import { SavingsStreakCard } from '../../src/components/home/SavingsStreakCard';
import { SkeletonCard } from '../../src/components/common/SkeletonLoader';
import { useAuthStore } from '../../src/stores/authStore';
import { getAllTimeSavings } from '../../src/services/savingsService';
import { getLists } from '../../src/services/listService';
import { GroceryListCard } from '../../src/components/lists/GroceryListCard';

export default function HomeScreen() {
  const { user } = useAuthStore();

  const { data: savings, isLoading: savingsLoading } = useQuery({
    queryKey: ['savings', 'all-time'],
    queryFn: getAllTimeSavings,
    staleTime: 1000 * 60 * 15,
  });

  const { data: lists, isLoading: listsLoading, refetch } = useQuery({
    queryKey: ['lists'],
    queryFn: getLists,
    staleTime: 1000 * 60 * 5,
  });

  const activeLists = lists?.filter((l) => l.status === 'active').slice(0, 3) ?? [];
  const firstName = user?.display_name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>👋 Hi, {firstName}!</Text>
            <Text style={styles.subGreeting}>Ready to save this week?</Text>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <WeeklyShopButton />

        {savingsLoading
          ? <SkeletonCard />
          : <SavingsStreakCard
              totalSaved={savings?.total ?? 0}
              weeksSaved={savings?.shop_count ?? 0}
              thisWeekSaved={0}
            />
        }

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Lists</Text>
          <Text style={styles.sectionAction} onPress={() => router.push('/(app)/lists')}>
            See all →
          </Text>
        </View>

        {listsLoading
          ? [1, 2].map((i) => <SkeletonCard key={i} />)
          : activeLists.length === 0
            ? (
              <View style={styles.emptyLists}>
                <Text style={styles.emptyText}>No lists yet. Create your first one!</Text>
              </View>
            )
            : activeLists.map((list) => (
              <GroceryListCard
                key={list.id}
                list={list}
                onPress={() => router.push(`/(app)/lists/${list.id}`)}
              />
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  greeting: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  subGreeting: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  logo: { width: 52, height: 52 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  sectionAction: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  emptyLists: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  emptyText: { color: Colors.textSecondary, fontSize: FontSize.base },
});
