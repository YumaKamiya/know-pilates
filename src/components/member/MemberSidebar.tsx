'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'マイページ', href: '/member/dashboard', icon: '🏠' },
  { name: '予約する', href: '/member/reservation', icon: '📅' },
  { name: '予約履歴', href: '/member/reservations', icon: '📋' },
];

export default function MemberSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/member/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col w-64 bg-primary min-h-screen">
      <div className="flex items-center justify-center h-16 bg-primary/90">
        <span className="text-white font-bold text-lg">know 会員ページ</span>
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
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-white/80 rounded-md hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="mr-3">🚪</span>
          ログアウトする
        </button>
      </div>
    </div>
  );
}
