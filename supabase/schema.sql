-- ============================================================
-- Cheap Cheap — Full Database Schema
-- Paste this into: supabase.com → project → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (linked to Supabase Auth users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  is_admin boolean not null default false,
  is_premium boolean not null default false,
  premium_expires_at timestamptz,
  referral_code text unique,
  referred_by uuid references profiles(id),
  push_token text,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    upper(substring(md5(random()::text), 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- STORES
-- ============================================================
create table if not exists stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  chain text not null, -- 'woolworths' | 'coles' | 'aldi' | 'iga' | 'other'
  address text,
  suburb text,
  state text,
  postcode text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text,
  barcode text unique,
  category text, -- 'dairy' | 'meat' | 'fruit_veg' | 'bakery' | 'pantry' | 'drinks' | 'snacks' | 'household' | 'other'
  unit text, -- 'ea' | 'kg' | 'g' | 'L' | 'ml' | 'pack'
  unit_size numeric,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- STORE PRICES
-- ============================================================
create table if not exists store_prices (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  price numeric(10,2) not null,
  was_price numeric(10,2), -- original price before sale
  is_on_sale boolean not null default false,
  sale_ends_at timestamptz,
  in_stock boolean not null default true,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(store_id, product_id)
);

-- ============================================================
-- GROCERY LISTS
-- ============================================================
create table if not exists grocery_lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  status text not null default 'active', -- 'active' | 'completed' | 'archived'
  total_saved numeric(10,2) default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- GROCERY LIST ITEMS
-- ============================================================
create table if not exists grocery_list_items (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid not null references grocery_lists(id) on delete cascade,
  product_id uuid references products(id),
  name text not null, -- fallback if no product_id
  quantity integer not null default 1,
  unit text,
  is_checked boolean not null default false,
  cheapest_store_id uuid references stores(id),
  cheapest_price numeric(10,2),
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUEL STATIONS
-- ============================================================
create table if not exists fuel_stations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text, -- 'bp' | 'shell' | '7eleven' | 'caltex' | 'ampol' | 'other'
  address text,
  suburb text,
  state text,
  postcode text,
  lat double precision not null,
  lng double precision not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FUEL PRICES
-- ============================================================
create table if not exists fuel_prices (
  id uuid primary key default uuid_generate_v4(),
  station_id uuid not null references fuel_stations(id) on delete cascade,
  fuel_type text not null, -- 'ulp91' | 'ulp95' | 'ulp98' | 'diesel' | 'e10' | 'lpg'
  price numeric(6,2) not null,
  reported_at timestamptz not null default now(),
  unique(station_id, fuel_type)
);

-- ============================================================
-- SAVINGS RECORDS
-- ============================================================
create table if not exists savings_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  list_id uuid references grocery_lists(id),
  amount_saved numeric(10,2) not null,
  shop_date date not null default current_date,
  store_ids uuid[],
  created_at timestamptz not null default now()
);

-- ============================================================
-- APP SETTINGS (admin-controlled feature flags)
-- ============================================================
create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

-- Default settings
insert into app_settings (key, value, description) values
  ('maintenance_mode', 'false', 'Put app in maintenance mode'),
  ('premium_price_aud', '4.99', 'Monthly premium subscription price'),
  ('max_free_lists', '3', 'Max grocery lists for free users'),
  ('max_free_optimisations', '2', 'Max cart optimisations per month for free users'),
  ('fuel_refresh_hours', '2', 'How often fuel prices refresh (hours)'),
  ('price_refresh_hours', '24', 'How often grocery prices refresh (hours)'),
  ('referral_reward_days', '30', 'Premium days awarded for successful referral')
on conflict (key) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table grocery_lists enable row level security;
alter table grocery_list_items enable row level security;
alter table savings_records enable row level security;
alter table stores enable row level security;
alter table products enable row level security;
alter table store_prices enable row level security;
alter table fuel_stations enable row level security;
alter table fuel_prices enable row level security;
alter table app_settings enable row level security;

-- Drop existing policies to allow re-running this script
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Users manage own lists" on grocery_lists;
drop policy if exists "Users manage own list items" on grocery_list_items;
drop policy if exists "Users manage own savings" on savings_records;
drop policy if exists "Anyone can read stores" on stores;
drop policy if exists "Anyone can read products" on products;
drop policy if exists "Anyone can read store prices" on store_prices;
drop policy if exists "Anyone can read fuel stations" on fuel_stations;
drop policy if exists "Anyone can read fuel prices" on fuel_prices;
drop policy if exists "Anyone can read app settings" on app_settings;
drop policy if exists "Admins manage stores" on stores;
drop policy if exists "Admins manage products" on products;
drop policy if exists "Admins manage store prices" on store_prices;
drop policy if exists "Admins manage fuel stations" on fuel_stations;
drop policy if exists "Admins manage fuel prices" on fuel_prices;
drop policy if exists "Admins manage app settings" on app_settings;

-- Profiles: users read/update own, admins read all
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Grocery lists: own data only
create policy "Users manage own lists" on grocery_lists for all using (auth.uid() = user_id);

-- Grocery list items: via list ownership
create policy "Users manage own list items" on grocery_list_items for all using (
  exists (select 1 from grocery_lists where id = list_id and user_id = auth.uid())
);

-- Savings: own data only
create policy "Users manage own savings" on savings_records for all using (auth.uid() = user_id);

-- Public read for stores, products, prices, fuel
create policy "Anyone can read stores" on stores for select using (true);
create policy "Anyone can read products" on products for select using (true);
create policy "Anyone can read store prices" on store_prices for select using (true);
create policy "Anyone can read fuel stations" on fuel_stations for select using (true);
create policy "Anyone can read fuel prices" on fuel_prices for select using (true);
create policy "Anyone can read app settings" on app_settings for select using (true);

-- Admin write access
create policy "Admins manage stores" on stores for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins manage products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins manage store prices" on store_prices for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins manage fuel stations" on fuel_stations for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins manage fuel prices" on fuel_prices for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "Admins manage app settings" on app_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_store_prices_product on store_prices(product_id);
create index if not exists idx_store_prices_store on store_prices(store_id);
create index if not exists idx_grocery_list_items_list on grocery_list_items(list_id);
create index if not exists idx_grocery_lists_user on grocery_lists(user_id);
create index if not exists idx_savings_user on savings_records(user_id);
create index if not exists idx_fuel_prices_station on fuel_prices(station_id);
create index if not exists idx_stores_chain on stores(chain);
create index if not exists idx_fuel_stations_lat_lng on fuel_stations(lat, lng);
