import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateCalendarEvent } from '@/lib/google/calendar';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 管理者による予約キャンセル
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminClient = getAdminClient();

  // 1. 予約情報取得
  const { data: reservation, error: reservationError } = await adminClient
    .from('reservations')
    .select(`
      id,
      member_id,
      slot_id,
      status,
      type,
      slots(google_calendar_event_id)
    `)
    .eq('id', id)
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json({ error: '予約が見つかりません' }, { status: 404 });
  }

  // すでにキャンセル済みか確認
  if (reservation.status === 'cancelled') {
    return NextResponse.json({ error: 'すでにキャンセルされています' }, { status: 400 });
  }

  // 2. 予約をキャンセル（楽観的ロック）
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

  // 3. スロットを利用可能に戻す
  const { error: slotError } = await adminClient
    .from('slots')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', reservation.slot_id);

  if (slotError) {
    // ロールバック: 予約を元に戻す
    await adminClient
      .from('reservations')
      .update({
        status: 'confirmed',
        cancelled_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return NextResponse.json({ error: 'スロットの更新に失敗しました' }, { status: 500 });
  }

  // 4. チケット返却（会員予約の場合のみ）
  if (reservation.type === 'member' && reservation.member_id) {
    const { error: ticketError } = await adminClient
      .from('ticket_logs')
      .insert({
        member_id: reservation.member_id,
        type: 'refund',
        amount: 1,
        reason: '管理者による予約キャンセル',
        reservation_id: id,
        expires_at: null, // 無期限
      });

    if (ticketError) {
      // ロールバック
      await adminClient
        .from('reservations')
        .update({
          status: 'confirmed',
          cancelled_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      await adminClient
        .from('slots')
        .update({
          status: 'booked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservation.slot_id);

      return NextResponse.json({ error: 'チケットの返却に失敗しました' }, { status: 500 });
    }
  }

  // 5. Google Calendar同期（エラーでもキャンセルは成功とする）
  const slot = reservation.slots as unknown as { google_calendar_event_id: string | null };
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
