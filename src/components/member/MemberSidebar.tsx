'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Home, Calendar, ClipboardList, LogOut } from 'lucide-react';

const navigation = [
  { name: 'マイページ', href: '/member/dashboard', icon: Home },
  { name: '予約する', href: '/member/reservation', icon: Calendar },
  { name: '予約履歴', href: '/member/reservations', icon: ClipboardList },
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
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl active:scale-95 transition-all duration-300 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-white/80 rounded-xl hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-300"
        >
          <LogOut className="mr-3 w-5 h-5" />
          ログアウトする
        </button>
      </div>
    </div>
  );
}
