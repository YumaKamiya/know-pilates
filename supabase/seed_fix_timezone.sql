-- タイムゾーン修正: 既存スロットを削除して日本時間で再作成

-- 既存の予約がないスロットを削除
DELETE FROM slots
WHERE id NOT IN (SELECT slot_id FROM reservations WHERE slot_id IS NOT NULL);

-- 予約枠を日本時間で作成（今日から1週間分）
DO $$
DECLARE
  base_date DATE := CURRENT_DATE;
  slot_date DATE;
  slot_hour INTEGER;
  slot_id UUID;
  jst_offset INTERVAL := INTERVAL '9 hours';
BEGIN
  -- 7日分のスロットを作成
  FOR day_offset IN 0..6 LOOP
    slot_date := base_date + day_offset;

    -- 各日に複数時間帯を作成（10:00, 11:00, 14:00, 15:00, 16:00 JST）
    FOREACH slot_hour IN ARRAY ARRAY[10, 11, 14, 15, 16] LOOP
      slot_id := gen_random_uuid();

      -- JSTで指定した時間をUTCに変換して保存
      INSERT INTO slots (id, start_at, end_at, status, google_calendar_event_id)
      VALUES (
        slot_id,
        (slot_date || ' ' || slot_hour || ':00:00+09:00')::TIMESTAMPTZ,
        (slot_date || ' ' || (slot_hour + 1) || ':00:00+09:00')::TIMESTAMPTZ,
        'available',
        NULL
      );
    END LOOP;

    -- 同じ時間帯に複数スロット（Issue #3テスト用: 明日の10時台に2つ目）
    IF day_offset = 1 THEN
      slot_id := gen_random_uuid();
      INSERT INTO slots (id, start_at, end_at, status, google_calendar_event_id)
      VALUES (
        slot_id,
        ((base_date + 1) || ' 10:30:00+09:00')::TIMESTAMPTZ,
        ((base_date + 1) || ' 11:30:00+09:00')::TIMESTAMPTZ,
        'available',
        NULL
      );
    END IF;
  END LOOP;
END $$;

-- 確認（JST表示）
SELECT
  id,
  start_at AT TIME ZONE 'Asia/Tokyo' as start_jst,
  end_at AT TIME ZONE 'Asia/Tokyo' as end_jst,
  status
FROM slots
WHERE start_at >= CURRENT_DATE
ORDER BY start_at
LIMIT 20;
