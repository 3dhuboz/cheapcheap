'use client';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

interface Station { id: string; name: string; brand: string; suburb: string; state: string; is_active: boolean; }
interface FuelPrice { station_id: string; fuel_type: string; price: number; }

const BRANDS = ['bp','shell','7eleven','caltex','ampol','metro','other'];
const FUEL_TYPES = ['ulp91','ulp95','ulp98','diesel','e10','lpg'];

export default function FuelPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', brand: 'bp', address: '', suburb: '', state: 'VIC', postcode: '', lat: '', lng: '' });
  const [priceForm, setPriceForm] = useState({ station_id: '', fuel_type: 'ulp91', price: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: p }] = await Promise.all([
      supabaseAdmin.from('fuel_stations').select('*').order('suburb').order('name'),
      supabaseAdmin.from('fuel_prices').select('*'),
    ]);
    setStations(s ?? []);
    setPrices(p ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabaseAdmin.from('fuel_stations').insert({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) });
    setShowForm(false);
    load();
    setSaving(false);
  };

  const savePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceForm.station_id || !priceForm.price) return;
    setSaving(true);
    await supabaseAdmin.from('fuel_prices').upsert({
      station_id: priceForm.station_id, fuel_type: priceForm.fuel_type,
      price: parseFloat(priceForm.price), reported_at: new Date().toISOString(),
    }, { onConflict: 'station_id,fuel_type' });
    setPriceForm({ station_id: '', fuel_type: 'ulp91', price: '' });
    load();
    setSaving(false);
  };

  const getPrice = (stationId: string, fuelType: string) =>
    prices.find(p => p.station_id === stationId && p.fuel_type === fuelType)?.price;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Stations</h1>
          <p className="text-gray-500 text-sm mt-0.5">{stations.length} stations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition">
          + Add Station
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveStation} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 font-semibold text-gray-900">New Fuel Station</h2>
          {[['name','Station Name','e.g. BP Melbourne Central'],['address','Address',''],['suburb','Suburb',''],['postcode','Postcode',''],['lat','Latitude (required)',''],['lng','Longitude (required)','']].map(([f,l,p]) => (
            <div key={f}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
              <input value={(form as any)[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                placeholder={p} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
            <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
              {BRANDS.map(b => <option key={b}>{b}</option>)}
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
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Save Station'}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Update Fuel Price</h2>
        <form onSubmit={savePrice} className="flex gap-3 flex-wrap">
          <select value={priceForm.station_id} onChange={e => setPriceForm(f => ({ ...f, station_id: e.target.value }))} required
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
            <option value="">Select station…</option>
            {stations.map(s => <option key={s.id} value={s.id}>{s.name} — {s.suburb}</option>)}
          </select>
          <select value={priceForm.fuel_type} onChange={e => setPriceForm(f => ({ ...f, fuel_type: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
            {FUEL_TYPES.map(ft => <option key={ft}>{ft}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Price (¢/L)" value={priceForm.price} onChange={e => setPriceForm(f => ({ ...f, price: e.target.value }))} required
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">Update</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Station</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
              {FUEL_TYPES.map(ft => <th key={ft} className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">{ft}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : stations.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">No fuel stations yet.</td></tr>
            ) : stations.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3"><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.brand}</p></td>
                <td className="px-5 py-3 text-gray-500">{[s.suburb, s.state].filter(Boolean).join(', ')}</td>
                {FUEL_TYPES.map(ft => {
                  const p = getPrice(s.id, ft);
                  return <td key={ft} className="px-3 py-3 text-center text-xs font-mono">{p ? `${p}¢` : '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
