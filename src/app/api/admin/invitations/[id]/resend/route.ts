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

// 招待再送信（新トークン発行・有効期限延長）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getAdminClient();

  // 招待を取得
  const { data: invitation, error: fetchError } = await supabase
    .from('member_invitations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !invitation) {
    return NextResponse.json(
      { error: '招待が見つかりません' },
      { status: 404 }
    );
  }

  // 既に受諾済みの場合はエラー
  if (invitation.status === 'accepted') {
    return NextResponse.json(
      { error: 'この招待は既に使用されています' },
      { status: 400 }
    );
  }

  // 新しいトークンと有効期限を設定
  const newToken = generateToken();
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7);

  // 招待を更新
  const { error: updateError } = await supabase
    .from('member_invitations')
    .update({
      token: newToken,
      expires_at: newExpiresAt.toISOString(),
      status: 'pending',
    })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // メール再送信
  const emailResult = await sendInvitationEmail(invitation.email, newToken);

  return NextResponse.json({
    success: true,
    emailSent: emailResult.success,
    emailError: emailResult.error,
    newExpiresAt: newExpiresAt.toISOString(),
  });
}
