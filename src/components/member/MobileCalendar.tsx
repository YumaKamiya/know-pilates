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

      {/* カレンダーの見方 */}
      <div className="px-4 py-4 bg-gradient-to-r from-primary-50/20 via-white to-primary-50/20 border-b border-primary-100/50">
        <p className="font-semibold text-neutral-700 mb-3 text-sm">カレンダーの見方</p>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 rounded border border-primary-200 flex-shrink-0"></div>
            <span className="text-neutral-700">予約可能</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-neutral-100 rounded border border-neutral-200 flex-shrink-0"></div>
            <span className="text-neutral-700">空きなし</span>
          </div>
        </div>
      </div>

      {/* カレンダーグリッド: 縦=時間、横=日付 */}
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
                    {day.toLocaleDateString('ja-JP', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${
                    isToday(day) ? 'text-white' : 'text-neutral-900'
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
                <td className="p-2 text-xs text-neutral-500 text-center border-r border-primary-100/30 bg-white sticky left-0 z-10">
                  {hour}:00
                </td>
                {visibleDays.map((day) => {
                  const daySlots = getSlotsForDateTime(day, hour);
                  const isPast = isPastDateTime(day, hour);

                  return (
                    <td key={day.toISOString()} className="p-2 border-r border-b border-primary-100/30 align-top">
                      {daySlots.length > 0 && !isPast ? (
                        <div className="space-y-1">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => onSelectSlot(slot)}
                              disabled={disabled}
                              className="w-full min-h-[48px] px-3 py-3 text-sm bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 text-primary-700 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              {formatTime(slot.start_at)}
                            </button>
                          ))}
                        </div>
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
