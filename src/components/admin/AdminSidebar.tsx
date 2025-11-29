'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'ダッシュボード', href: '/admin/dashboard', icon: '📊' },
  { name: '予約枠管理', href: '/admin/slots', icon: '📅' },
  { name: '予約一覧', href: '/admin/reservations', icon: '📋' },
  { name: '会員管理', href: '/admin/members', icon: '👥' },
  { name: 'プラン管理', href: '/admin/plans', icon: '💳' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col w-64 bg-primary-950 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-primary-900">
        <span className="text-white font-bold text-lg">know 管理画面</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-900 text-white'
                  : 'text-neutral-400 hover:bg-primary-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-4 border-t border-neutral-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-neutral-400 rounded-md hover:bg-primary-800 hover:text-white transition-colors"
        >
          <span className="mr-3">🚪</span>
          ログアウト
        </button>
      </div>
    </div>
  );
}
