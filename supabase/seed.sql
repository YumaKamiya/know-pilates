-- サンプルデータ投入用SQL（スロットのみ）
-- 実行: Supabase SQL Editor で実行

-- 予約枠（今日から1週間分）
DO $$
DECLARE
  base_date DATE := CURRENT_DATE;
  slot_date DATE;
  slot_hour INTEGER;
  slot_id UUID;
BEGIN
  -- 7日分のスロットを作成
  FOR day_offset IN 0..6 LOOP
    slot_date := base_date + day_offset;

    -- 各日に複数時間帯を作成（10:00, 11:00, 14:00, 15:00, 16:00）
    FOREACH slot_hour IN ARRAY ARRAY[10, 11, 14, 15, 16] LOOP
      -- 既存のスロットがなければ作成
      IF NOT EXISTS (
        SELECT 1 FROM slots
        WHERE DATE(start_at) = slot_date
        AND EXTRACT(HOUR FROM start_at) = slot_hour
      ) THEN
        slot_id := gen_random_uuid();
        INSERT INTO slots (id, start_at, end_at, status, google_calendar_event_id)
        VALUES (
          slot_id,
          (slot_date || ' ' || slot_hour || ':00:00')::TIMESTAMPTZ,
          (slot_date || ' ' || (slot_hour + 1) || ':00:00')::TIMESTAMPTZ,
          'available',
          NULL
        );
      END IF;
    END LOOP;

    -- 同じ時間帯に複数スロット（Issue #3テスト用: 明日の10時台に2つ目）
    IF day_offset = 1 THEN
      IF NOT EXISTS (
        SELECT 1 FROM slots
        WHERE DATE(start_at) = base_date + 1
        AND EXTRACT(HOUR FROM start_at) = 10
        AND EXTRACT(MINUTE FROM start_at) = 30
      ) THEN
        slot_id := gen_random_uuid();
        INSERT INTO slots (id, start_at, end_at, status, google_calendar_event_id)
        VALUES (
          slot_id,
          ((base_date + 1) || ' 10:30:00')::TIMESTAMPTZ,
          ((base_date + 1) || ' 11:30:00')::TIMESTAMPTZ,
          'available',
          NULL
        );
      END IF;
    END IF;
  END LOOP;
END $$;

-- 確認
SELECT
  DATE(start_at) as date,
  COUNT(*) as slot_count
FROM slots
WHERE start_at >= CURRENT_DATE
GROUP BY DATE(start_at)
ORDER BY date;
