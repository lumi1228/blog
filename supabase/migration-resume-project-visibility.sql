-- 为项目经验增加公开简历展示开关；历史数据与新建数据默认展示。
-- --- @ty.aicoding@ ---
ALTER TABLE resume_projects
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
