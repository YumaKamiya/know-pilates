import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { updateCalendarEvent } from '@/lib/google/calendar';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// キャンセル可能期限（レッスン開始2時間前まで）
const CANCEL_DEADLINE_HOURS = 2;

// 予約キャンセル
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const adminClient = getAdminClient();

  // 会員情報取得
  const { data: member } = await adminClient
    .from('members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: '会員情報が見つかりません' }, { status: 404 });
  }

  // 予約情報取得
  const { data: reservation, error: reservationError } = await adminClient
    .from('reservations')
    .select(`
      id,
      member_id,
      slot_id,
      status,
      slots(start_at, google_calendar_event_id)
    `)
    .eq('id', id)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 });
  }

  // 所有権確認
  if (reservation.member_id !== member.id) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  // すでにキャンセル済みか確認
  if (reservation.status === 'cancelled') {
    return NextResponse.json({ error: 'すでにキャンセルされています' }, { status: 400 });
  }

  // キャンセル可能期限チェック
  const slot = reservation.slots as unknown as { start_at: string; google_calendar_event_id: string | null };
  const startAt = new Date(slot.start_at);
  const deadline = new Date(startAt.getTime() - CANCEL_DEADLINE_HOURS * 60 * 60 * 1000);

  if (new Date() > deadline) {
    return NextResponse.json(
      { error: `キャンセルは${CANCEL_DEADLINE_HOURS}時間前までです` },
      { status: 400 }
    );
  }

  // トランザクション的に処理
  // 1. 予約をキャンセル（楽観的ロック + 更新件数チェック）
  const { data: updatedReservation, error: updateError } = await adminClient
    .from('reservations')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'confirmed') // 楽観的ロック
    .select()
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: 'キャンセルに失敗しました' }, { status: 500 });
  }

  // 更新件数が0の場合（別リクエストで先にキャンセルされた）
  if (!updatedReservation) {
    return NextResponse.json({ error: 'すでにキャンセルされています' }, { status: 409 });
  }

  // 2. スロットを利用可能に戻す
  const { error: slotError } = await adminClient
    .from('slots')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', reservation.slot_id);

  if (slotError) {
    // ロールバック: 予約を元に戻す
    await adminClient
      .from('reservations')
      .update({ status: 'confirmed', cancelled_at: null })
      .eq('id', id);

    return NextResponse.json({ error: 'スロットの更新に失敗しました' }, { status: 500 });
  }

  // 3. チケットを返却
  const { error: ticketError } = await adminClient
    .from('ticket_logs')
    .insert({
      member_id: member.id,
      type: 'refund',
      amount: 1,
      reason: '予約キャンセル返却',
      reservation_id: id,
    });

  if (ticketError) {
    // ロールバック
    await adminClient
      .from('reservations')
      .update({ status: 'confirmed', cancelled_at: null })
      .eq('id', id);
    await adminClient
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', reservation.slot_id);

    return NextResponse.json({ error: 'チケットの返却に失敗しました' }, { status: 500 });
  }

  // 4. Google Calendar同期（エラーでもキャンセルは成功とする）
  if (slot.google_calendar_event_id) {
    try {
      await updateCalendarEvent(slot.google_calendar_event_id, {
        summary: '【空き枠】',
      });
    } catch (calendarError) {
      console.error('Google Calendar更新エラー:', calendarError);
    }
  }

  return NextResponse.json({ message: 'キャンセルしました' });
}
