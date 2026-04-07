PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id TEXT NOT NULL UNIQUE,
  username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('EI', 'NS', 'TF', 'JP')),
  direct_side TEXT NOT NULL,
  mode_min TEXT NOT NULL CHECK (mode_min IN ('quick', 'medium', 'full')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'medium', 'full')),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers_json TEXT NOT NULL DEFAULT '[]',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id INTEGER NOT NULL UNIQUE,
  mbti_type TEXT NOT NULL,
  ei_percent INTEGER NOT NULL,
  ns_percent INTEGER NOT NULL,
  tf_percent INTEGER NOT NULL,
  jp_percent INTEGER NOT NULL,
  main_character_id INTEGER,
  similar_characters_json TEXT NOT NULL DEFAULT '[]',
  summary_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES test_sessions (id) ON DELETE CASCADE,
  FOREIGN KEY (main_character_id) REFERENCES characters (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON test_sessions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_results_user_created_at ON test_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_mbti_type ON characters (mbti_type, role_type, priority);
CREATE INDEX IF NOT EXISTS idx_questions_mode_scale ON questions (mode_min, scale_type, active);
