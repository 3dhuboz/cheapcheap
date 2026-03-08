import { apiGet, apiPost } from '../lib/api';

export interface ReferralStatus {
  code: string;
  share_url: string;
  referral_count: number;
  rewards_earned: number;
  pending_reward: number;
}

export interface ReferralReward {
  id: string;
  type: 'premium_days' | 'credit';
  value: number;
  earned_at: string;
  redeemed_at: string | null;
}

export async function getReferralStatus(): Promise<ReferralStatus> {
  return apiGet<ReferralStatus>('/referrals/status');
}

export async function applyReferralCode(code: string): Promise<{ success: boolean; message: string }> {
  return apiPost('/referrals/apply', { code });
}

export async function getReferralRewards(): Promise<ReferralReward[]> {
  return apiGet<ReferralReward[]>('/referrals/rewards');
}

export function buildReferralShareMessage(code: string, shareUrl: string): string {
  return (
    `Join me on Cheap Cheap — Australia's smartest grocery & fuel savings app! 🐥\n\n` +
    `Use my referral code ${code} to get your first month Premium free.\n\n` +
    `Download: ${shareUrl}`
  );
}
