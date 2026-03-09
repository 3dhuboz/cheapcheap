import { supabase } from '../lib/supabase';
import { User } from '../types';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
  if (error) throw error;
  return data;
}

export async function sendOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data;
}

export async function getProfile(): Promise<User> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
  if (error) throw error;
  return {
    id: data.id,
    auth_id: data.id,
    email: authUser.email ?? '',
    display_name: data.display_name,
    avatar_url: data.avatar_url,
    subscription_tier: data.is_premium ? 'premium' : 'free',
    subscription_expires_at: data.premium_expires_at,
    default_lat: null,
    default_lng: null,
    search_radius_km: 10,
    preferred_stores: [],
    push_enabled: data.notifications_enabled ?? true,
    created_at: data.created_at,
  };
}

export async function updateProfile(patch: Partial<User>): Promise<User> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');
  const update: Record<string, unknown> = {};
  if (patch.display_name !== undefined) update.display_name = patch.display_name;
  if (patch.avatar_url !== undefined) update.avatar_url = patch.avatar_url;
  if (patch.push_enabled !== undefined) update.notifications_enabled = patch.push_enabled;
  const { error } = await supabase.from('profiles').update(update).eq('id', authUser.id);
  if (error) throw error;
  return getProfile();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}
