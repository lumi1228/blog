-- ============================================
-- 简历门禁迁移脚本（在 Supabase Dashboard → SQL Editor 执行一次）
-- 可重复运行：CREATE POLICY 前均先 DROP IF EXISTS。
-- 内容：① 移除简历表公开读策略  ② 证件照存储 bucket  ③ 访问控制表（门禁开关 + 授权码）
-- 前置：resume_profile/resume_skills/resume_experiences/resume_projects 四张表已存在。
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- ① 收紧 RLS：移除简历表的公开读策略 ----------
DROP POLICY IF EXISTS "公开读取简历基本信息" ON resume_profile;
DROP POLICY IF EXISTS "公开读取简历技能" ON resume_skills;
DROP POLICY IF EXISTS "公开读取简历工作经历" ON resume_experiences;
DROP POLICY IF EXISTS "公开读取简历项目经验" ON resume_projects;
-- 保留（确保存在）：仅认证用户可读写，前台经 /api/resume/unlock 用 service_role 读取
ALTER TABLE resume_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "管理员完全访问简历基本信息" ON resume_profile;
DROP POLICY IF EXISTS "管理员完全访问简历技能" ON resume_skills;
DROP POLICY IF EXISTS "管理员完全访问简历工作经历" ON resume_experiences;
DROP POLICY IF EXISTS "管理员完全访问简历项目经验" ON resume_projects;
CREATE POLICY "管理员完全访问简历基本信息" ON resume_profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员完全访问简历技能" ON resume_skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员完全访问简历工作经历" ON resume_experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员完全访问简历项目经验" ON resume_projects FOR ALL USING (auth.role() = 'authenticated');

-- ---------- ② 证件照存储（公开 bucket: resume） ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume', 'resume', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "管理员上传简历资源" ON storage.objects;
DROP POLICY IF EXISTS "管理员更新简历资源" ON storage.objects;
DROP POLICY IF EXISTS "管理员删除简历资源" ON storage.objects;
CREATE POLICY "管理员上传简历资源" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resume');
CREATE POLICY "管理员更新简历资源" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'resume');
CREATE POLICY "管理员删除简历资源" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'resume');

-- ---------- ③ 访问控制表（门禁开关 + 授权码） ----------
CREATE TABLE IF NOT EXISTS resume_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  label TEXT,
  expires_at TIMESTAMPTZ,          -- 空 = 长期有效
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_access_codes_enabled ON resume_access_codes(enabled);

-- 默认插入一行门禁设置（默认开启门禁）
INSERT INTO resume_settings (gate_enabled)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM resume_settings);

ALTER TABLE resume_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_access_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "管理员访问简历门禁设置" ON resume_settings;
DROP POLICY IF EXISTS "管理员访问简历授权码" ON resume_access_codes;
CREATE POLICY "管理员访问简历门禁设置" ON resume_settings
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员访问简历授权码" ON resume_access_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- （可选）顺手加一个初始授权码，避免门禁开着却无码导致锁死：
-- INSERT INTO resume_access_codes (code, label, enabled) VALUES ('改成你的码', '默认码', true);
