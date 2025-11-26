import { getSheetsClient } from "./auth";
import { format } from "date-fns";

const SHEETS_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = "シート1";

export interface ReservationRecord {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  calendarEventId?: string;
  createdAt: string;
}

// 予約データをスプレッドシートに保存
export async function saveReservation(
  data: ReservationRecord
): Promise<void> {
  const sheets = getSheetsClient();

  const row = [
    data.createdAt,
    data.date,
    data.time,
    data.name,
    data.email,
    data.phone,
    data.message || "",
    data.calendarEventId || "",
    "未確認", // ステータス
  ];

  try {
    // ヘッダーが存在するか確認
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: `${SHEET_NAME}!A1:I1`,
    });

    if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
      // ヘッダーを追加
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEETS_ID,
        range: `${SHEET_NAME}!A1:I1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "申込日時",
              "予約日",
              "予約時間",
              "お名前",
              "メール",
              "電話番号",
              "メッセージ",
              "カレンダーID",
              "ステータス",
            ],
          ],
        },
      });
    }

    // データを追加
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEETS_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error("Error saving to sheets:", error);
    throw error;
  }
}

// 予約一覧を取得
export async function getReservations(): Promise<ReservationRecord[]> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: `${SHEET_NAME}!A2:I`,
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      createdAt: row[0] || "",
      date: row[1] || "",
      time: row[2] || "",
      name: row[3] || "",
      email: row[4] || "",
      phone: row[5] || "",
      message: row[6] || "",
      calendarEventId: row[7] || "",
    }));
  } catch (error) {
    console.error("Error fetching from sheets:", error);
    throw error;
  }
}
