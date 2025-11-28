import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// トークン検証（GET）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const supabase = getAdminClient();

  const { data: invitation, error } = await supabase
    .from('member_invitations')
    .select('id, email, status, expires_at')
    .eq('token', token)
    .single();

  if (error || !invitation) {
    return NextResponse.json(
      { valid: false, error: 'この招待リンクは無効です' },
      { status: 404 }
    );
  }

  // ステータスチェック
  if (invitation.status === 'accepted') {
    return NextResponse.json(
      { valid: false, error: 'この招待は既に使用されています' },
      { status: 400 }
    );
  }

  // 有効期限チェック
  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json(
      {
        valid: false,
        error: 'この招待リンクの有効期限が切れています。管理者に再招待を依頼してください。',
        expired: true,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    email: invitation.email,
  });
}

// 招待経由で登録完了（POST）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const { name, password, agreedToTerms } = body;

  // バリデーション
  if (!name || !password) {
    return NextResponse.json(
      { error: '名前とパスワードは必須です' },
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

  // 招待を取得・検証
  const { data: invitation, error: fetchError } = await supabase
    .from('member_invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (fetchError || !invitation) {
    return NextResponse.json(
      { error: 'この招待リンクは無効です' },
      { status: 404 }
    );
  }

  if (invitation.status === 'accepted') {
    return NextResponse.json(
      { error: 'この招待は既に使用されています' },
      { status: 400 }
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'この招待リンクの有効期限が切れています' },
      { status: 400 }
    );
  }

  // 既に会員登録されていないかチェック
  const { data: existingMember } = await supabase
    .from('members')
    .select('id')
    .eq('email', invitation.email)
    .maybeSingle();

  if (existingMember) {
    return NextResponse.json(
      { error: 'このメールアドレスは既に登録されています' },
      { status: 400 }
    );
  }

  // Supabase Authでユーザー作成
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // 会員データを作成
  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({
      name,
      email: invitation.email,
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

  // 招待を受諾済みに更新
  await supabase
    .from('member_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      member_id: member.id,
    })
    .eq('id', invitation.id);

  // 登録完了メールを送信
  await sendWelcomeEmail(invitation.email, name);

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
    },
  });
}
