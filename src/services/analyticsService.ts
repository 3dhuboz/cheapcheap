const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = 'https://app.posthog.com';

let _distinctId: string | null = null;

async function post(path: string, body: object) {
  if (!POSTHOG_API_KEY) return;
  try {
    await fetch(`${POSTHOG_HOST}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: POSTHOG_API_KEY, ...body }),
    });
  } catch {
    // Analytics must never crash the app
  }
}

export function identifyAnalyticsUser(userId: string, properties?: Record<string, unknown>) {
  _distinctId = userId;
  post('/capture/', {
    distinct_id: userId,
    event: '$identify',
    properties: { $set: properties ?? {} },
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!_distinctId) return;
  post('/capture/', {
    distinct_id: _distinctId,
    event,
    properties: properties ?? {},
  });
}

export function resetAnalyticsUser() {
  _distinctId = null;
}

export const Events = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  LOGIN: 'login',
  REGISTER: 'register',
  LIST_CREATED: 'list_created',
  LIST_ITEM_ADDED: 'list_item_added',
  OPTIMIZATION_RUN: 'optimization_run',
  CART_EXPORTED: 'cart_exported',
  FUEL_SEARCH: 'fuel_search',
  UPGRADE_VIEWED: 'upgrade_viewed',
  UPGRADE_SUBSCRIBED: 'upgrade_subscribed',
  SAVINGS_VIEWED: 'savings_viewed',
} as const;
