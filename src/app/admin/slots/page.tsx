'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import MobileSlotCalendar from '@/components/admin/MobileSlotCalendar';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  google_calendar_event_id: string | null;
  reservations: Array<{
    id: string;
    type: string;
    status: string;
    member_id: string | null;
    guest_name: string | null;
  }>;
}

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
  });
  const [creating, setCreating] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    const startDate = format(currentWeek, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeek, 7), 'yyyy-MM-dd');

    try {
      const res = await fetch(`/api/admin/slots?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      setSlots(data);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [currentWeek]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const startAt = `${createForm.date}T${createForm.startTime}:00+09:00`;
    const endAt = `${createForm.date}T${createForm.endTime}:00+09:00`;

    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_at: startAt, end_at: endAt }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchSlots();
      } else {
        const error = await res.json();
        alert(error.error || '作成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create slot:', error);
      alert('作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('この予約枠を削除しますか？')) return;

    try {
      const res = await fetch(`/api/admin/slots?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSlots();
      } else {
        const error = await res.json();
        alert(error.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete slot:', error);
      alert('削除に失敗しました');
    }
  };

  // 週の日付を生成
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // 時間帯ごとにスロットをグループ化
  const getSlotForDateTime = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slots.filter((slot) => {
      const slotDate = format(new Date(slot.start_at), 'yyyy-MM-dd');
      const slotHour = new Date(slot.start_at).getHours();
      return slotDate === dateStr && slotHour === hour;
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9:00 - 20:00

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">予約枠管理</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors font-medium"
          >
            + 予約枠を作成
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-neutral-500">
            読み込み中...
          </div>
        ) : (
          <>
            {/* モバイル: 3日表示カレンダー */}
            <div className="block md:hidden">
              <MobileSlotCalendar slots={slots} onDeleteSlot={handleDeleteSlot} />
            </div>

            {/* デスクトップ: 既存の週間表示 */}
            <div className="hidden md:block space-y-4">
              {/* 週ナビゲーション */}
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <button
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                  className="px-4 py-2 min-h-[44px] text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  ← 前週
                </button>
                <span className="font-medium">
                  {format(currentWeek, 'yyyy年M月d日', { locale: ja })} -{' '}
                  {format(addDays(currentWeek, 6), 'M月d日', { locale: ja })}
                </span>
                <button
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                  className="px-4 py-2 min-h-[44px] text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  次週 →
                </button>
              </div>

              {/* カレンダーグリッド */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="w-16 p-2 text-xs font-medium text-neutral-500 border-b">時間</th>
                        {weekDays.map((day) => (
                          <th key={day.toISOString()} className="p-2 text-xs font-medium text-neutral-500 border-b min-w-[120px]">
                            <div>{format(day, 'E', { locale: ja })}</div>
                            <div className="text-lg font-bold text-neutral-900">{format(day, 'd')}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map((hour) => (
                        <tr key={hour} className="border-b">
                          <td className="p-2 text-xs text-neutral-500 text-center border-r">
                            {hour}:00
                          </td>
                          {weekDays.map((day) => {
                            const daySlots = getSlotForDateTime(day, hour);
                            return (
                              <td key={day.toISOString()} className="p-1 border-r min-h-[60px] align-top">
                                {daySlots.map((slot) => {
                                  const hasReservation = slot.reservations && slot.reservations.length > 0;
                                  const reservation = hasReservation ? slot.reservations[0] : null;
                                  return (
                                    <div
                                      key={slot.id}
                                      className={`p-2 rounded text-xs mb-1 ${
                                        hasReservation
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}
                                    >
                                      <div className="font-medium">
                                        {format(new Date(slot.start_at), 'HH:mm')} -{' '}
                                        {format(new Date(slot.end_at), 'HH:mm')}
                                      </div>
                                      <div className="mt-1">
                                        {hasReservation ? (
                                          <span>
                                            {reservation?.type === 'trial' ? '体験' : '会員'}予約
                                          </span>
                                        ) : (
                                          <span>空き</span>
                                        )}
                                      </div>
                                      {!hasReservation && (
                                        <button
                                          onClick={() => handleDeleteSlot(slot.id)}
                                          className="mt-1 min-h-[32px] text-red-600 hover:text-red-800 font-medium"
                                        >
                                          削除
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 作成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">予約枠を作成</h2>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">日付</label>
                  <input
                    type="date"
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">開始時刻</label>
                    <input
                      type="time"
                      value={createForm.startTime}
                      onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                      className="block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">終了時刻</label>
                    <input
                      type="time"
                      value={createForm.endTime}
                      onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                      className="block w-full px-4 py-3 min-h-[48px] text-base border border-neutral-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 min-h-[48px] text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 rounded-lg font-medium transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-3 min-h-[48px] bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 font-medium transition-colors"
                  >
                    {creating ? '作成中...' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
