import { apiGet } from '../lib/api';
import { PriceComparison, StorePrice } from '../types';

export async function getProductPrices(productId: string): Promise<PriceComparison> {
  return apiGet<PriceComparison>(`/prices/product/${productId}`);
}

export async function getListPriceComparison(listId: string): Promise<PriceComparison[]> {
  return apiGet<PriceComparison[]>(`/prices/list/${listId}`);
}

export async function getPriceHistory(
  productId: string
): Promise<Array<{ date: string; chain: string; price: number }>> {
  return apiGet(`/prices/history/${productId}`);
}

export async function getSpecials(chain?: string): Promise<StorePrice[]> {
  return apiGet<StorePrice[]>('/prices/specials', chain ? { chain } : {});
}
