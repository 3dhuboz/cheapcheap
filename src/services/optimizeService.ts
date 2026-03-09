import { supabase } from '../lib/supabase';
import { OptimizationParams, OptimizationResult } from '../types';
import { getListItems } from './listService';
import { getProductPrices } from './priceService';

const _resultCache = new Map<string, OptimizationResult>();

export async function optimizeCart(params: OptimizationParams): Promise<OptimizationResult> {
  const items = await getListItems(params.list_id);
  const itemsWithProducts = items.filter(i => i.product_id);

  const comparisons = await Promise.allSettled(
    itemsWithProducts.map(i => getProductPrices(i.product_id!))
  );

  let totalCost = 0;
  let baseline = 0;

  comparisons.forEach((r, idx) => {
    if (r.status === 'fulfilled') {
      const c = r.value;
      const item = itemsWithProducts[idx];
      const cheapest = c.cheapest_price ?? 0;
      const maxPrice = Math.max(
        ...Object.values(c.prices).filter(Boolean).map(p => p!.price)
      );
      totalCost += cheapest * item.quantity;
      baseline += maxPrice * item.quantity;
    }
  });

  const now = new Date();
  const result: OptimizationResult = {
    id: `local-${Date.now()}`,
    list_id: params.list_id,
    mode: params.mode,
    total_cost: totalCost,
    total_savings: Math.max(0, baseline - totalCost),
    baseline_cost: baseline,
    stores: [],
    unmatched_items: items
      .filter(i => !i.product_id)
      .map(i => ({ item: i, reason: 'No product matched' })),
    computed_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 3600000).toISOString(),
  };
  _resultCache.set(result.id, result);
  return result;
}

export async function getOptimizationResult(resultId: string): Promise<OptimizationResult> {
  const cached = _resultCache.get(resultId);
  if (cached) return cached;
  throw new Error('Result not found. Please run optimisation again.');
}

export async function buildWeeklyShop(_params: {
  radius_km: number;
  distance_weight: number;
  include_delivery: boolean;
}): Promise<OptimizationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: lists } = await supabase
    .from('grocery_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  if (!lists?.length) throw new Error('No active list found');
  return optimizeCart({
    list_id: lists[0].id,
    mode: 'single_store',
    max_stores: 1,
    include_delivery: false,
    radius_km: _params.radius_km,
    distance_weight: _params.distance_weight,
  });
}

export async function exportCart(_resultId: string, _type: string): Promise<{ url: string; share_token?: string }> {
  return { url: '' };
}
