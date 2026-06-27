-- ============================================
-- 主站头像池迁移脚本（在 Supabase Dashboard → SQL Editor 执行一次）
-- 可重复运行：CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING 保证幂等。
-- 功能：① site_avatars 头像池表  ② avatars 公开 Storage bucket  ③ RLS 策略
-- 用途：主页、关于页服务端随机展示一张，与简历证件照（resume_profile.avatar）完全独立。
-- 前置：需先执行 schema.sql 完成基础表结构初始化。
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ① site_avatars — 主站头像池
-- ============================================
-- 存储多张头像，前台每次请求服务端随机选取一张 enabled=true 的头像展示。
-- 与简历证件照完全独立：用途不同、独立 Storage bucket、独立后台管理入口。
CREATE TABLE IF NOT EXISTS site_avatars (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url        TEXT NOT NULL,
  label      TEXT,              -- 可选备注，如「春节版」「日常版」
  enabled    BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_avatars_enabled ON site_avatars(enabled);

-- RLS：主站页面需匿名读取已启用头像；管理员完全操作。
ALTER TABLE site_avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公开读取启用的主站头像" ON site_avatars;
DROP POLICY IF EXISTS "管理员完全访问主站头像" ON site_avatars;

CREATE POLICY "公开读取启用的主站头像" ON site_avatars
  FOR SELECT USING (enabled = true);

CREATE POLICY "管理员完全访问主站头像" ON site_avatars
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ② avatars Storage bucket（公开，独立于 resume bucket）
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "管理员上传主站头像" ON storage.objects;
DROP POLICY IF EXISTS "管理员更新主站头像" ON storage.objects;
DROP POLICY IF EXISTS "管理员删除主站头像" ON storage.objects;

CREATE POLICY "管理员上传主站头像" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "管理员更新主站头像" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "管理员删除主站头像" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');
