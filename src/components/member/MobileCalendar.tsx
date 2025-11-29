'use client';

import { useState, useMemo } from 'react';

interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
}

interface MobileCalendarProps {
  slots: Slot[];
  onSelectSlot: (slot: Slot) => void;
  onDateChange?: (startDate: Date, endDate: Date) => void;
  disabled?: boolean;
}

// 時間帯定義（9:00-20:00）
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => i + 9);

export default function MobileCalendar({ slots, onSelectSlot, onDateChange, disabled }: MobileCalendarProps) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // 日付変更時にコールバックを呼び出す
  const handleDateChange = (newStartDate: Date) => {
    setStartDate(newStartDate);
    if (onDateChange) {
      const endDate = new Date(newStartDate);
      endDate.setDate(endDate.getDate() + 3);
      onDateChange(newStartDate, endDate);
    }
  };

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
    handleDateChange(newDate);
  };

  const getSlotsForDateTime = (date: Date, hour: number) => {
    return slots.filter((slot) => {
      const slotDate = new Date(slot.start_at);
      return (
        slotDate.getFullYear() === date.getFullYear() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getDate() === date.getDate() &&
        slotDate.getHours() === hour
      );
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
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

  const isPastDateTime = (date: Date, hour: number) => {
    const now = new Date();
    const targetTime = new Date(date);
    targetTime.setHours(hour, 0, 0, 0);
    return targetTime < now;
  };

  const formatDateRange = () => {
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    return `${first.getMonth() + 1}/${first.getDate()} - ${last.getMonth() + 1}/${last.getDate()}`;
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

      {/* カレンダーグリッド: 縦=時間、横=日付 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr>
              <th className="w-14 p-2 text-xs text-neutral-500 border-b bg-white sticky left-0 z-10">
                時間
              </th>
              {visibleDays.map((day) => (
                <th key={day.toISOString()} className="p-2 border-b border-l min-w-[80px]">
                  <div className="text-xs text-neutral-500">
                    {day.toLocaleDateString('ja-JP', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday(day) ? 'text-primary-600' : 'text-neutral-900'
                  }`}>
                    {day.getDate()}
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
                  const isPast = isPastDateTime(day, hour);

                  return (
                    <td key={day.toISOString()} className="p-1 border-r border-b align-top">
                      {daySlots.length > 0 && !isPast ? (
                        <div className="space-y-1">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => onSelectSlot(slot)}
                              disabled={disabled}
                              className="w-full min-h-[44px] px-2 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 active:bg-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {formatTime(slot.start_at)}
                            </button>
                          ))}
                        </div>
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
