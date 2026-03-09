'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

interface Store { id: string; name: string; chain: string; suburb: string; state: string; is_active: boolean; }

const CHAINS = ['woolworths', 'coles', 'aldi', 'iga', 'other'];

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', chain: 'woolworths', address: '', suburb: '', state: 'VIC', postcode: '', lat: '', lng: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('stores').select('*').order('chain').order('name');
    setStores(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabaseAdmin.from('stores').insert({ ...form, lat: parseFloat(form.lat) || null, lng: parseFloat(form.lng) || null });
    setShowForm(false);
    setForm({ name: '', chain: 'woolworths', address: '', suburb: '', state: 'VIC', postcode: '', lat: '', lng: '' });
    load();
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabaseAdmin.from('stores').update({ is_active: !current }).eq('id', id);
    load();
  };

  const chainColors: Record<string, string> = {
    woolworths: 'bg-green-100 text-green-700', coles: 'bg-red-100 text-red-700',
    aldi: 'bg-blue-100 text-blue-700', iga: 'bg-orange-100 text-orange-700', other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stores.length} stores</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition">
          + Add Store
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 font-semibold text-gray-900">New Store</h2>
          {[['name', 'Store Name', 'e.g. Woolworths Melbourne Central'], ['address', 'Address', ''], ['suburb', 'Suburb', ''], ['postcode', 'Postcode', ''], ['lat', 'Latitude', ''], ['lng', 'Longitude', '']].map(([field, label, ph]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={ph} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chain</label>
            <select value={form.chain} onChange={e => setForm(f => ({ ...f, chain: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              {CHAINS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
            <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              {['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Save Store'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Chain</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No stores yet. Add your first store.</td></tr>
            ) : stores.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${chainColors[s.chain] ?? chainColors.other}`}>{s.chain}</span></td>
                <td className="px-5 py-3 text-gray-500">{[s.suburb, s.state].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => toggleActive(s.id, s.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
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
