import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export async function initRevenueCat(platform: 'ios' | 'android') {
  const apiKey = platform === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  if (!apiKey) return;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  await Purchases.configure({ apiKey });
}

export async function identifyUser(userId: string) {
  await Purchases.logIn(userId);
}

export async function resetUser() {
  await Purchases.logOut();
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function isPremium(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
}
