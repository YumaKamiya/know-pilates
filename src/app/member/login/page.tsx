'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function MemberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('メールアドレスまたはパスワードをご確認ください');
      setLoading(false);
      return;
    }

    router.push('/member/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100/50 to-primary-200/30 px-4 py-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-gradient-to-br from-white via-primary-50/10 to-white rounded-3xl shadow-xl shadow-primary-200/20">
        <div>
          <h2 className="text-center text-xl sm:text-2xl font-bold text-neutral-900">
            おかえりなさい
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            いつもありがとうございます
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-gradient-to-br from-red-50/80 to-red-100/60 border border-red-200/50 text-red-600 px-5 py-4 rounded-2xl shadow-md shadow-red-100/30">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck="false"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 min-h-[48px] text-base border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 min-h-[48px] text-base border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center min-h-[48px] px-4 py-3 border border-transparent rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="text-center text-sm text-neutral-600">
            はじめての方は
            <Link
              href="/member/register"
              className="inline-flex items-center min-h-[44px] px-2 text-primary-600 hover:underline font-medium"
            >
              新規登録
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
