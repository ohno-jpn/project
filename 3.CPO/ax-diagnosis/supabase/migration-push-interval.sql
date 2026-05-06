-- interval_days を interval_minutes にリネーム（分単位で間隔管理）
ALTER TABLE push_settings RENAME COLUMN interval_days TO interval_minutes;
