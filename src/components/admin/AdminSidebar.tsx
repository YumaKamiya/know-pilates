'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BarChart3, Calendar, ClipboardList, Users, CreditCard, LogOut } from 'lucide-react';

const navigation = [
  { name: 'ダッシュボード', href: '/admin/dashboard', icon: BarChart3 },
  { name: '予約枠管理', href: '/admin/slots', icon: Calendar },
  { name: '予約一覧', href: '/admin/reservations', icon: ClipboardList },
  { name: '会員管理', href: '/admin/members', icon: Users },
  { name: 'プラン管理', href: '/admin/plans', icon: CreditCard },
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
              <item.icon className="mr-3 w-5 h-5" />
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
          <LogOut className="mr-3 w-5 h-5" />
          ログアウト
        </button>
      </div>
    </div>
  );
}
