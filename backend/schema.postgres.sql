CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  anime TEXT NOT NULL,
  mbti_type TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('main', 'support')),
  icon_url TEXT,
  image_url TEXT,
  description TEXT NOT NULL,
  traits_json TEXT NOT NULL DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('EI', 'NS', 'TF', 'JP')),
  direct_side TEXT NOT NULL,
  mode_min TEXT NOT NULL CHECK (mode_min IN ('quick', 'medium', 'full')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'medium', 'full')),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers_json TEXT NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS test_results (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  session_id BIGINT NOT NULL UNIQUE REFERENCES test_sessions (id) ON DELETE CASCADE,
  mbti_type TEXT NOT NULL,
  ei_percent INTEGER NOT NULL,
  ns_percent INTEGER NOT NULL,
  tf_percent INTEGER NOT NULL,
  jp_percent INTEGER NOT NULL,
  main_character_id BIGINT REFERENCES characters (id) ON DELETE SET NULL,
  similar_characters_json TEXT NOT NULL DEFAULT '[]',
  summary_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON test_sessions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_results_user_created_at ON test_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_mbti_type ON characters (mbti_type, role_type, priority);
CREATE INDEX IF NOT EXISTS idx_questions_mode_scale ON questions (mode_min, scale_type, active);
