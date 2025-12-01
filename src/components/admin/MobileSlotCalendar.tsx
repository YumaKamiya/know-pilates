'use client';

import { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  reservations: Array<{
    id: string;
    type: string;
    status: string;
  }>;
}

interface MobileSlotCalendarProps {
  slots: Slot[];
  onDeleteSlot: (id: string) => void;
}

// 時間帯定義（9:00-20:00）
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i + 9);

export default function MobileSlotCalendar({ slots, onDeleteSlot }: MobileSlotCalendarProps) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // 3日分の日付
  const visibleDays = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      return day;
    });
  }, [startDate]);

  const navigateDays = (direction: 'prev' | 'next') => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 3 : -3));
    setStartDate(newDate);
  };

  const getSlotsForDateTime = (date: Date, hour: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slots.filter((slot) => {
      const slotDate = format(new Date(slot.start_at), 'yyyy-MM-dd');
      const slotHour = new Date(slot.start_at).getHours();
      return slotDate === dateStr && slotHour === hour;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const formatDateRange = () => {
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    return `${format(first, 'M/d')} - ${format(last, 'M/d')}`;
  };

  return (
    <div className="bg-gradient-to-br from-white via-primary-50/20 to-white rounded-3xl shadow-xl shadow-primary-200/20 overflow-hidden">
      {/* 日付ナビゲーション */}
      <div className="flex items-center justify-between px-4 py-5 bg-gradient-to-r from-primary-50/30 via-white to-primary-50/30 border-b border-primary-100/50">
        <button
          onClick={() => navigateDays('prev')}
          className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-primary-100/50 active:bg-primary-200/50 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="前の3日間"
        >
          <span className="text-neutral-600 text-lg">←</span>
        </button>
        <div className="px-6 py-2.5 bg-gradient-to-r from-primary-50/20 via-primary-50/10 to-primary-50/20 rounded-full border border-primary-100/30">
          <span className="font-medium text-neutral-900 text-base">
            {formatDateRange()}
          </span>
        </div>
        <button
          onClick={() => navigateDays('next')}
          className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-primary-100/50 active:bg-primary-200/50 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="次の3日間"
        >
          <span className="text-neutral-600 text-lg">→</span>
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full min-w-[300px]">
          <thead className="sticky top-0 z-20 bg-gradient-to-r from-primary-50/30 via-white to-primary-50/30 backdrop-blur-sm">
            <tr>
              <th className="w-14 p-3 text-xs text-neutral-600 font-semibold bg-gradient-to-r from-primary-50/30 via-white to-primary-50/30 sticky left-0 z-30 border-b border-primary-100/50">
                時間
              </th>
              {visibleDays.map((day) => (
                <th key={day.toISOString()} className={`p-3 border-b border-l border-primary-100/50 min-w-[80px] ${
                  isToday(day)
                    ? 'bg-primary-600'
                    : 'bg-primary-100'
                }`}>
                  <div className={`text-xs font-medium ${
                    isToday(day) ? 'text-white' : 'text-neutral-500'
                  }`}>
                    {format(day, 'E', { locale: ja })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday(day) ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((hour) => (
              <tr key={hour}>
                <td className="p-2 text-xs text-neutral-500 text-center border-r border-primary-100/30 bg-white sticky left-0 z-10">
                  {hour}:00
                </td>
                {visibleDays.map((day) => {
                  const daySlots = getSlotsForDateTime(day, hour);

                  return (
                    <td key={day.toISOString()} className="p-2 border-r border-b border-primary-100/30 align-top">
                      {daySlots.length > 0 ? (
                        daySlots.map((slot) => {
                          const hasReservation = slot.reservations && slot.reservations.length > 0;
                          const reservation = hasReservation ? slot.reservations[0] : null;

                          return (
                            <div
                              key={slot.id}
                              className={`p-3 rounded-xl text-xs mb-1 shadow-sm ${
                                hasReservation
                                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 text-primary-700 border border-primary-200'
                              }`}
                            >
                              <div className="font-medium">
                                {format(new Date(slot.start_at), 'HH:mm')}
                              </div>
                              <div className="mt-1">
                                {hasReservation ? (
                                  <span className="text-xs font-medium">
                                    {reservation?.type === 'trial' ? '体験' : '会員'}
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium">空き</span>
                                )}
                              </div>
                              {!hasReservation && (
                                <button
                                  onClick={() => onDeleteSlot(slot.id)}
                                  className="mt-2 min-h-[36px] w-full bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 active:scale-95 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm"
                                >
                                  削除
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="min-h-[48px] flex items-center justify-center text-neutral-500/50 text-xs">
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
