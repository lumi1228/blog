-- 为工作经历增加前台简历展示开关；历史数据与新建数据默认展示。
-- --- @ty.aicoding@ ---
ALTER TABLE public.resume_experiences ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'resume_experiences'
  AND column_name = 'is_visible';
