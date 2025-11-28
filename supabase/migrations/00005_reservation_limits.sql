-- Phase 5: 予約制限ロジック
-- 月プラン: 予約カウント制（翌月繰越なし）
-- 回数券: チケット消費制（6ヶ月有効）

-- 1. plansテーブルにタイプ追加（monthly=月プラン、ticket=回数券）
ALTER TABLE plans ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'monthly';

-- 既存プランを月プランに設定
UPDATE plans SET type = 'monthly' WHERE type IS NULL;

-- 2. ticket_logsに有効期限カラム追加（回数券用）
ALTER TABLE ticket_logs ADD COLUMN IF NOT EXISTS expires_at DATE;

-- 3. 月別予約数カウントビュー
CREATE OR REPLACE VIEW member_monthly_reservation_count AS
SELECT
  r.member_id,
  DATE_TRUNC('month', s.start_at AT TIME ZONE 'Asia/Tokyo') AS month,
  COUNT(*) AS reservation_count
FROM reservations r
JOIN slots s ON r.slot_id = s.id
WHERE r.status = 'confirmed'
  AND r.member_id IS NOT NULL
GROUP BY r.member_id, DATE_TRUNC('month', s.start_at AT TIME ZONE 'Asia/Tokyo');

-- 4. 回数券残高ビュー（有効期限考慮）
CREATE OR REPLACE VIEW member_ticket_balance_valid AS
SELECT
  member_id,
  COALESCE(SUM(
    CASE
      WHEN expires_at IS NULL OR expires_at >= CURRENT_DATE THEN amount
      ELSE 0
    END
  ), 0) AS balance,
  MIN(CASE WHEN amount > 0 AND (expires_at IS NULL OR expires_at >= CURRENT_DATE) THEN expires_at END) AS nearest_expiry
FROM ticket_logs
GROUP BY member_id;

-- 5. 会員の予約可能状況を返すビュー
CREATE OR REPLACE VIEW member_reservation_availability AS
SELECT
  m.id AS member_id,
  m.name AS member_name,

  -- プラン情報
  mp.id AS member_plan_id,
  p.id AS plan_id,
  p.name AS plan_name,
  p.type AS plan_type,
  p.tickets_per_month,

  -- 月プランの場合: 当月の予約数と残り
  COALESCE(mrc_current.reservation_count, 0) AS current_month_reservations,
  CASE
    WHEN p.type = 'monthly' THEN p.tickets_per_month - COALESCE(mrc_current.reservation_count, 0)
    ELSE NULL
  END AS current_month_remaining,

  -- 翌月の予約数と残り
  COALESCE(mrc_next.reservation_count, 0) AS next_month_reservations,
  CASE
    WHEN p.type = 'monthly' THEN p.tickets_per_month - COALESCE(mrc_next.reservation_count, 0)
    ELSE NULL
  END AS next_month_remaining,

  -- 回数券の場合: 残高と有効期限
  COALESCE(tb.balance, 0) AS ticket_balance,
  tb.nearest_expiry AS ticket_expiry,

  -- 未消化予約数（将来の同時予約制限用）
  (SELECT COUNT(*)
   FROM reservations r2
   JOIN slots s2 ON r2.slot_id = s2.id
   WHERE r2.member_id = m.id
     AND r2.status = 'confirmed'
     AND s2.start_at > NOW()) AS pending_reservations

FROM members m
LEFT JOIN member_plans mp ON m.id = mp.member_id AND mp.status = 'active'
LEFT JOIN plans p ON mp.plan_id = p.id
LEFT JOIN member_monthly_reservation_count mrc_current
  ON m.id = mrc_current.member_id
  AND mrc_current.month = DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Tokyo')
LEFT JOIN member_monthly_reservation_count mrc_next
  ON m.id = mrc_next.member_id
  AND mrc_next.month = DATE_TRUNC('month', (NOW() AT TIME ZONE 'Asia/Tokyo') + INTERVAL '1 month')
LEFT JOIN member_ticket_balance_valid tb ON m.id = tb.member_id
WHERE m.status = 'active';

-- 6. 予約可能チェック関数
CREATE OR REPLACE FUNCTION can_make_reservation(
  p_member_id UUID,
  p_slot_start_at TIMESTAMPTZ
) RETURNS TABLE (
  can_reserve BOOLEAN,
  reason TEXT,
  plan_type TEXT
) AS $$
DECLARE
  v_plan_type TEXT;
  v_tickets_per_month INTEGER;
  v_month_reservations INTEGER;
  v_ticket_balance INTEGER;
  v_slot_month DATE;
BEGIN
  -- スロットの月を取得
  v_slot_month := DATE_TRUNC('month', p_slot_start_at AT TIME ZONE 'Asia/Tokyo');

  -- 会員のプラン情報を取得
  SELECT p.type, p.tickets_per_month
  INTO v_plan_type, v_tickets_per_month
  FROM members m
  LEFT JOIN member_plans mp ON m.id = mp.member_id AND mp.status = 'active'
  LEFT JOIN plans p ON mp.plan_id = p.id
  WHERE m.id = p_member_id;

  -- プランがない場合は回数券をチェック
  IF v_plan_type IS NULL THEN
    SELECT COALESCE(balance, 0) INTO v_ticket_balance
    FROM member_ticket_balance_valid
    WHERE member_id = p_member_id;

    IF v_ticket_balance IS NULL OR v_ticket_balance <= 0 THEN
      RETURN QUERY SELECT FALSE, '予約可能なチケットがありません'::TEXT, 'none'::TEXT;
      RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, 'ticket'::TEXT;
    RETURN;
  END IF;

  -- 月プランの場合
  IF v_plan_type = 'monthly' THEN
    -- 対象月の予約数を取得
    SELECT COALESCE(COUNT(*), 0) INTO v_month_reservations
    FROM reservations r
    JOIN slots s ON r.slot_id = s.id
    WHERE r.member_id = p_member_id
      AND r.status = 'confirmed'
      AND DATE_TRUNC('month', s.start_at AT TIME ZONE 'Asia/Tokyo') = v_slot_month;

    IF v_month_reservations >= v_tickets_per_month THEN
      RETURN QUERY SELECT FALSE,
        format('%s月の予約上限（%s回）に達しています',
          EXTRACT(MONTH FROM v_slot_month)::INTEGER,
          v_tickets_per_month)::TEXT,
        'monthly'::TEXT;
      RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, 'monthly'::TEXT;
    RETURN;
  END IF;

  -- 回数券プランの場合
  IF v_plan_type = 'ticket' THEN
    SELECT COALESCE(balance, 0) INTO v_ticket_balance
    FROM member_ticket_balance_valid
    WHERE member_id = p_member_id;

    IF v_ticket_balance <= 0 THEN
      RETURN QUERY SELECT FALSE, '回数券の残数がありません'::TEXT, 'ticket'::TEXT;
      RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, 'ticket'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, '不明なプランタイプです'::TEXT, 'unknown'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON VIEW member_reservation_availability IS '会員の予約可能状況（月プラン残数、回数券残数、未消化予約数）';
COMMENT ON FUNCTION can_make_reservation IS '予約可能かチェックする関数（月プラン: 月上限、回数券: 残数）';
