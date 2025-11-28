'use client';

import { useEffect, useState } from 'react';
import MemberLayout from '@/components/member/MemberLayout';
import MobileCalendar from '@/components/member/MobileCalendar';
import { createClient } from '@/lib/supabase/client';

interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
}

interface MemberInfo {
  id: string;
  ticketBalance: number;
  // 月プラン情報
  planType: 'monthly' | 'ticket' | 'none';
  planName?: string;
  currentMonthRemaining?: number;
  currentMonthReservations?: number;
  ticketsPerMonth?: number;
  nextMonthRemaining?: number;
}

export default function ReservationPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [confirmingSlot, setConfirmingSlot] = useState<Slot | null>(null);
  const [reserving, setReserving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // ユーザー情報取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 会員情報を取得
      const { data: memberData } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      const member = memberData as { id: string } | null;

      if (member) {
        // 予約可能状況を取得（月プラン残数 or 回数券残数）
        const { data: availabilityData } = await supabase
          .from('member_reservation_availability')
          .select('*')
          .eq('member_id', member.id)
          .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const availability = availabilityData as any;

        if (availability) {
          const planType = availability.plan_type || 'none';
          setMemberInfo({
            id: member.id,
            ticketBalance: availability.ticket_balance || 0,
            planType: planType as 'monthly' | 'ticket' | 'none',
            planName: availability.plan_name,
            currentMonthRemaining: availability.current_month_remaining,
            currentMonthReservations: availability.current_month_reservations,
            ticketsPerMonth: availability.tickets_per_month,
            nextMonthRemaining: availability.next_month_remaining,
          });
        } else {
          // ビューにデータがない場合（プランなし、回数券なし）
          setMemberInfo({
            id: member.id,
            ticketBalance: 0,
            planType: 'none',
          });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      const supabase = createClient();

      // 選択した週の開始日と終了日を計算
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const { data } = await supabase
        .from('slots')
        .select('*')
        .eq('status', 'available')
        .gte('start_at', startOfWeek.toISOString())
        .lt('start_at', endOfWeek.toISOString())
        .order('start_at', { ascending: true });

      setSlots(data || []);
    };

    fetchSlots();
  }, [selectedDate]);

  const handleReserve = async () => {
    if (!confirmingSlot || !memberInfo) return;

    setReserving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/member/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: confirmingSlot.id,
          memberId: memberInfo.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '予約に失敗しました');
      }

      setMessage({ type: 'success', text: '予約が完了しました' });
      setConfirmingSlot(null);

      // スロットを再取得
      const supabase = createClient();
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const { data: newSlots } = await supabase
        .from('slots')
        .select('*')
        .eq('status', 'available')
        .gte('start_at', startOfWeek.toISOString())
        .lt('start_at', endOfWeek.toISOString())
        .order('start_at', { ascending: true });

      setSlots(newSlots || []);

      // 予約可能状況を再取得
      const { data: availabilityData } = await supabase
        .from('member_reservation_availability')
        .select('*')
        .eq('member_id', memberInfo.id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const availability = availabilityData as any;

      if (availability) {
        const planType = availability.plan_type || 'none';
        setMemberInfo({
          ...memberInfo,
          ticketBalance: availability.ticket_balance || 0,
          planType: planType as 'monthly' | 'ticket' | 'none',
          planName: availability.plan_name,
          currentMonthRemaining: availability.current_month_remaining,
          currentMonthReservations: availability.current_month_reservations,
          ticketsPerMonth: availability.tickets_per_month,
          nextMonthRemaining: availability.next_month_remaining,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '予約に失敗しました',
      });
    } finally {
      setReserving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSlotsForDay = (date: Date) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.start_at);
      return (
        slotDate.getFullYear() === date.getFullYear() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getDate() === date.getDate()
      );
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
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

  return (
    <MemberLayout>
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">予約する</h1>
          <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm sm:text-base">
            {memberInfo?.planType === 'monthly' ? (
              <>
                今月の残り: <span className="font-bold">{memberInfo.currentMonthRemaining ?? 0}</span> / {memberInfo.ticketsPerMonth ?? 0}回
                {memberInfo.planName && <span className="ml-2 text-xs">({memberInfo.planName})</span>}
              </>
            ) : (
              <>
                チケット残高: <span className="font-bold">{memberInfo?.ticketBalance || 0}</span> 枚
              </>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* モバイル: 3日表示カレンダー */}
        <div className="block md:hidden">
          <MobileCalendar
            slots={slots}
            onSelectSlot={(slot) => setConfirmingSlot(slot)}
            onDateChange={(start) => {
              // MobileCalendarの日付変更に合わせてselectedDateを更新し、データ再取得をトリガー
              setSelectedDate(start);
            }}
            disabled={
              memberInfo?.planType === 'monthly'
                ? (memberInfo.currentMonthRemaining ?? 0) <= 0
                : (memberInfo?.ticketBalance || 0) <= 0
            }
          />
        </div>

        {/* デスクトップ: 既存の7列グリッド */}
        <div className="hidden md:block">
          {/* 週のナビゲーション */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow px-4 py-3">
            <button
              onClick={() => navigateWeek('prev')}
              className="px-4 py-2 min-h-[44px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              ← 前の週
            </button>
            <span className="text-lg font-medium text-gray-900">
              {formatDate(getWeekDays()[0])} - {formatDate(getWeekDays()[6])}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="px-4 py-2 min-h-[44px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              次の週 →
            </button>
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((day) => {
              const daySlots = getSlotsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white rounded-lg shadow min-h-[200px] ${
                    isPast ? 'opacity-50' : ''
                  }`}
                >
                  <div
                    className={`px-3 py-2 border-b text-center ${
                      isToday ? 'bg-primary-600 text-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs">
                      {day.toLocaleDateString('ja-JP', { weekday: 'short' })}
                    </div>
                    <div className="font-bold">{day.getDate()}</div>
                  </div>
                  <div className="p-2 space-y-1">
                    {daySlots.length === 0 ? (
                      <div className="text-center text-gray-400 text-xs py-4">
                        空き枠なし
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setConfirmingSlot(slot)}
                          disabled={
                            isPast ||
                            (memberInfo?.planType === 'monthly'
                              ? (memberInfo.currentMonthRemaining ?? 0) <= 0
                              : (memberInfo?.ticketBalance || 0) <= 0)
                          }
                          className="w-full px-2 py-2 min-h-[44px] text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {formatTime(slot.start_at)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 確認モーダル */}
        {confirmingSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">予約確認</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">日時</span>
                  <span className="font-medium text-right">
                    {new Date(confirmingSlot.start_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                    <br />
                    {formatTime(confirmingSlot.start_at)} - {formatTime(confirmingSlot.end_at)}
                  </span>
                </div>
                {memberInfo?.planType === 'monthly' ? (
                  <div className="flex justify-between">
                    <span className="text-gray-500">今月の残り</span>
                    <span className="font-medium">
                      {memberInfo.currentMonthRemaining ?? 0}回 → {(memberInfo.currentMonthRemaining ?? 0) - 1}回
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">消費チケット</span>
                      <span className="font-medium">1枚</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">残りチケット</span>
                      <span className="font-medium">
                        {memberInfo?.ticketBalance || 0} → {(memberInfo?.ticketBalance || 0) - 1}枚
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmingSlot(null)}
                  className="flex-1 px-4 py-3 min-h-[48px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="flex-1 px-4 py-3 min-h-[48px] bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {reserving ? '予約中...' : '予約する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
