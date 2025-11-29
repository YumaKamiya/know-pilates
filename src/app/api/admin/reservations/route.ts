import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// 予約一覧取得（管理者用）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  const supabase = getAdminClient();

  let query = supabase
    .from('reservations')
    .select(`
      id,
      type,
      status,
      created_at,
      cancelled_at,
      members(id, name, email, phone),
      slots(id, start_at, end_at)
    `)
    .order('created_at', { ascending: false });

  // 会員名・メール検索
  if (search) {
    query = query.or(`members.name.ilike.%${search}%,members.email.ilike.%${search}%`);
  }

  // ステータスフィルター
  if (status) {
    query = query.eq('status', status);
  }

  // タイプフィルター
  if (type) {
    query = query.eq('type', type);
  }

  // 日付範囲フィルター（スロットの開始日時を基準）
  if (startDate) {
    query = query.gte('slots.start_at', startDate);
  }

  if (endDate) {
    query = query.lte('slots.start_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
