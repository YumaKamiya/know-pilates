import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google/calendar';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  const supabase = getAdminClient();

  let query = supabase
    .from('slots')
    .select('*, reservations(id, type, status, member_id, guest_name)')
    .order('start_at', { ascending: true });

  if (startDate) {
    query = query.gte('start_at', startDate);
  }
  if (endDate) {
    query = query.lte('start_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { start_at, end_at } = body;

  if (!start_at || !end_at) {
    return NextResponse.json(
      { error: '開始時刻と終了時刻は必須です' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Google Calendarにイベント作成
  let googleEventId: string | null = null;
  try {
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);
    const event = await createCalendarEvent({
      summary: '【予約枠】空き',
      start: startDate,
      end: endDate,
      description: '予約可能な枠です',
    });
    googleEventId = event.id || null;
  } catch (error) {
    console.error('Google Calendar event creation failed:', error);
    // Google Calendar連携失敗は警告のみ、処理は続行
  }

  const { data, error } = await supabase
    .from('slots')
    .insert({
      start_at,
      end_at,
      status: 'available',
      google_calendar_event_id: googleEventId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
  }

  const supabase = getAdminClient();

  // まず予約があるか確認
  const { data: slot } = await supabase
    .from('slots')
    .select('*, reservations(id)')
    .eq('id', id)
    .single();

  if (slot?.reservations && slot.reservations.length > 0) {
    return NextResponse.json(
      { error: 'この枠には予約があるため削除できません' },
      { status: 400 }
    );
  }

  // Google Calendarからイベント削除
  if (slot?.google_calendar_event_id) {
    try {
      await deleteCalendarEvent(slot.google_calendar_event_id);
    } catch (error) {
      console.error('Google Calendar event deletion failed:', error);
    }
  }

  const { error } = await supabase.from('slots').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
