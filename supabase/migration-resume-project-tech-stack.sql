-- 为项目经验增加双语技术栈，并提供整份简历的技术栈展示总开关。
-- 开关关闭时前台不返回技术栈；开启时仅展示当前语言下的非空内容。
-- --- @ty.aicoding@ ---
ALTER TABLE resume_projects
  ADD COLUMN IF NOT EXISTS tech_stack_zh TEXT,
  ADD COLUMN IF NOT EXISTS tech_stack_en TEXT;

ALTER TABLE resume_settings
  ADD COLUMN IF NOT EXISTS show_project_tech_stack BOOLEAN NOT NULL DEFAULT TRUE;
