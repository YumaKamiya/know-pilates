'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function InvitationRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('招待トークンが見つかりません');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/invitation/${token}`);
        const data = await res.json();

        if (data.valid) {
          setEmail(data.email);
          setTokenValid(true);
        } else {
          setError(data.error || '無効な招待リンクです');
          setExpired(data.expired || false);
        }
      } catch {
        setError('トークンの検証に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

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

    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/invitation/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, agreedToTerms }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登録に失敗しました');
        setSubmitting(false);
        return;
      }

      router.push('/member/register/complete');
    } catch {
      setError('通信エラーが発生しました');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-500 shadow-lg mx-auto"></div>
          <p className="mt-4 text-neutral-600">少々お待ちください...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <div className="max-w-md w-full space-y-8 p-10 bg-gradient-to-br from-white via-primary-50/10 to-white rounded-3xl shadow-xl shadow-primary-200/20 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg shadow-red-100/30">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900">
            {expired ? 'ご招待の期限が切れています' : 'ご招待リンクを確認できませんでした'}
          </h2>
          <p className="text-neutral-600">{error}</p>
          {expired && (
            <p className="text-sm text-neutral-500">
              お手数ですが、スタジオへお問い合わせください。新しいご招待をお送りします。
            </p>
          )}
          <Link
            href="/member/login"
            className="inline-block mt-4 text-primary-600 hover:underline"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-gradient-to-br from-white via-primary-50/10 to-white rounded-3xl shadow-xl shadow-primary-200/20">
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
            <div className="bg-gradient-to-br from-red-50/80 to-red-100/60 border border-red-200/50 text-red-600 px-5 py-4 rounded-2xl shadow-md shadow-red-100/30 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                メールアドレス
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                disabled
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-primary-100/50 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 text-neutral-500"
              />
              <p className="mt-1 text-xs text-neutral-500">ご登録いただくメールアドレスです</p>
            </div>

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
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
                placeholder="山田 花子"
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
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
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
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
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
                className="h-5 w-5 text-primary-600 focus:ring-2 focus:ring-primary-400 border-primary-200 rounded mt-1"
              />
              <label htmlFor="agreedToTerms" className="ml-2 block text-sm text-neutral-700">
                <span className="text-primary-600 hover:underline cursor-pointer">利用規約</span>
                に同意します <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center min-h-[48px] px-4 py-3 border border-transparent rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '登録中...' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InvitationRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-500 shadow-lg mx-auto"></div>
            <p className="mt-4 text-neutral-600">準備中...</p>
          </div>
        </div>
      }
    >
      <InvitationRegisterContent />
    </Suspense>
  );
}
