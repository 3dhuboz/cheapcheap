import { supabase } from '../lib/supabase';
import { UserSavings, WeeklySavings } from '../types';

export async function getUserSavings(): Promise<UserSavings[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('savings_records')
    .select('*')
    .eq('user_id', user.id)
    .order('shop_date', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(r => ({
    id: r.id,
    user_id: r.user_id,
    amount_saved: r.amount_saved,
    baseline_cost: 0,
    final_cost: 0,
    store_count: 1,
    week_start: r.shop_date,
    saved_at: r.created_at,
  }));
}

export async function getWeeklySavings(weeks = 8): Promise<WeeklySavings[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  const { data, error } = await supabase
    .from('savings_records')
    .select('shop_date, amount_saved')
    .eq('user_id', user.id)
    .gte('shop_date', since.toISOString().slice(0, 10))
    .order('shop_date');
  if (error) throw error;
  const byWeek: Record<string, { amount_saved: number; shop_count: number }> = {};
  for (const r of data ?? []) {
    const d = new Date(r.shop_date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    if (!byWeek[key]) byWeek[key] = { amount_saved: 0, shop_count: 0 };
    byWeek[key].amount_saved += r.amount_saved;
    byWeek[key].shop_count += 1;
  }
  return Object.entries(byWeek).map(([week_start, v]) => ({ week_start, ...v }));
}

export async function getAllTimeSavings(): Promise<{ total: number; shop_count: number; avg_per_shop: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, shop_count: 0, avg_per_shop: 0 };
  const { data, error } = await supabase
    .from('savings_records')
    .select('amount_saved')
    .eq('user_id', user.id);
  if (error) throw error;
  const total = (data ?? []).reduce((sum, r) => sum + (r.amount_saved ?? 0), 0);
  const shop_count = data?.length ?? 0;
  return { total, shop_count, avg_per_shop: shop_count > 0 ? total / shop_count : 0 };
}
