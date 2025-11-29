import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// チケット履歴取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('member_id');

  if (!memberId) {
    return NextResponse.json({ error: 'member_idは必須です' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('ticket_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// チケット付与/消費
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { member_id, type, amount, reason } = body;

  if (!member_id || !type || amount === undefined) {
    return NextResponse.json(
      { error: 'member_id, type, amountは必須です' },
      { status: 400 }
    );
  }

  if (!['grant', 'consume', 'refund'].includes(type)) {
    return NextResponse.json(
      { error: 'typeはgrant, consume, refundのいずれかです' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // 消費の場合は残高チェック（有効期限考慮）
  if (type === 'consume') {
    const { data: balance } = await supabase
      .from('member_ticket_balance_valid')
      .select('balance')
      .eq('member_id', member_id)
      .single();

    const currentBalance = (balance?.balance as number) || 0;
    if (currentBalance < Math.abs(amount)) {
      return NextResponse.json(
        { error: 'チケット残高が不足しています' },
        { status: 400 }
      );
    }
  }

  // amountの符号を調整（consumeは負、grant/refundは正）
  const adjustedAmount = type === 'consume' ? -Math.abs(amount) : Math.abs(amount);

  const { data, error } = await supabase
    .from('ticket_logs')
    .insert({
      member_id,
      type,
      amount: adjustedAmount,
      reason,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
