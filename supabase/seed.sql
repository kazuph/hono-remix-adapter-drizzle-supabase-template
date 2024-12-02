-- ユーザーデータの挿入
INSERT INTO users_table (name, age, email) VALUES
  ('山田太郎', 25, 'yamada@example.com'),
  ('佐藤花子', 30, 'sato@example.com'),
  ('鈴木一郎', 35, 'suzuki@example.com'),
  ('田中美咲', 28, 'tanaka@example.com');

-- 投稿データの挿入
INSERT INTO posts_table (title, content, user_id, created_at, updated_at) VALUES
  ('初めての投稿', 'これは私の最初のブログ投稿です。', 1, NOW(), NOW()),
  ('旅行記録', '先週の京都旅行について書きます。', 1, NOW(), NOW()),
  ('料理レシピ', '簡単な和食レシピを紹介します。', 2, NOW(), NOW()),
  ('技術ブログ', 'プログラミングの tips について。', 3, NOW(), NOW()),
  ('読書感想', '最近読んだ本の感想です。', 4, NOW(), NOW()),
  ('休日の過ごし方', '休日の充実した過ごし方について。', 2, NOW(), NOW()),
  ('プロジェクト報告', '最近取り組んでいるプロジェクトについて。', 3, NOW(), NOW()),
  ('日常の出来事', '今日あった面白い出来事について。', 4, NOW(), NOW());
