import { apiPost, apiGet } from '../lib/api';
import { OptimizationParams, OptimizationResult } from '../types';

export async function optimizeCart(params: OptimizationParams): Promise<OptimizationResult> {
  return apiPost<OptimizationResult>('/optimize/cart', params);
}

export async function getOptimizationResult(resultId: string): Promise<OptimizationResult> {
  return apiGet<OptimizationResult>(`/optimize/cart/${resultId}`);
}

export async function buildWeeklyShop(params: {
  radius_km: number;
  distance_weight: number;
  include_delivery: boolean;
}): Promise<OptimizationResult> {
  return apiPost<OptimizationResult>('/optimize/weekly-shop', params);
}

export async function exportCart(resultId: string, type: 'woolworths_cart' | 'coles_cart' | 'aldi_pdf' | 'share_link'): Promise<{ url: string; share_token?: string }> {
  return apiPost(`/export/cart/${resultId}`, { type });
}
