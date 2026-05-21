-- ============================================
-- VOCAB MASTER - Database Schema
-- Supabase PostgreSQL
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Bảng Users (tuỳ chọn nếu muốn add authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Vocabulary (từ vựng)
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  phonetic TEXT,
  meaning TEXT NOT NULL,
  part_of_speech TEXT DEFAULT '',
  example_sentence TEXT NOT NULL,
  cloze_sentence TEXT NOT NULL,
  audio_us TEXT,
  audio_uk TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng User Progress (tiến độ học tập)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Có thể là UUID hoặc string ID từ browser
  vocab_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  learning_level INT DEFAULT 1 CHECK (learning_level >= 1 AND learning_level <= 5),
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);

-- ============================================
-- Indexes để tối ưu performance
-- ============================================

CREATE INDEX idx_vocabulary_word ON vocabulary(word);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_vocab_id ON user_progress(vocab_id);
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review_date);
CREATE INDEX idx_user_progress_learning_level ON user_progress(learning_level);

-- ============================================
-- Views cho thống kê (tuỳ chọn)
-- ============================================

CREATE VIEW user_statistics AS
SELECT
  user_id,
  COUNT(*) as total_words,
  AVG(learning_level) as average_level,
  SUM(CASE WHEN learning_level = 5 THEN 1 ELSE 0 END) as mastered_count,
  SUM(CASE WHEN learning_level = 1 THEN 1 ELSE 0 END) as level_1_count,
  MAX(updated_at) as last_updated
FROM user_progress
GROUP BY user_id;

-- ============================================
-- Seed Data (dữ liệu mẫu)
-- ============================================

-- Thêm một số từ mẫu
INSERT INTO vocabulary (word, phonetic, meaning, example_sentence, cloze_sentence)
VALUES 
  ('aberration', '/ˌæbəˈreɪʃn/', 'Sự lệch lạc, sự bất thường', 'This behavior is an aberration from his usual conduct.', 'This behavior is an ___ from his usual conduct.'),
  ('abscond', '/əbˈskɒnd/', 'Bỏ trốn, chạy trốn', 'The embezzler absconded with the company funds.', 'The embezzler ___ with the company funds.'),
  ('abstract', '/ˈæbstrækt/', 'Trừu tượng, không cụ thể', 'The abstract concept of justice varies across cultures.', 'The ___ concept of justice varies across cultures.'),
  ('accrue', '/əˈkruː/', 'Tích lũy, thêm vào theo thời gian', 'Interest will accrue on your savings account.', 'Interest will ___ on your savings account.'),
  ('acute', '/əˈkjuːt/', 'Cấp tính, sắc cảnh', 'She developed an acute illness that required hospitalization.', 'She developed an ___ illness that required hospitalization.');

-- ============================================
-- Triggers để tự động cập nhật updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vocabulary_updated_at
BEFORE UPDATE ON vocabulary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
