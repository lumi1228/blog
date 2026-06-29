-- ============================================
-- 文章封面体系迁移脚本（在 Supabase Dashboard → SQL Editor 执行一次）
-- 可重复运行：ADD COLUMN IF NOT EXISTS / ON CONFLICT DO NOTHING 保证幂等。
-- 功能：
--   ① categories.cover_image      —— 分类默认封面（前台文章无自有封面时回退）
--   ② column_chapters.cover_image —— 知识库章节默认封面（同上，优先级高于分类）
--   ③ 确保 blog-images 公开 Storage bucket 及读写策略存在（封面与正文图共用，covers/ 路径）
-- 说明：封面列允许为空，「必填」仅在后台表单层做校验（不加 NOT NULL，便于存量数据手动补齐）。
-- 前置：需先执行 schema.sql 完成基础表结构初始化。
-- ============================================

-- ============================================
-- ① 分类默认封面
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- ============================================
-- ② 知识库章节默认封面
-- ============================================
ALTER TABLE column_chapters ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- ============================================
-- ③ blog-images Storage bucket（公开读，认证写）
-- ============================================
-- 正文内图片与封面图共用此 bucket：正文图走 posts/ 路径，封面走 covers/ 路径。
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "管理员上传博客图片" ON storage.objects;
DROP POLICY IF EXISTS "管理员更新博客图片" ON storage.objects;
DROP POLICY IF EXISTS "管理员删除博客图片" ON storage.objects;

CREATE POLICY "管理员上传博客图片" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "管理员更新博客图片" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');
CREATE POLICY "管理员删除博客图片" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'blog-images');
