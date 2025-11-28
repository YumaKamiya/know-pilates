-- RLSポリシー追加（シンプル版）
-- 会員は自分のデータのみアクセス可能
-- 管理者（service_role）は全データにアクセス可能

-- members テーブル
alter table members enable row level security;

-- 会員は自分のデータのみ参照可能
create policy "Members can view own data"
  on members for select
  using (auth.uid() = auth_user_id);

-- 会員は自分のデータのみ更新可能（所有権変更防止）
create policy "Members can update own data"
  on members for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- member_plans テーブル
alter table member_plans enable row level security;

-- 会員は自分のプランのみ参照可能
create policy "Members can view own plans"
  on member_plans for select
  using (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );

-- reservations テーブル
alter table reservations enable row level security;

-- 会員は自分の予約のみ参照可能
create policy "Members can view own reservations"
  on reservations for select
  using (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );

-- 会員は予約を作成可能
create policy "Members can create reservations"
  on reservations for insert
  with check (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );

-- 会員は自分の予約のみ更新可能（キャンセル用、所有権変更防止）
create policy "Members can update own reservations"
  on reservations for update
  using (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  )
  with check (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );

-- ticket_logs テーブル
alter table ticket_logs enable row level security;

-- 会員は自分のチケット履歴のみ参照可能
create policy "Members can view own ticket logs"
  on ticket_logs for select
  using (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );

-- slots テーブル
alter table slots enable row level security;

-- 全ユーザーが空き枠を参照可能（予約時に必要）
create policy "Anyone can view available slots"
  on slots for select
  using (true);

-- plans テーブル
alter table plans enable row level security;

-- 全ユーザーがプランを参照可能
create policy "Anyone can view plans"
  on plans for select
  using (true);

-- Note: service_role keyを使用するAPIはRLSをバイパスするため、
-- 管理者操作には追加のポリシーは不要
