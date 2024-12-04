-- ユーザーデータの挿入
INSERT INTO users (id, name, email, bio, avatar_url, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '山田太郎', 'yamada@example.com', 'フルスタックエンジニア。TypeScriptとRustが好きです。', 'https://github.com/yamada.png', NOW(), NOW()),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', '佐藤花子', 'sato@example.com', 'プロダクトマネージャー。UI/UXデザインに興味があります。', 'https://github.com/sato.png', NOW(), NOW()),
  ('7ba7b810-9dad-11d1-80b4-00c04fd430c8', '鈴木一郎', 'suzuki@example.com', 'バックエンドエンジニア。インフラとセキュリティが専門です。', 'https://github.com/suzuki.png', NOW(), NOW()),
  ('8ba7b810-9dad-11d1-80b4-00c04fd430c8', '田中美咲', 'tanaka@example.com', 'フロントエンドエンジニア。アクセシビリティに関心があります。', 'https://github.com/tanaka.png', NOW(), NOW());

-- 投稿データの挿入
INSERT INTO posts (id, title, content, user_id, created_at, updated_at)
VALUES
  ('018df28a-0000-7000-8000-000000000001', '初めての投稿', 'はじめまして！これは私の最初のブログ投稿です。技術的な話題を中心に投稿していきたいと思います。', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('018df28a-0000-7000-8000-000000000002', 'TypeScriptの型システム入門', 'TypeScriptの型システムについて、基礎から応用まで解説します。今回は特にジェネリクスについて詳しく説明します。', '550e8400-e29b-41d4-a716-446655440000', NOW(), NOW()),
  ('018df28a-0000-7000-8000-000000000003', 'プロジェクトマネジメントのコツ', 'チーム開発を円滑に進めるためのプロジェクトマネジメントのコツをご紹介します。スクラムの実践例を交えて説明します。', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', NOW(), NOW()),
  ('018df28a-0000-7000-8000-000000000004', 'インフラ設計のベストプラクティス', 'スケーラブルなインフラ設計のベストプラクティスについて解説します。コスト最適化の観点も含めて説明します。', '7ba7b810-9dad-11d1-80b4-00c04fd430c8', NOW(), NOW()),
  ('018df28a-0000-7000-8000-000000000005', 'アクセシブルなUIの作り方', 'Webアプリケーションをよりアクセシブルにするためのテクニックを紹介します。WAI-ARIAの活用例も含みます。', '8ba7b810-9dad-11d1-80b4-00c04fd430c8', NOW(), NOW());
