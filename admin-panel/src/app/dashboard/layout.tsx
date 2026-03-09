'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/stores', label: 'Stores', icon: '🏪' },
  { href: '/dashboard/products', label: 'Products', icon: '🛒' },
  { href: '/dashboard/fuel', label: 'Fuel Stations', icon: '⛽' },
  { href: '/dashboard/settings', label: 'App Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setUserEmail(session.user.email ?? '');
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐥</span>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">Cheap Cheap</p>
              <p className="text-xs text-brand font-medium mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {nav.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span>{icon}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
          <button onClick={handleSignOut} className="w-full text-xs text-red-500 hover:text-red-700 font-medium text-left">Sign out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
