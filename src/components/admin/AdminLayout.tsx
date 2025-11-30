'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import BottomNav from '@/components/shared/BottomNav';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'ホーム', href: '/admin/dashboard', icon: '📊' },
  { name: '予約枠', href: '/admin/slots', icon: '📅' },
  { name: '会員', href: '/admin/members', icon: '👥' },
  { name: 'プラン', href: '/admin/plans', icon: '💳' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* デスクトップ: サイドバー表示 */}
      <div className="hidden md:flex">
        <AdminSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* モバイル: 固定ヘッダー + ボトムナビ */}
      <div className="md:hidden">
        {/* 固定ヘッダー */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-primary-950 flex items-center justify-between px-4 z-40 safe-area-pt">
          <Link href="/admin/dashboard" className="text-white font-bold text-lg">
            know 管理
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="メニュー"
          >
            <span className="text-xl">⋮</span>
          </button>
        </header>

        {/* ドロップダウンメニュー */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-14 right-4 bg-white rounded-lg shadow-lg z-50 py-2 min-w-[160px]">
              <Link
                href="/admin/reservations"
                className="flex items-center w-full px-4 py-3 text-neutral-700 hover:bg-neutral-100 min-h-[44px]"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">📋</span>
                予約一覧
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-3 text-neutral-700 hover:bg-neutral-100 min-h-[44px]"
              >
                <span className="mr-3">🚪</span>
                ログアウト
              </button>
            </div>
          </>
        )}

        {/* メインコンテンツ */}
        <main className="pt-14 pb-24 px-4">{children}</main>

        {/* ボトムナビゲーション */}
        <BottomNav items={navigation} activeColor="text-neutral-900" />
      </div>
    </div>
  );
}
