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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 日付ナビゲーション */}
      <div className="flex items-center justify-between px-2 py-3 bg-neutral-50 border-b">
        <button
          onClick={() => navigateDays('prev')}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
          aria-label="前の3日間"
        >
          <span className="text-neutral-600 text-lg">←</span>
        </button>
        <span className="font-medium text-neutral-900 text-base">
          {formatDateRange()}
        </span>
        <button
          onClick={() => navigateDays('next')}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
          aria-label="次の3日間"
        >
          <span className="text-neutral-600 text-lg">→</span>
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr>
              <th className="w-14 p-2 text-xs text-neutral-500 border-b bg-white sticky left-0 z-10">
                時間
              </th>
              {visibleDays.map((day) => (
                <th key={day.toISOString()} className="p-2 border-b border-l min-w-[90px]">
                  <div className="text-xs text-neutral-500">
                    {format(day, 'E', { locale: ja })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday(day) ? 'text-primary-600' : 'text-neutral-900'
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
                <td className="p-2 text-xs text-neutral-500 text-center border-r bg-white sticky left-0 z-10">
                  {hour}:00
                </td>
                {visibleDays.map((day) => {
                  const daySlots = getSlotsForDateTime(day, hour);

                  return (
                    <td key={day.toISOString()} className="p-1 border-r border-b align-top">
                      {daySlots.length > 0 ? (
                        daySlots.map((slot) => {
                          const hasReservation = slot.reservations && slot.reservations.length > 0;
                          const reservation = hasReservation ? slot.reservations[0] : null;

                          return (
                            <div
                              key={slot.id}
                              className={`p-2 rounded-lg text-xs mb-1 ${
                                hasReservation
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              <div className="font-medium">
                                {format(new Date(slot.start_at), 'HH:mm')}
                              </div>
                              <div className="mt-1">
                                {hasReservation ? (
                                  <span className="text-xs">
                                    {reservation?.type === 'trial' ? '体験' : '会員'}
                                  </span>
                                ) : (
                                  <span className="text-xs">空き</span>
                                )}
                              </div>
                              {!hasReservation && (
                                <button
                                  onClick={() => onDeleteSlot(slot.id)}
                                  className="mt-1 min-h-[32px] w-full text-red-600 hover:text-red-800 active:bg-red-50 rounded text-xs font-medium"
                                >
                                  削除
                                </button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="min-h-[44px] flex items-center justify-center text-neutral-300 text-xs">
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
