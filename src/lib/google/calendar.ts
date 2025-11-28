import { getCalendarClient } from "./auth";
import { addDays, startOfDay, endOfDay, format, parse, setHours, setMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;
const TIMEZONE = "Asia/Tokyo";
const LESSON_DURATION_MINUTES = 50;

// 営業時間設定
const BUSINESS_HOURS: Record<number, { start: number; end: number } | null> = {
  0: null, // 日曜 - 定休日
  1: { start: 10, end: 20 }, // 月曜
  2: { start: 10, end: 18 }, // 火曜
  3: { start: 10, end: 20 }, // 水曜
  4: { start: 10, end: 18 }, // 木曜
  5: { start: 10, end: 20 }, // 金曜
  6: { start: 9, end: 17 }, // 土曜
};

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  available: boolean;
}

export interface BookingData {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}

// 予約可能な日付の範囲を取得（今日から30日後まで）
export function getBookableDateRange() {
  const today = new Date();
  const maxDate = addDays(today, 30);
  return { minDate: today, maxDate };
}

// 指定日の営業時間スロットを生成
function generateTimeSlots(date: Date): string[] {
  const dayOfWeek = date.getDay();
  const hours = BUSINESS_HOURS[dayOfWeek];

  if (!hours) return []; // 定休日

  const slots: string[] = [];
  for (let hour = hours.start; hour < hours.end; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

// 指定日の空き枠を取得
export async function getAvailableSlots(dateStr: string): Promise<TimeSlot[]> {
  const calendar = getCalendarClient();
  const date = parse(dateStr, "yyyy-MM-dd", new Date());

  // 営業時間スロットを生成
  const allSlots = generateTimeSlots(date);
  if (allSlots.length === 0) {
    return []; // 定休日
  }

  // 既存の予約を取得
  const timeMin = startOfDay(date).toISOString();
  const timeMax = endOfDay(date).toISOString();

  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    const bookedTimes = new Set<string>();

    events.forEach((event) => {
      if (event.start?.dateTime) {
        const eventDate = toZonedTime(new Date(event.start.dateTime), TIMEZONE);
        const timeStr = format(eventDate, "HH:mm");
        bookedTimes.add(timeStr);
      }
    });

    // 空き状況を判定
    return allSlots.map((time) => ({
      date: dateStr,
      time,
      available: !bookedTimes.has(time),
    }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

// カレンダーイベント作成（汎用）
export interface CalendarEventData {
  summary: string;
  start: Date;
  end: Date;
  description?: string;
}

export async function createCalendarEvent(data: CalendarEventData): Promise<{ id: string }> {
  const calendar = getCalendarClient();

  const startDateTimeStr = format(data.start, "yyyy-MM-dd'T'HH:mm:ss");
  const endDateTimeStr = format(data.end, "yyyy-MM-dd'T'HH:mm:ss");

  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: startDateTimeStr,
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTimeStr,
          timeZone: TIMEZONE,
        },
      },
    });

    return { id: response.data.id || '' };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

// カレンダーイベント削除
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const calendar = getCalendarClient();

  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

// カレンダーイベント更新
export async function updateCalendarEvent(
  eventId: string,
  data: Partial<CalendarEventData>
): Promise<void> {
  const calendar = getCalendarClient();

  const updateData: Record<string, unknown> = {};
  if (data.summary) updateData.summary = data.summary;
  if (data.description) updateData.description = data.description;
  if (data.start) {
    updateData.start = {
      dateTime: format(data.start, "yyyy-MM-dd'T'HH:mm:ss"),
      timeZone: TIMEZONE,
    };
  }
  if (data.end) {
    updateData.end = {
      dateTime: format(data.end, "yyyy-MM-dd'T'HH:mm:ss"),
      timeZone: TIMEZONE,
    };
  }

  try {
    await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId,
      requestBody: updateData,
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

// 予約を作成
export async function createBooking(data: BookingData): Promise<string> {
  const calendar = getCalendarClient();

  const [hours, minutes] = data.time.split(":").map(Number);

  // 開始時刻と終了時刻をJST形式で構築
  const startDateTimeStr = `${data.date}T${data.time}:00`;

  // 終了時刻を計算（分を加算）
  const endHours = hours + Math.floor((minutes + LESSON_DURATION_MINUTES) / 60);
  const endMinutes = (minutes + LESSON_DURATION_MINUTES) % 60;
  const endDateTimeStr = `${data.date}T${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}:00`;

  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `【体験】${data.name}様`,
        description: `
お名前: ${data.name}
メール: ${data.email}
電話番号: ${data.phone}
メッセージ: ${data.message || "なし"}
        `.trim(),
        start: {
          dateTime: startDateTimeStr,
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTimeStr,
          timeZone: TIMEZONE,
        },
      },
    });

    return response.data.id || "";
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}
