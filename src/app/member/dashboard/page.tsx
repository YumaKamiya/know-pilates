'use client';

import { useEffect, useState } from 'react';
import MemberLayout from '@/components/member/MemberLayout';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface MemberInfo {
  id: string;
  name: string;
  email: string;
  ticketBalance: number;
  currentPlan: {
    name: string;
    ticketsPerMonth: number;
  } | null;
  upcomingReservations: {
    id: string;
    startAt: string;
    endAt: string;
    status: string;
  }[];
}

export default function MemberDashboardPage() {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberInfo = async () => {
      const supabase = createClient();

      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ログイン情報が取得できません');
        setLoading(false);
        return;
      }

      // 会員情報を取得
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select(`
          id,
          name,
          email,
          member_plans(
            id,
            status,
            plans(name, tickets_per_month)
          )
        `)
        .eq('auth_user_id', user.id)
        .single();

      if (memberError || !memberData) {
        setError('会員情報の取得に失敗しました');
        setLoading(false);
        return;
      }

      const member = memberData as {
        id: string;
        name: string;
        email: string;
        member_plans: Array<{
          id: string;
          status: string;
          plans: { name: string; tickets_per_month: number } | null;
        }>;
      };

      // チケット残高を取得
      const { data: balanceData } = await supabase
        .from('member_ticket_balance')
        .select('balance')
        .eq('member_id', member.id)
        .single();

      const balance = balanceData as { balance: number } | null;

      // 今後の予約を取得
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select(`
          id,
          status,
          slots(start_at, end_at)
        `)
        .eq('member_id', member.id)
        .eq('status', 'confirmed')
        .gte('slots.start_at', new Date().toISOString())
        .order('slots(start_at)', { ascending: true })
        .limit(5);

      const reservations = reservationsData as Array<{
        id: string;
        status: string;
        slots: { start_at: string; end_at: string } | null;
      }> | null;

      const activePlan = member.member_plans?.find(
        (mp) => mp.status === 'active'
      );

      setMemberInfo({
        id: member.id,
        name: member.name,
        email: member.email,
        ticketBalance: balance?.balance || 0,
        currentPlan: activePlan?.plans ? {
          name: activePlan.plans.name,
          ticketsPerMonth: activePlan.plans.tickets_per_month,
        } : null,
        upcomingReservations: (reservations || [])
          .filter((r) => r.slots)
          .map((r) => ({
            id: r.id,
            startAt: r.slots!.start_at,
            endAt: r.slots!.end_at,
            status: r.status,
          })),
      });
      setLoading(false);
    };

    fetchMemberInfo();
  }, []);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          こんにちは、{memberInfo?.name}さん
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* チケット残高 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">チケット残高</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-primary">
                {memberInfo?.ticketBalance}
              </span>
              <span className="ml-2 text-gray-500">枚</span>
            </div>
            {memberInfo?.currentPlan && (
              <p className="mt-2 text-sm text-gray-600">
                {memberInfo.currentPlan.name}（月{memberInfo.currentPlan.ticketsPerMonth}枚）
              </p>
            )}
          </div>

          {/* 予約ボタン */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow p-6 text-white">
            <h2 className="text-sm font-medium text-white/80 mb-2">レッスンを予約</h2>
            <p className="text-sm text-white/70 mb-4">
              空いている日時を選んで予約できます
            </p>
            <Link
              href="/member/reservation"
              className="inline-block bg-white text-primary px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              予約する
            </Link>
          </div>
        </div>

        {/* 今後の予約 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">今後の予約</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {memberInfo?.upcomingReservations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                予約がありません
              </div>
            ) : (
              memberInfo?.upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">
                      {formatDateTime(reservation.startAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(reservation.startAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(reservation.endAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    予約済み
                  </span>
                </div>
              ))
            )}
          </div>
          {memberInfo && memberInfo.upcomingReservations.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                href="/member/reservations"
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                すべての予約を見る →
              </Link>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
