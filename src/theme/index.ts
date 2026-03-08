export const Colors = {
  primary: '#2D9B4E',
  primaryLight: '#4CBB6A',
  primaryDark: '#1E7A3A',
  secondary: '#F5C842',
  secondaryLight: '#FFD966',
  secondaryDark: '#D4A817',
  accent: '#FF6B35',
  accentLight: '#FF8C5A',
  danger: '#E53E3E',
  dangerLight: '#FED7D7',
  success: '#2D9B4E',
  successLight: '#C6F6D5',
  warning: '#D69E2E',
  warningLight: '#FEFCBF',

  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F4F0',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',

  text: '#1A1A2E',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textInverse: '#FFFFFF',
  textDisabled: '#A0AEC0',

  woolworths: '#1B6637',
  coles: '#E31837',
  aldi: '#003580',

  fuel: '#FF6B35',
  fuelRising: '#E53E3E',
  fuelFalling: '#2D9B4E',
  fuelStable: '#718096',

  tabBar: '#FFFFFF',
  tabBarActive: '#2D9B4E',
  tabBarInactive: '#A0AEC0',

  skeleton: '#E2E8F0',
  skeletonHighlight: '#F7FAFC',
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: 'rgba(255,255,255,0.4)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const StoreColors: Record<string, string> = {
  woolworths: Colors.woolworths,
  coles: Colors.coles,
  aldi: Colors.aldi,
};

export const StoreLabels: Record<string, string> = {
  woolworths: 'Woolworths',
  coles: 'Coles',
  aldi: 'Aldi',
};
