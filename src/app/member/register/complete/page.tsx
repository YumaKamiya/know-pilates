'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterCompletePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // カウントダウンが0になったら遷移
  useEffect(() => {
    if (countdown === 0) {
      router.push('/member/login');
    }
  }, [countdown, router]);

  // 1秒ごとにカウントダウン
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-10 bg-gradient-to-br from-white via-primary-50/10 to-white rounded-3xl shadow-xl shadow-primary-200/20 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 shadow-lg shadow-green-100/30">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">
            ご登録ありがとうございます
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            登録手続きが完了しました
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50/60 to-amber-100/40 border border-amber-200/50 rounded-2xl p-5 shadow-sm shadow-amber-100/20 text-left">
          <h3 className="text-sm font-medium text-amber-800">レッスンご予約の前に</h3>
          <p className="mt-1 text-sm text-amber-700">
            レッスンのご予約には、プランまたはチケットのご購入が必要です。
            ご不明な点はお気軽にスタジオまでお問い合わせください。
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-neutral-500">
            あと{countdown}秒でログインページへ移動します...
          </p>
          <Link
            href="/member/login"
            className="w-full flex justify-center items-center min-h-[48px] px-4 py-3 border border-transparent rounded-xl shadow-md bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 transition-all duration-300"
          >
            すぐにログインする
          </Link>
        </div>
      </div>
    </div>
  );
}
