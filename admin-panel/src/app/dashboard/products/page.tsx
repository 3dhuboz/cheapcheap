'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

interface Product { id: string; name: string; brand: string; category: string; unit: string; barcode: string; is_active: boolean; }

const CATEGORIES = ['dairy','meat','fruit_veg','bakery','pantry','drinks','snacks','household','other'];
const UNITS = ['ea','kg','g','L','ml','pack'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', brand: '', barcode: '', category: 'pantry', unit: 'ea', unit_size: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('products').select('*').order('name').limit(200);
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabaseAdmin.from('products').insert({ ...form, unit_size: parseFloat(form.unit_size) || null });
    setShowForm(false);
    setForm({ name: '', brand: '', barcode: '', category: 'pantry', unit: 'ea', unit_size: '' });
    load();
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabaseAdmin.from('products').update({ is_active: !current }).eq('id', id);
    load();
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-brand" />
          <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition">
            + Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 font-semibold text-gray-900">New Product</h2>
          {[['name','Product Name','e.g. Full Cream Milk 2L'],['brand','Brand','e.g. Dairy Farmers'],['barcode','Barcode',''],['unit_size','Unit Size','e.g. 2']].map(([f,l,p]) => (
            <div key={f}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
              <input value={(form as any)[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                placeholder={p} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Barcode</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No products found.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                </td>
                <td className="px-5 py-3 text-gray-500 capitalize">{p.category?.replace('_',' ') || '—'}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{p.barcode || '—'}</td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => toggleActive(p.id, p.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Active' : 'Hidden'}
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
