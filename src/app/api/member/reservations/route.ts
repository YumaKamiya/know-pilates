import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { updateCalendarEvent } from '@/lib/google/calendar';

// 管理用クライアント（service_role）- RLSバイパス用
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 予約作成（月プラン: カウント制 / 回数券: チケット消費）
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const { slotId, memberId } = await request.json();

  if (!slotId || !memberId) {
    return NextResponse.json({ error: 'slotIdとmemberIdは必須です' }, { status: 400 });
  }

  const adminClient = getAdminClient();

  // 会員の所有権確認
  const { data: member, error: memberError } = await adminClient
    .from('members')
    .select('id, auth_user_id, name')
    .eq('id', memberId)
    .single();

  if (memberError || !member) {
    return NextResponse.json({ error: '会員情報が見つかりません' }, { status: 404 });
  }

  if (member.auth_user_id !== user.id) {
    return NextResponse.json({ error: '権限がありません' }, { status: 403 });
  }

  // スロット情報を先に取得（予約可能チェックに必要）
  const { data: slotInfo, error: slotInfoError } = await adminClient
    .from('slots')
    .select('id, status, start_at, end_at, google_calendar_event_id')
    .eq('id', slotId)
    .single();

  if (slotInfoError || !slotInfo) {
    return NextResponse.json({ error: 'スロットが見つかりません' }, { status: 404 });
  }

  // 予約可能かチェック（DB関数を使用）
  const { data: canReserve, error: checkError } = await adminClient
    .rpc('can_make_reservation', {
      p_member_id: memberId,
      p_slot_start_at: slotInfo.start_at,
    });

  if (checkError) {
    console.error('予約可能チェックエラー:', checkError);
    return NextResponse.json({ error: '予約可能チェックに失敗しました' }, { status: 500 });
  }

  const checkResult = canReserve?.[0];
  if (!checkResult?.can_reserve) {
    return NextResponse.json({ error: checkResult?.reason || '予約できません' }, { status: 400 });
  }

  const planType = checkResult.plan_type; // 'monthly', 'ticket', 'none'

  // スロットの状態確認（楽観的ロック）- 既に取得済みのslotInfoを使用
  if (slotInfo.status !== 'available') {
    return NextResponse.json({ error: 'この枠はすでに予約されています' }, { status: 409 });
  }

  // 過去の枠でないか確認
  if (new Date(slotInfo.start_at) < new Date()) {
    return NextResponse.json({ error: '過去の枠は予約できません' }, { status: 400 });
  }

  const slot = slotInfo;

  // トランザクション的に処理
  // 1. スロットを予約済みに更新（楽観的ロック + 更新件数チェック）
  const { data: updatedSlot, error: updateSlotError } = await adminClient
    .from('slots')
    .update({ status: 'booked', updated_at: new Date().toISOString() })
    .eq('id', slotId)
    .eq('status', 'available') // 楽観的ロック
    .select()
    .maybeSingle();

  if (updateSlotError) {
    return NextResponse.json({ error: 'スロットの更新に失敗しました' }, { status: 500 });
  }

  // 更新件数が0の場合（別リクエストで先に予約された）
  if (!updatedSlot) {
    return NextResponse.json({ error: 'この枠はすでに予約されています' }, { status: 409 });
  }

  // 2. 予約を作成
  const { data: reservation, error: reservationError } = await adminClient
    .from('reservations')
    .insert({
      slot_id: slotId,
      member_id: memberId,
      type: 'member',
      status: 'confirmed',
    })
    .select()
    .single();

  if (reservationError) {
    // ロールバック: スロットを利用可能に戻す
    await adminClient
      .from('slots')
      .update({ status: 'available' })
      .eq('id', slotId);

    return NextResponse.json({ error: '予約の作成に失敗しました' }, { status: 500 });
  }

  // 3. チケットを消費（回数券の場合のみ）
  // 月プランの場合はチケット消費不要（予約数カウントのみ）
  if (planType === 'ticket') {
    const { error: ticketError } = await adminClient
      .from('ticket_logs')
      .insert({
        member_id: memberId,
        type: 'consume',
        amount: -1,
        reason: '予約消費',
        reservation_id: reservation.id,
      });

    if (ticketError) {
      // ロールバック: 予約とスロットを元に戻す
      await adminClient
        .from('reservations')
        .delete()
        .eq('id', reservation.id);
      await adminClient
        .from('slots')
        .update({ status: 'available' })
        .eq('id', slotId);

      return NextResponse.json({ error: 'チケットの消費に失敗しました' }, { status: 500 });
    }
  }

  // 4. Google Calendar同期（エラーでも予約は成功とする）
  if (slot.google_calendar_event_id) {
    try {
      await updateCalendarEvent(slot.google_calendar_event_id, {
        summary: `【予約済】${member.name}様`,
      });
    } catch (calendarError) {
      console.error('Google Calendar更新エラー:', calendarError);
    }
  }

  return NextResponse.json(reservation, { status: 201 });
}

// 予約一覧取得
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = adminClient
    .from('reservations')
    .select(`
      id,
      status,
      created_at,
      cancelled_at,
      slots(id, start_at, end_at)
    `)
    .eq('member_id', member.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
