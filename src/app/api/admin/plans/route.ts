import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, tickets_per_month, price } = body;

  if (!name || tickets_per_month === undefined) {
    return NextResponse.json(
      { error: 'プラン名と月間チケット数は必須です' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('plans')
    .insert({
      name,
      tickets_per_month,
      price: price || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, name, tickets_per_month, price, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('plans')
    .update({ name, tickets_per_month, price, is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
