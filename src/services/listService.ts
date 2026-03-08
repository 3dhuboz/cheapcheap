import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
import { GroceryList, GroceryListItem, SearchProduct, UnitType } from '../types';

export async function getLists(): Promise<GroceryList[]> {
  return apiGet<GroceryList[]>('/lists');
}

export async function createList(name: string): Promise<GroceryList> {
  return apiPost<GroceryList>('/lists', { name });
}

export async function updateList(id: string, patch: Partial<GroceryList>): Promise<GroceryList> {
  return apiPatch<GroceryList>(`/lists/${id}`, patch);
}

export async function deleteList(id: string): Promise<void> {
  return apiDelete(`/lists/${id}`);
}

export async function getListItems(listId: string): Promise<GroceryListItem[]> {
  return apiGet<GroceryListItem[]>(`/lists/${listId}/items`);
}

export async function addListItem(
  listId: string,
  payload: { product_id?: string; custom_name?: string; quantity: number; unit: UnitType }
): Promise<GroceryListItem> {
  return apiPost<GroceryListItem>(`/lists/${listId}/items`, payload);
}

export async function updateListItem(
  listId: string,
  itemId: string,
  patch: Partial<GroceryListItem>
): Promise<GroceryListItem> {
  return apiPatch<GroceryListItem>(`/lists/${listId}/items/${itemId}`, patch);
}

export async function deleteListItem(listId: string, itemId: string): Promise<void> {
  return apiDelete(`/lists/${listId}/items/${itemId}`);
}

export async function searchProducts(query: string): Promise<SearchProduct[]> {
  return apiGet<SearchProduct[]>('/prices/search', { q: query });
}
