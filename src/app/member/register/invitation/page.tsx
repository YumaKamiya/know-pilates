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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">少々お待ちください...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
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
            className="inline-block mt-4 text-primary hover:underline"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

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
              <label className="block text-sm font-medium text-neutral-700">
                メールアドレス
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                disabled
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
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
                className="mt-1 block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
            disabled={submitting}
            className="w-full flex justify-center items-center min-h-[48px] px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral-600">準備中...</p>
          </div>
        </div>
      }
    >
      <InvitationRegisterContent />
    </Suspense>
  );
}
