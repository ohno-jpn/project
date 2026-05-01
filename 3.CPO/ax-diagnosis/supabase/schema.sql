-- AX-Diagnosis スキーマ
-- Supabase SQL Editor で実行してください

-- ── 設問テーブル ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id           TEXT PRIMARY KEY,
  axis         TEXT NOT NULL,          -- OH | OS | PH | PS
  depth        TEXT NOT NULL,          -- hook | checkup | biopsy | lab
  area         TEXT,                   -- biopsy/lab のグループ名
  keyword      TEXT NOT NULL,
  text         TEXT NOT NULL,
  format       TEXT NOT NULL,          -- state | quiz-single | quiz-multi | likert
  respondent   TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_choices (
  id           SERIAL PRIMARY KEY,
  question_id  TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  text         TEXT NOT NULL,
  is_correct   BOOLEAN DEFAULT FALSE,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- ── Hook レベル定義 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hook_levels (
  id           TEXT PRIMARY KEY,       -- H-01 〜 H-04
  axis         TEXT NOT NULL,
  axis_label   TEXT NOT NULL,
  title        TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hook_level_items (
  id           SERIAL PRIMARY KEY,
  hook_id      TEXT NOT NULL REFERENCES hook_levels(id) ON DELETE CASCADE,
  level        INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  keyword      TEXT NOT NULL,
  description  TEXT NOT NULL
);

-- ── Checkup レベル定義 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkup_levels (
  id           TEXT PRIMARY KEY,       -- C-01 〜 C-16
  axis         TEXT NOT NULL,
  axis_label   TEXT NOT NULL,
  title        TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS checkup_level_items (
  id           SERIAL PRIMARY KEY,
  checkup_id   TEXT NOT NULL REFERENCES checkup_levels(id) ON DELETE CASCADE,
  level        INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  keyword      TEXT NOT NULL,
  description  TEXT NOT NULL
);

-- ── 診断セッション ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnoses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id   TEXT NOT NULL,
  depth           TEXT NOT NULL,       -- hook | checkup | biopsy
  oh_score        NUMERIC,
  os_score        NUMERIC,
  ph_score        NUMERIC,
  ps_score        NUMERIC,
  total_score     NUMERIC,
  status          TEXT NOT NULL DEFAULT 'completed',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diagnosis_answers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnosis_id    UUID NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  answer          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── インデックス ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_axis       ON questions(axis);
CREATE INDEX IF NOT EXISTS idx_questions_depth      ON questions(depth);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user       ON diagnoses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created    ON diagnoses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_diagnosis    ON diagnosis_answers(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_choices_question     ON question_choices(question_id);

-- ── Row Level Security（必要に応じて有効化）─────────────────────────
-- ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE diagnosis_answers ENABLE ROW LEVEL SECURITY;
