-- Phase 3: 会員招待・初期登録フロー
-- 招待トークン管理テーブル

-- 1. 招待テーブル作成
CREATE TABLE member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. インデックス作成
CREATE INDEX idx_member_invitations_token ON member_invitations(token);
CREATE INDEX idx_member_invitations_email ON member_invitations(email);
CREATE INDEX idx_member_invitations_status ON member_invitations(status);

-- 3. updated_at自動更新トリガー（既存関数を再利用）
CREATE TRIGGER member_invitations_updated_at
  BEFORE UPDATE ON member_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. RLSポリシー設定
ALTER TABLE member_invitations ENABLE ROW LEVEL SECURITY;

-- トークン検証用に公開読み取り許可（トークンを知っている人のみアクセス可能）
CREATE POLICY "Anyone can verify invitation by token" ON member_invitations
  FOR SELECT USING (true);

-- 5. membersテーブルに利用規約同意日時カラム追加
ALTER TABLE members ADD COLUMN IF NOT EXISTS agreed_at TIMESTAMPTZ;
