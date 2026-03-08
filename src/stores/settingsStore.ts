import { create } from 'zustand';
import { StoreChain, FuelType } from '../types';

interface SettingsState {
  searchRadiusKm: number;
  preferredStores: StoreChain[];
  defaultFuelType: FuelType;
  distanceWeight: number;
  pushEnabled: boolean;
  darkMode: boolean;
  setSearchRadius: (km: number) => void;
  setPreferredStores: (stores: StoreChain[]) => void;
  setDefaultFuelType: (type: FuelType) => void;
  setDistanceWeight: (weight: number) => void;
  setPushEnabled: (enabled: boolean) => void;
  setDarkMode: (dark: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  searchRadiusKm: 10,
  preferredStores: [],
  defaultFuelType: 'ulp91',
  distanceWeight: 0.5,
  pushEnabled: true,
  darkMode: false,

  setSearchRadius: (searchRadiusKm) => set({ searchRadiusKm }),
  setPreferredStores: (preferredStores) => set({ preferredStores }),
  setDefaultFuelType: (defaultFuelType) => set({ defaultFuelType }),
  setDistanceWeight: (distanceWeight) => set({ distanceWeight }),
  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setDarkMode: (darkMode) => set({ darkMode }),
}));
