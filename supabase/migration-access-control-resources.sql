-- --- @ty.aicoding@ ---
-- 资源级访问控制迁移脚本（在 Supabase Dashboard -> SQL Editor 执行一次）
-- 目标：简历与知识库独立开关，共享一套可按资源授权的访问码。

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS access_gate_settings (
  resource TEXT PRIMARY KEY CHECK (resource IN ('resume', 'docs')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  session_ttl_seconds INTEGER NOT NULL DEFAULT 604800 CHECK (session_ttl_seconds > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  label TEXT,
  expires_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_code_resources (
  code_id UUID NOT NULL REFERENCES access_codes(id) ON DELETE CASCADE,
  resource TEXT NOT NULL CHECK (resource IN ('resume', 'docs')),
  PRIMARY KEY (code_id, resource)
);

CREATE INDEX IF NOT EXISTS idx_access_codes_enabled ON access_codes(enabled);
CREATE INDEX IF NOT EXISTS idx_access_code_resources_resource
  ON access_code_resources(resource);

-- 旧简历门禁开关迁移为 resume 资源设置；知识库保持默认开启。
DO $$
DECLARE
  legacy_resume_enabled BOOLEAN := true;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'resume_settings'
      AND column_name = 'gate_enabled'
  ) THEN
    EXECUTE 'SELECT COALESCE((SELECT gate_enabled FROM resume_settings LIMIT 1), true)'
      INTO legacy_resume_enabled;
  END IF;

  INSERT INTO access_gate_settings (resource, enabled)
  VALUES ('resume', legacy_resume_enabled), ('docs', true)
  ON CONFLICT (resource) DO NOTHING;
END
$$;

-- 旧授权码原样迁移，并默认授予 resume + docs，保持升级前的访问行为。
DO $$
BEGIN
  IF to_regclass('public.resume_access_codes') IS NOT NULL THEN
    INSERT INTO access_codes (id, code, label, expires_at, enabled, created_at)
    SELECT id, code, label, expires_at, enabled, created_at
    FROM resume_access_codes
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO access_code_resources (code_id, resource)
    SELECT legacy.id, resources.resource
    FROM resume_access_codes AS legacy
    INNER JOIN access_codes AS migrated ON migrated.id = legacy.id
    CROSS JOIN (VALUES ('resume'), ('docs')) AS resources(resource)
    ON CONFLICT (code_id, resource) DO NOTHING;
  END IF;
END
$$;

ALTER TABLE access_gate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_code_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "管理员访问资源门禁设置" ON access_gate_settings;
DROP POLICY IF EXISTS "管理员访问授权码" ON access_codes;
DROP POLICY IF EXISTS "管理员访问授权码范围" ON access_code_resources;

CREATE POLICY "管理员访问资源门禁设置" ON access_gate_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "管理员访问授权码" ON access_codes
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "管理员访问授权码范围" ON access_code_resources
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP TABLE IF EXISTS resume_access_codes;
CREATE TABLE IF NOT EXISTS resume_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_project_tech_stack BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE resume_settings
  ADD COLUMN IF NOT EXISTS show_project_tech_stack BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE resume_settings DROP COLUMN IF EXISTS gate_enabled;
ALTER TABLE resume_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "管理员访问简历门禁设置" ON resume_settings;
DROP POLICY IF EXISTS "管理员访问简历展示设置" ON resume_settings;
CREATE POLICY "管理员访问简历展示设置" ON resume_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
