import { apiGet } from '../lib/api';
import { UserSavings, WeeklySavings } from '../types';

export async function getUserSavings(): Promise<UserSavings[]> {
  return apiGet<UserSavings[]>('/users/me/savings');
}

export async function getWeeklySavings(weeks?: number): Promise<WeeklySavings[]> {
  return apiGet<WeeklySavings[]>('/users/me/savings/weekly', weeks ? { weeks } : {});
}

export async function getAllTimeSavings(): Promise<{ total: number; shop_count: number; avg_per_shop: number }> {
  return apiGet('/users/me/savings/all-time');
}
