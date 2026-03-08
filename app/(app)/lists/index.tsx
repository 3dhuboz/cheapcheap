import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../../src/theme';
import { getLists, createList, deleteList } from '../../../src/services/listService';
import { GroceryListCard } from '../../../src/components/lists/GroceryListCard';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { SkeletonCard } from '../../../src/components/common/SkeletonLoader';
import { GroceryList } from '../../../src/types';

export default function ListsScreen() {
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: getLists,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createList(name),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setShowModal(false);
      setNewListName('');
      router.push(`/(app)/lists/${newList.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists'] }),
  });

  const handleDelete = (list: GroceryList) => {
    Alert.alert('Delete List', `Delete "${list.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(list.id) },
    ]);
  };

  const handleCreate = () => {
    if (!newListName.trim()) return;
    createMutation.mutate(newListName.trim());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Lists</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {isLoading
        ? <View style={{ padding: Spacing.base }}>{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</View>
        : (
          <FlatList
            data={lists ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <GroceryListCard
                list={item}
                onPress={() => router.push(`/(app)/lists/${item.id}`)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                emoji="🛒"
                title="No lists yet"
                subtitle="Create your first grocery list to get started"
                actionLabel="Create List"
                onAction={() => setShowModal(true)}
              />
            }
          />
        )
      }

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New List</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Weekly Shop"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              placeholderTextColor={Colors.textDisabled}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, !newListName.trim() && { opacity: 0.5 }]}
                onPress={handleCreate}
                disabled={!newListName.trim() || createMutation.isPending}
              >
                <Text style={styles.createText}>
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.base, paddingTop: 0 },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    ...Shadow.lg,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.base },
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.text,
    marginBottom: Spacing.base,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: {
    flex: 1,
    padding: 13,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  createBtn: {
    flex: 1,
    padding: 13,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  createText: { fontSize: FontSize.base, color: Colors.textInverse, fontWeight: FontWeight.bold },
});
