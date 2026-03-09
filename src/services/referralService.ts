import { supabase } from '../lib/supabase';

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data } = await supabase
    .from('profiles')
    .select('referral_code, id')
    .eq('id', user.id)
    .single();
  const code = data?.referral_code ?? '';
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', user.id);
  return {
    code,
    share_url: `https://cheapcheap.com.au/invite/${code}`,
    referral_count: count ?? 0,
    rewards_earned: 0,
    pending_reward: 0,
  };
}

export async function applyReferralCode(code: string): Promise<{ success: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated' };
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code.toUpperCase())
    .single();
  if (!referrer) return { success: false, message: 'Invalid referral code.' };
  if (referrer.id === user.id) return { success: false, message: 'You cannot refer yourself.' };
  const { error } = await supabase
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', user.id)
    .is('referred_by', null);
  if (error) return { success: false, message: 'Code already applied.' };
  return { success: true, message: 'Referral code applied! You\'ll receive your reward shortly.' };
}

export async function getReferralRewards(): Promise<ReferralReward[]> {
  return [];
}

export function buildReferralShareMessage(code: string, shareUrl: string): string {
  return (
    `Join me on Cheap Cheap — Australia's smartest grocery & fuel savings app! 🐥\n\n` +
    `Use my referral code ${code} to get your first month Premium free.\n\n` +
    `Download: ${shareUrl}`
  );
}
