-- Phase 2 セキュリティ強化: DB側制約追加
-- 二重予約防止・負残高防止のための制約

-- 1. 部分ユニーク制約: 同じスロットに確定済み予約は1件のみ
-- （キャンセル済み予約は除外）
CREATE UNIQUE INDEX idx_reservations_slot_confirmed
ON reservations (slot_id)
WHERE status = 'confirmed';

-- 2. チケット残高が負にならないことを保証するトリガー
-- member_ticket_balance はビューなので、ticket_logs への INSERT 時にチェック

CREATE OR REPLACE FUNCTION check_ticket_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- 消費（amount < 0）の場合のみチェック
  IF NEW.amount < 0 THEN
    SELECT COALESCE(SUM(amount), 0) INTO current_balance
    FROM ticket_logs
    WHERE member_id = NEW.member_id;

    -- 新しいログを加えた後の残高が負になる場合はエラー
    IF (current_balance + NEW.amount) < 0 THEN
      RAISE EXCEPTION 'チケット残高が不足しています（現在: %, 必要: %）',
        current_balance, ABS(NEW.amount);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_ticket_balance
BEFORE INSERT ON ticket_logs
FOR EACH ROW
EXECUTE FUNCTION check_ticket_balance();

-- 3. 予約ステータスの制約（念のため）
ALTER TABLE reservations
ADD CONSTRAINT chk_reservation_status
CHECK (status IN ('confirmed', 'cancelled', 'completed'));

-- 4. スロットステータスの制約（念のため）
ALTER TABLE slots
ADD CONSTRAINT chk_slot_status
CHECK (status IN ('available', 'booked', 'cancelled'));
