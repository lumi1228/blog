-- 将专业技能从多行记录迁移为 resume_profile 中的双语多行文本，并移除旧表。
-- 执行前若旧技能表有数据，必须确保 resume_profile 恰好有一行，避免历史数据丢失。
-- --- @ty.aicoding@ ---
ALTER TABLE public.resume_profile ADD COLUMN IF NOT EXISTS skills_zh TEXT;
ALTER TABLE public.resume_profile ADD COLUMN IF NOT EXISTS skills_en TEXT;

DO $$
DECLARE
  skill_count BIGINT;
  profile_count BIGINT;
BEGIN
  IF to_regclass('public.resume_skills') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'SELECT COUNT(*) FROM public.resume_skills' INTO skill_count;
  SELECT COUNT(*) INTO profile_count FROM public.resume_profile;

  IF skill_count > 0 AND profile_count <> 1 THEN
    RAISE EXCEPTION
      '专业技能迁移中止：resume_skills 有 % 条数据，但 resume_profile 有 % 行；请先确保基本信息表恰好一行。',
      skill_count,
      profile_count;
  END IF;

  IF profile_count = 1 THEN
    EXECUTE $migration$
      WITH migrated AS (
        SELECT
          string_agg(content_zh, E'\n' ORDER BY sort, created_at, id) AS skills_zh,
          string_agg(
            COALESCE(NULLIF(BTRIM(content_en), ''), content_zh),
            E'\n' ORDER BY sort, created_at, id
          ) AS skills_en
        FROM public.resume_skills
      )
      UPDATE public.resume_profile AS profile
      SET
        skills_zh = COALESCE(NULLIF(BTRIM(profile.skills_zh), ''), migrated.skills_zh),
        skills_en = COALESCE(NULLIF(BTRIM(profile.skills_en), ''), migrated.skills_en)
      FROM migrated
    $migration$;
  END IF;
END
$$;

DROP TABLE IF EXISTS public.resume_skills;

SELECT id, skills_zh, skills_en
FROM public.resume_profile;
