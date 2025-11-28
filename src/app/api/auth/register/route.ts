import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, agreedToTerms } = body;

  // バリデーション
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: '名前、メールアドレス、パスワードは必須です' },
      { status: 400 }
    );
  }

  if (!agreedToTerms) {
    return NextResponse.json(
      { error: '利用規約への同意が必要です' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'パスワードは8文字以上で入力してください' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // メールアドレスの重複チェック
  const { data: existingMember } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingMember) {
    return NextResponse.json(
      { error: 'このメールアドレスは既に登録されています' },
      { status: 400 }
    );
  }

  // Supabase Authでユーザー作成
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    // Authでも重複チェック
    if (authError.message.includes('already been registered')) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // 会員データを作成
  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      name,
      email,
      auth_user_id: authData.user.id,
      status: 'active',
      agreed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (memberError) {
    // 会員作成に失敗した場合はAuthユーザーを削除
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
    },
  });
}
