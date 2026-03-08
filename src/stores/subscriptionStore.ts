import { create } from 'zustand';
import { CustomerInfo } from 'react-native-purchases';

interface SubscriptionState {
  customerInfo: CustomerInfo | null;
  isPremium: boolean;
  isLoading: boolean;
  setCustomerInfo: (info: CustomerInfo | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  customerInfo: null,
  isPremium: false,
  isLoading: true,

  setCustomerInfo: (customerInfo) =>
    set({
      customerInfo,
      isPremium: customerInfo != null &&
        typeof customerInfo.entitlements.active['premium'] !== 'undefined',
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
