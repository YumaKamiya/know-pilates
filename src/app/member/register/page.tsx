'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MemberRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('パスワードの入力内容が異なっています');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上でお願いします');
      return;
    }

    if (!agreedToTerms) {
      setError('利用規約のご確認をお願いします');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, agreedToTerms }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登録に失敗しました');
        setLoading(false);
        return;
      }

      router.push('/member/register/complete');
    } catch {
      setError('通信エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-2xl font-bold text-neutral-900">
            ようこそ
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            新しい一歩を踏み出しましょう
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="山田 花子"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                パスワード <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="8文字以上"
              />
              <p className="mt-1 text-xs text-neutral-500">8文字以上でお願いします</p>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-neutral-700">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="パスワードを再入力"
              />
            </div>

            <div className="flex items-start">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded mt-1"
              />
              <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-neutral-700">
                <span className="text-primary hover:underline cursor-pointer">利用規約</span>
                に同意します <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center min-h-[48px] px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登録中...' : '登録する'}
          </button>

          <div className="text-center text-sm text-neutral-600">
            アカウントをお持ちの方は
            <Link href="/member/login" className="text-primary hover:underline ml-1">
              ログイン
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
