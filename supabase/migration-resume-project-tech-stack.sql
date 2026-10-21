-- 为项目经验增加双语技术栈，并提供整份简历的技术栈展示总开关。
-- 开关关闭时前台不返回技术栈；开启时仅展示当前语言下的非空内容。
-- --- @ty.aicoding@ ---
ALTER TABLE public.resume_projects ADD COLUMN IF NOT EXISTS tech_stack_zh TEXT;
ALTER TABLE public.resume_projects ADD COLUMN IF NOT EXISTS tech_stack_en TEXT;
ALTER TABLE public.resume_settings ADD COLUMN IF NOT EXISTS show_project_tech_stack BOOLEAN NOT NULL DEFAULT TRUE;

SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'resume_projects' AND column_name IN ('tech_stack_zh', 'tech_stack_en'))
    OR (table_name = 'resume_settings' AND column_name = 'show_project_tech_stack')
  )
ORDER BY table_name, column_name;
