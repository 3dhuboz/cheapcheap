'use client';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

interface Setting { key: string; value: string; description: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('app_settings').select('*').order('key');
    const s = (data ?? []).map(r => ({ key: r.key, value: JSON.stringify(r.value).replace(/^"|"$/g, ''), description: r.description }));
    setSettings(s);
    const e: Record<string, string> = {};
    s.forEach(r => { e[r.key] = r.value; });
    setEdits(e);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    setSaving(key);
    let val: any = edits[key];
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (!isNaN(Number(val)) && val !== '') val = Number(val);
    await supabaseAdmin.from('app_settings').update({ value: val, updated_at: new Date().toISOString() }).eq('key', key);
    setSaving(null);
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">App Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Control app behaviour without redeploying</p>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {settings.map(s => (
            <div key={s.key} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 font-mono text-sm">{s.key}</p>
                {s.description && <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                {(s.key === 'maintenance_mode') ? (
                  <select value={edits[s.key]} onChange={e => setEdits(prev => ({ ...prev, [s.key]: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="true">On</option>
                    <option value="false">Off</option>
                  </select>
                ) : (
                  <input value={edits[s.key] ?? ''} onChange={e => setEdits(prev => ({ ...prev, [s.key]: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 text-center focus:outline-none focus:ring-2 focus:ring-brand" />
                )}
                <button onClick={() => save(s.key)} disabled={saving === s.key}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark disabled:opacity-60 transition">
                  {saving === s.key ? '…' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
