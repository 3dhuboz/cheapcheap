'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Stats { users: number; lists: number; products: number; stores: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, lists: 0, products: 0, stores: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('grocery_lists').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('stores').select('id', { count: 'exact', head: true }),
    ]).then(([u, l, p, s]) => {
      setStats({ users: u.count ?? 0, lists: l.count ?? 0, products: p.count ?? 0, stores: s.count ?? 0 });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.users, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Grocery Lists', value: stats.lists, icon: '🛒', color: 'bg-green-50 text-green-600' },
    { label: 'Products', value: stats.products, icon: '📦', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Stores', value: stats.stores, icon: '🏪', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Welcome back, Admin</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/dashboard/products', label: 'Add Product', icon: '➕' },
            { href: '/dashboard/stores', label: 'Add Store', icon: '🏪' },
            { href: '/dashboard/fuel', label: 'Update Fuel Prices', icon: '⛽' },
            { href: '/dashboard/users', label: 'Manage Users', icon: '👥' },
            { href: '/dashboard/settings', label: 'App Settings', icon: '⚙️' },
          ].map(({ href, label, icon }) => (
            <a key={href} href={href} className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition">
              <span>{icon}</span>{label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
