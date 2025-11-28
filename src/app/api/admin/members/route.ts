import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const supabase = getAdminClient();

  let query = supabase
    .from('members')
    .select(`
      *,
      member_plans(*, plans(*)),
      ticket_balance:member_ticket_balance(balance)
    `)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, note, password } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: '名前とメールアドレスは必須です' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Supabase Authでユーザー作成（パスワードが指定されている場合）
  let authUserId: string | null = null;
  if (password) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    authUserId = authData.user.id;
  }

  // 会員データを作成
  const { data, error } = await supabase
    .from('members')
    .insert({
      name,
      email,
      phone,
      note,
      auth_user_id: authUserId,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    // Authユーザーを作成していた場合は削除
    if (authUserId) {
      await supabase.auth.admin.deleteUser(authUserId);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, name, email, phone, status, note } = body;

  if (!id) {
    return NextResponse.json({ error: 'IDは必須です' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('members')
    .update({ name, email, phone, status, note })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
