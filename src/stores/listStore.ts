import { create } from 'zustand';
import { GroceryList, GroceryListItem } from '../types';

interface ListState {
  lists: GroceryList[];
  activeListId: string | null;
  items: Record<string, GroceryListItem[]>;
  isLoading: boolean;
  setLists: (lists: GroceryList[]) => void;
  setActiveList: (id: string | null) => void;
  setItems: (listId: string, items: GroceryListItem[]) => void;
  addItemOptimistic: (listId: string, item: GroceryListItem) => void;
  removeItemOptimistic: (listId: string, itemId: string) => void;
  updateItemOptimistic: (listId: string, itemId: string, patch: Partial<GroceryListItem>) => void;
  setLoading: (loading: boolean) => void;
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  activeListId: null,
  items: {},
  isLoading: false,

  setLists: (lists) => set({ lists }),
  setActiveList: (activeListId) => set({ activeListId }),
  setItems: (listId, items) =>
    set((state) => ({ items: { ...state.items, [listId]: items } })),

  addItemOptimistic: (listId, item) =>
    set((state) => ({
      items: {
        ...state.items,
        [listId]: [...(state.items[listId] ?? []), item],
      },
    })),

  removeItemOptimistic: (listId, itemId) =>
    set((state) => ({
      items: {
        ...state.items,
        [listId]: (state.items[listId] ?? []).filter((i) => i.id !== itemId),
      },
    })),

  updateItemOptimistic: (listId, itemId, patch) =>
    set((state) => ({
      items: {
        ...state.items,
        [listId]: (state.items[listId] ?? []).map((i) =>
          i.id === itemId ? { ...i, ...patch } : i
        ),
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
