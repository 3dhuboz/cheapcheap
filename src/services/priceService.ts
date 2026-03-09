import { supabase } from '../lib/supabase';
import { PriceComparison, StorePrice, StoreChain } from '../types';

export async function getProductPrices(productId: string): Promise<PriceComparison> {
  const { data: product } = await supabase
    .from('products').select('*').eq('id', productId).single();
  const { data: prices } = await supabase
    .from('store_prices')
    .select('*, stores(*)')
    .eq('product_id', productId)
    .eq('in_stock', true);

  const priceMap: Record<StoreChain, StorePrice | null> = { aldi: null, coles: null, woolworths: null };
  let cheapestPrice: number | null = null;
  let cheapestChain: StoreChain | null = null;

  for (const p of prices ?? []) {
    const chain = p.stores?.chain as StoreChain;
    if (!chain || !['aldi','coles','woolworths'].includes(chain)) continue;
    const sp: StorePrice = {
      id: p.id, product_id: p.product_id, store_id: p.store_id, chain,
      price: p.price, was_price: p.was_price, unit_price: null, unit_price_type: null,
      is_on_special: p.is_on_sale, special_label: null, in_stock: p.in_stock,
      scraped_at: p.last_verified_at,
    };
    if (!priceMap[chain] || p.price < (priceMap[chain]?.price ?? Infinity)) {
      priceMap[chain] = sp;
      if (cheapestPrice === null || p.price < cheapestPrice) {
        cheapestPrice = p.price;
        cheapestChain = chain;
      }
    }
  }

  return {
    product: product ? {
      id: product.id, barcode: product.barcode, canonical_name: product.name,
      brand: product.brand, category: product.category, subcategory: null,
      unit_size: product.unit_size, unit_type: product.unit as any,
      unit_display: product.unit_size ? `${product.unit_size}${product.unit}` : product.unit,
      image_url: product.image_url, is_generic: false,
    } : {} as any,
    prices: priceMap,
    cheapest_chain: cheapestChain,
    cheapest_price: cheapestPrice,
    max_saving: null,
  };
}

export async function getListPriceComparison(listId: string): Promise<PriceComparison[]> {
  const { data: items } = await supabase
    .from('grocery_list_items')
    .select('product_id')
    .eq('list_id', listId)
    .not('product_id', 'is', null);
  if (!items?.length) return [];
  const ids = items.map(i => i.product_id).filter(Boolean);
  return Promise.all(ids.map(id => getProductPrices(id)));
}

export async function getPriceHistory(
  _productId: string
): Promise<Array<{ date: string; chain: string; price: number }>> {
  return [];
}

export async function getSpecials(chain?: string): Promise<StorePrice[]> {
  let query = supabase
    .from('store_prices')
    .select('*, stores(*)')
    .eq('is_on_sale', true)
    .eq('in_stock', true)
    .limit(50);
  if (chain) query = query.eq('stores.chain', chain);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(p => ({
    id: p.id, product_id: p.product_id, store_id: p.store_id,
    chain: (p.stores?.chain ?? 'woolworths') as StoreChain,
    price: p.price, was_price: p.was_price, unit_price: null, unit_price_type: null,
    is_on_special: true, special_label: null, in_stock: true,
    scraped_at: p.last_verified_at,
  }));
}
