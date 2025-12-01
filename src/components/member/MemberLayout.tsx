'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MemberSidebar from './MemberSidebar';
import BottomNav from '@/components/shared/BottomNav';
import { createClient } from '@/lib/supabase/client';
import { Home, Calendar, ClipboardList, MoreVertical, LogOut } from 'lucide-react';

const navigation = [
  { name: 'ホーム', href: '/member/dashboard', icon: Home },
  { name: '予約', href: '/member/reservation', icon: Calendar },
  { name: '履歴', href: '/member/reservations', icon: ClipboardList },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/member/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-primary-50/10">
      {/* デスクトップ: サイドバー表示 */}
      <div className="hidden md:flex">
        <MemberSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* モバイル: 固定ヘッダー + ボトムナビ */}
      <div className="md:hidden">
        {/* 固定ヘッダー */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-primary-600 flex items-center justify-between px-4 z-40 safe-area-pt">
          <Link href="/member/dashboard" className="text-white font-bold text-lg">
            know
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="メニュー"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </header>

        {/* ドロップダウンメニュー（ログアウト用） */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-14 right-4 bg-gradient-to-br from-white to-primary-50/5 rounded-2xl shadow-xl shadow-primary-100/20 z-50 py-2 min-w-[160px]">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-neutral-700 hover:bg-primary-50/50 active:scale-95 transition-all duration-300 min-h-[44px] rounded-xl mx-1"
              >
                <LogOut className="mr-3 w-5 h-5" />
                ログアウトする
              </button>
            </div>
          </>
        )}

        {/* メインコンテンツ */}
        <main className="pt-20 pb-24 px-4">{children}</main>

        {/* ボトムナビゲーション */}
        <BottomNav items={navigation} activeColor="text-primary-600" />
      </div>
    </div>
  );
}
