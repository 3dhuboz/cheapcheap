import { supabase } from '../lib/supabase';
import { GroceryList, GroceryListItem, SearchProduct, UnitType } from '../types';

function mapList(row: any): GroceryList {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    status: row.status,
    is_weekly_shop: false,
    total_items: 0,
    last_optimized_at: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapItem(row: any): GroceryListItem {
  return {
    id: row.id,
    list_id: row.list_id,
    product_id: row.product_id ?? null,
    custom_name: row.name ?? null,
    quantity: row.quantity,
    unit: row.unit ?? 'each',
    notes: null,
    is_checked: row.is_checked,
    sort_order: 0,
    cheapest_price: row.cheapest_price ?? undefined,
  };
}

export async function getLists(): Promise<GroceryList[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapList);
}

export async function createList(name: string): Promise<GroceryList> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('grocery_lists')
    .insert({ user_id: user.id, name, status: 'active' })
    .select()
    .single();
  if (error) throw error;
  return mapList(data);
}

export async function updateList(id: string, patch: Partial<GroceryList>): Promise<GroceryList> {
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.status !== undefined) update.status = patch.status;
  const { data, error } = await supabase
    .from('grocery_lists')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapList(data);
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from('grocery_lists').delete().eq('id', id);
  if (error) throw error;
}

export async function getListItems(listId: string): Promise<GroceryListItem[]> {
  const { data, error } = await supabase
    .from('grocery_list_items')
    .select('*')
    .eq('list_id', listId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapItem);
}

export async function addListItem(
  listId: string,
  payload: { product_id?: string; custom_name?: string; quantity: number; unit: UnitType }
): Promise<GroceryListItem> {
  const { data, error } = await supabase
    .from('grocery_list_items')
    .insert({
      list_id: listId,
      product_id: payload.product_id ?? null,
      name: payload.custom_name ?? '',
      quantity: payload.quantity,
      unit: payload.unit,
    })
    .select()
    .single();
  if (error) throw error;
  return mapItem(data);
}

export async function updateListItem(
  listId: string,
  itemId: string,
  patch: Partial<GroceryListItem>
): Promise<GroceryListItem> {
  const update: Record<string, unknown> = {};
  if (patch.quantity !== undefined) update.quantity = patch.quantity;
  if (patch.is_checked !== undefined) update.is_checked = patch.is_checked;
  if (patch.custom_name !== undefined) update.name = patch.custom_name;
  const { data, error } = await supabase
    .from('grocery_list_items')
    .update(update)
    .eq('id', itemId)
    .eq('list_id', listId)
    .select()
    .single();
  if (error) throw error;
  return mapItem(data);
}

export async function deleteListItem(listId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_list_items')
    .delete()
    .eq('id', itemId)
    .eq('list_id', listId);
  if (error) throw error;
}

export async function searchProducts(query: string): Promise<SearchProduct[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, category, unit, unit_size, image_url')
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .limit(20);
  if (error) throw error;
  return (data ?? []).map(p => ({
    id: p.id,
    canonical_name: p.name,
    brand: p.brand,
    category: p.category,
    unit_display: p.unit_size ? `${p.unit_size}${p.unit}` : p.unit,
    image_url: p.image_url,
    cheapest_price: null,
    cheapest_chain: null,
  }));
}
