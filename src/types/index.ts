export type StoreChain = 'aldi' | 'coles' | 'woolworths';
export type FuelType = 'ulp91' | 'e10' | 'ulp95' | 'ulp98' | 'diesel' | 'lpg';
export type SubscriptionTier = 'free' | 'premium';
export type UnitType = 'each' | 'kg' | 'g' | 'l' | 'ml' | '100g' | '100ml';
export type OptimizeMode = 'single_store' | 'multi_store';
export type FuelTrend = 'rising' | 'falling' | 'stable' | 'unknown';
export type FuelUrgency = 'fill_now' | 'wait' | 'neutral';

export interface User {
  id: string;
  auth_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  default_lat: number | null;
  default_lng: number | null;
  search_radius_km: number;
  preferred_stores: StoreChain[];
  push_enabled: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  chain: StoreChain;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat: number;
  lng: number;
  has_delivery: boolean;
  has_pickup: boolean;
  trading_hours: Record<string, string> | null;
  distance_km?: number;
}

export interface Product {
  id: string;
  barcode: string | null;
  canonical_name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  unit_size: number | null;
  unit_type: UnitType;
  unit_display: string | null;
  image_url: string | null;
  is_generic: boolean;
}

export interface StorePrice {
  id: string;
  product_id: string;
  store_id: string;
  chain: StoreChain;
  price: number;
  was_price: number | null;
  unit_price: number | null;
  unit_price_type: UnitType | null;
  is_on_special: boolean;
  special_label: string | null;
  in_stock: boolean;
  scraped_at: string;
  product?: Product;
  store?: Store;
}

export interface PriceComparison {
  product: Product;
  prices: Record<StoreChain, StorePrice | null>;
  cheapest_chain: StoreChain | null;
  cheapest_price: number | null;
  max_saving: number | null;
}

export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  status: 'active' | 'archived' | 'completed';
  is_weekly_shop: boolean;
  total_items: number;
  last_optimized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroceryListItem {
  id: string;
  list_id: string;
  product_id: string | null;
  custom_name: string | null;
  quantity: number;
  unit: UnitType;
  notes: string | null;
  is_checked: boolean;
  sort_order: number;
  product?: Product;
  cheapest_price?: number;
  cheapest_chain?: StoreChain;
}

export interface OptimizationParams {
  list_id: string;
  mode: OptimizeMode;
  max_stores: number;
  include_delivery: boolean;
  radius_km: number;
  distance_weight: number;
}

export interface OptimizationStoreBreakdown {
  store: Store;
  items: Array<{
    item: GroceryListItem;
    price: number;
    line_total: number;
  }>;
  subtotal: number;
  delivery_cost?: number;
}

export interface OptimizationResult {
  id: string;
  list_id: string;
  mode: OptimizeMode;
  total_cost: number;
  total_savings: number;
  baseline_cost: number;
  stores: OptimizationStoreBreakdown[];
  unmatched_items: Array<{ item: GroceryListItem; reason: string }>;
  computed_at: string;
  expires_at: string;
}

export interface FuelStation {
  id: string;
  brand: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  lat: number;
  lng: number;
  distance_km: number;
  prices: Partial<Record<FuelType, number>>;
  trend: FuelTrend;
  predicted_low_at: string | null;
  advice: string | null;
  urgency: FuelUrgency;
  scraped_at: string;
}

export interface UserSavings {
  id: string;
  user_id: string;
  amount_saved: number;
  baseline_cost: number;
  final_cost: number;
  store_count: number;
  week_start: string;
  saved_at: string;
}

export interface WeeklySavings {
  week_start: string;
  amount_saved: number;
  shop_count: number;
}

export interface SearchProduct {
  id: string;
  canonical_name: string;
  brand: string | null;
  category: string;
  unit_display: string | null;
  image_url: string | null;
  cheapest_price: number | null;
  cheapest_chain: StoreChain | null;
}
