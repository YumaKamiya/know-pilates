import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { sendInvitationEmail } from '@/lib/email';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// 招待一覧取得
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const supabase = getAdminClient();

  let query = supabase
    .from('member_invitations')
    .select('*')
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

// 新規招待作成・メール送信
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'メールアドレスは必須です' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // 既に会員として登録されているかチェック
  const { data: existingMember } = await supabase
    .from('members')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingMember) {
    return NextResponse.json(
      { error: 'このメールアドレスは既に会員登録されています' },
      { status: 400 }
    );
  }

  // 有効な招待が既に存在するかチェック
  const { data: existingInvitation } = await supabase
    .from('member_invitations')
    .select('id, expires_at')
    .eq('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (existingInvitation) {
    return NextResponse.json(
      { error: 'このメールアドレスには既に有効な招待が存在します。再送信を行ってください。' },
      { status: 400 }
    );
  }

  // トークン生成
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7日後

  // 招待レコード作成
  const { data: invitation, error: insertError } = await supabase
    .from('member_invitations')
    .insert({
      email,
      token,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // メール送信
  const emailResult = await sendInvitationEmail(email, token);

  return NextResponse.json({
    success: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      expires_at: invitation.expires_at,
    },
    emailSent: emailResult.success,
    emailError: emailResult.error,
  });
}
