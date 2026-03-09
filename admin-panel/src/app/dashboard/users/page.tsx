'use client';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

interface Profile {
  id: string;
  display_name: string;
  is_admin: boolean;
  is_premium: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (id: string, current: boolean) => {
    await supabaseAdmin.from('profiles').update({ is_admin: !current }).eq('id', id);
    load();
  };

  const togglePremium = async (id: string, current: boolean) => {
    await supabaseAdmin.from('profiles').update({ is_premium: !current, premium_expires_at: !current ? new Date(Date.now() + 30 * 86400000).toISOString() : null }).eq('id', id);
    load();
  };

  const filtered = users.filter(u => u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} total users</p>
        </div>
        <input
          placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{u.display_name || '(no name)'}</p>
                  <p className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}…</p>
                </td>
                <td className="px-5 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => toggleAdmin(u.id, u.is_admin)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${u.is_admin ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {u.is_admin ? 'Admin' : 'User'}
                  </button>
                </td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => togglePremium(u.id, u.is_premium)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${u.is_premium ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {u.is_premium ? '⭐ Premium' : 'Free'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
