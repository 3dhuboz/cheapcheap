import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import {
  getListItems, addListItem, updateListItem,
  deleteListItem, updateList,
} from '../../../src/services/listService';
import { GroceryItemRow } from '../../../src/components/lists/GroceryItemRow';
import { ItemSearchBar } from '../../../src/components/lists/ItemSearchBar';
import { SkeletonListItem } from '../../../src/components/common/SkeletonLoader';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { GroceryListItem, SearchProduct } from '../../../src/types';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['list-items', id],
    queryFn: () => getListItems(id),
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: (payload: Parameters<typeof addListItem>[1]) => addListItem(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', id] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, patch }: { itemId: string; patch: Partial<GroceryListItem> }) =>
      updateListItem(id, itemId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteListItem(id, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-items', id] }),
  });

  const handleProductSelect = (product: SearchProduct) => {
    addMutation.mutate({ product_id: product.id, quantity: 1, unit: 'each' });
  };

  const handleCustomAdd = (name: string) => {
    addMutation.mutate({ custom_name: name, quantity: 1, unit: 'each' });
  };

  const handleToggleCheck = (item: GroceryListItem) => {
    updateMutation.mutate({ itemId: item.id, patch: { is_checked: !item.is_checked } });
  };

  const handleIncrease = (item: GroceryListItem) => {
    updateMutation.mutate({ itemId: item.id, patch: { quantity: item.quantity + 1 } });
  };

  const handleDecrease = (item: GroceryListItem) => {
    if (item.quantity <= 1) {
      Alert.alert('Remove item?', '', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
      ]);
    } else {
      updateMutation.mutate({ itemId: item.id, patch: { quantity: item.quantity - 1 } });
    }
  };

  const handleDelete = (item: GroceryListItem) => {
    deleteMutation.mutate(item.id);
  };

  const checkedCount = items?.filter((i) => i.is_checked).length ?? 0;
  const totalCount = items?.length ?? 0;

  const handleOptimize = () => {
    router.push(`/(app)/optimize?listId=${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>Grocery List</Text>
          {totalCount > 0 && (
            <Text style={styles.progress}>{checkedCount}/{totalCount} checked</Text>
          )}
        </View>
        {totalCount > 0 && (
          <TouchableOpacity style={styles.optimizeBtn} onPress={handleOptimize}>
            <Text style={styles.optimizeBtnText}>Compare</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <ItemSearchBar onSelect={handleProductSelect} onCustomAdd={handleCustomAdd} />
      </View>

      {isLoading
        ? (
          <View style={{ padding: Spacing.base }}>
            {[1, 2, 3, 4].map((i) => <SkeletonListItem key={i} />)}
          </View>
        )
        : (
          <FlatList
            data={items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <GroceryItemRow
                item={item}
                onToggleCheck={handleToggleCheck}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onDelete={handleDelete}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                emoji="🥦"
                title="List is empty"
                subtitle="Search above to add items to your list"
              />
            }
          />
        )
      }

      {totalCount > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.compareBigBtn} onPress={handleOptimize}>
            <Ionicons name="cart" size={20} color={Colors.textInverse} />
            <Text style={styles.compareBigText}>Compare Prices & Optimize</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  progress: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  optimizeBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  optimizeBtnText: { fontSize: FontSize.sm, color: Colors.textInverse, fontWeight: FontWeight.semibold },
  searchContainer: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, zIndex: 10 },
  list: { padding: Spacing.base, paddingTop: Spacing.xs, paddingBottom: 100 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    paddingBottom: 28,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  compareBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: 16,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  compareBigText: { fontSize: FontSize.base, color: Colors.textInverse, fontWeight: FontWeight.bold },
});
