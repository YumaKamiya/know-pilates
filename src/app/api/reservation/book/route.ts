import { NextRequest, NextResponse } from "next/server";
import { createBooking, saveReservation } from "@/lib/google";
import { sendReservationEmails } from "@/lib/email";
import { format, parse } from "date-fns";
import { ja } from "date-fns/locale";

interface BookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    // バリデーション
    if (!body.date || !body.time || !body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    // メールアドレスのバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "メールアドレスの形式が正しくありません" },
        { status: 400 }
      );
    }

    // 電話番号のバリデーション（日本の電話番号形式）
    const phoneRegex = /^[0-9-]{10,14}$/;
    if (!phoneRegex.test(body.phone.replace(/[- ]/g, ""))) {
      return NextResponse.json(
        { error: "電話番号の形式が正しくありません" },
        { status: 400 }
      );
    }

    // Google Calendarに予約を作成
    const calendarEventId = await createBooking({
      date: body.date,
      time: body.time,
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
    });

    // Google Sheetsに予約データを保存
    await saveReservation({
      date: body.date,
      time: body.time,
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      calendarEventId,
      createdAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });

    // メール通知を送信
    const formattedDate = format(
      parse(body.date, "yyyy-MM-dd", new Date()),
      "yyyy年M月d日（E）",
      { locale: ja }
    );

    await sendReservationEmails({
      name: body.name,
      email: body.email,
      phone: body.phone,
      date: formattedDate,
      time: body.time,
      message: body.message,
    });

    return NextResponse.json({
      success: true,
      message: "予約が完了しました",
      bookingId: calendarEventId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "予約の作成に失敗しました。しばらく経ってから再度お試しください。" },
      { status: 500 }
    );
  }
}
