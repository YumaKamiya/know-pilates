import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { member_id, plan_id } = body;

  if (!member_id || !plan_id) {
    return NextResponse.json(
      { error: 'member_idとplan_idは必須です' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // 既存のアクティブなプランを終了
  await supabase
    .from('member_plans')
    .update({
      status: 'cancelled',
      cancelled_at: format(new Date(), 'yyyy-MM-dd'),
    })
    .eq('member_id', member_id)
    .eq('status', 'active');

  // 新しいプランを開始
  const { data, error } = await supabase
    .from('member_plans')
    .insert({
      member_id,
      plan_id,
      status: 'active',
      started_at: format(new Date(), 'yyyy-MM-dd'),
    })
    .select('*, plans(*)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // プランに応じた初回チケットを付与
  const plan = data.plans as { tickets_per_month: number; name: string } | null;
  if (plan && plan.tickets_per_month > 0) {
    await supabase.from('ticket_logs').insert({
      member_id,
      type: 'grant',
      amount: plan.tickets_per_month,
      reason: `プラン付与: ${plan.name}`,
    });
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

  const { error } = await supabase
    .from('member_plans')
    .update({
      status: 'cancelled',
      cancelled_at: format(new Date(), 'yyyy-MM-dd'),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
