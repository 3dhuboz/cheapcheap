# Cheap Cheap 🐥

> Australia's smartest grocery & fuel savings app. Compare prices across Woolworths, Coles and Aldi, optimise your shopping cart across multiple stores, and find the cheapest fuel near you.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 51) |
| Navigation | Expo Router v3 |
| State | Zustand |
| Data Fetching | TanStack React Query v5 |
| Backend / Auth | Supabase |
| Payments | RevenueCat |
| Analytics | PostHog |
| Push Notifications | Expo Notifications |
| Build / Deploy | EAS Build + EAS Submit |

## Project Structure

```
app/
  _layout.tsx          # Root layout — RC init, Supabase auth, React Query
  (auth)/              # Unauthenticated stack: splash → onboarding → login
  (app)/               # Authenticated tab navigator
    index.tsx          # Home screen
    lists/             # Grocery list builder
    optimize/          # Price comparison + cart optimisation
    fuel.tsx           # Fuel finder
    account/           # Profile, savings tracker, settings, upgrade

src/
  components/
    common/            # Button, Card, SkeletonLoader, EmptyState, PremiumGate
    home/              # WeeklyShopButton, SavingsStreakCard
    lists/             # GroceryListCard, GroceryItemRow, ItemSearchBar
    optimize/          # TotalSavingsHero, StoreBreakdownCard
    prices/            # ComparisonTable
    fuel/              # FuelTypeSelector, StationRow
  lib/
    supabase.ts        # Supabase client with AsyncStorage session persistence
    api.ts             # Authenticated fetch helpers (GET/POST/PATCH/DELETE)
    validation.ts      # Input validation & sanitisation utilities
    security.ts        # SecureStore token helpers, rate-limiting, env validation
  services/            # One file per domain (auth, list, price, optimize, fuel, savings, subscription, analytics, notifications, referral)
  stores/              # Zustand stores (auth, list, settings, subscription)
  theme/               # Colors, Spacing, Radius, FontSize, FontWeight, Shadow, StoreColors
  types/               # Shared TypeScript interfaces
```

## Setup

### 1. Clone & install

```bash
git clone https://github.com/your-org/cheap-cheap.git
cd cheap-cheap
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `EXPO_PUBLIC_API_BASE_URL` | Cheap Cheap API base URL |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Mapbox token (fuel map) |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS API key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat Android API key |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog project API key |

### 3. Run in development

```bash
# Start Expo dev server
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android
```

### 4. EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Development build (installs on device)
eas build --profile development --platform ios

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --profile production --platform all
```

## Premium Features (RevenueCat)

Premium is gated via the `PremiumGate` component and `useSubscriptionStore`. The entitlement ID in RevenueCat must be named **`premium`**.

Offerings should be set up in the RevenueCat dashboard with two packages:
- `monthly` — Monthly subscription
- `annual` — Annual subscription (displayed as "Best Value")

## Supabase Schema

Run the SQL migrations in `supabase/migrations/` against your project. Key tables:
`users`, `stores`, `products`, `store_prices`, `grocery_lists`, `grocery_list_items`, `optimization_results`, `fuel_stations`, `user_savings`.

## Environment Notes

- All `EXPO_PUBLIC_*` variables are embedded at build time — **never put secrets here**.
- Auth tokens are stored in `expo-secure-store`, not AsyncStorage.
- The API backend (`api.cheapcheap.com.au`) handles price scraping, optimisation, and fuel data.
