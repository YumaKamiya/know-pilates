'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MemberSidebar from './MemberSidebar';
import BottomNav from '@/components/shared/BottomNav';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'ホーム', href: '/member/dashboard', icon: '🏠' },
  { name: '予約', href: '/member/reservation', icon: '📅' },
  { name: '履歴', href: '/member/reservations', icon: '📋' },
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
    <div className="min-h-screen bg-neutral-50">
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
            <span className="text-xl">⋮</span>
          </button>
        </header>

        {/* ドロップダウンメニュー（ログアウト用） */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-14 right-4 bg-white rounded-lg shadow-lg z-50 py-2 min-w-[160px]">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-neutral-700 hover:bg-neutral-100 min-h-[44px]"
              >
                <span className="mr-3">🚪</span>
                ログアウトする
              </button>
            </div>
          </>
        )}

        {/* メインコンテンツ */}
        <main className="pt-14 pb-20 px-4">{children}</main>

        {/* ボトムナビゲーション */}
        <BottomNav items={navigation} activeColor="text-primary-600" />
      </div>
    </div>
  );
}
