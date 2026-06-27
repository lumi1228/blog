-- ============================================
-- 博客系统数据库 Schema
-- 执行位置：Supabase Dashboard → SQL Editor
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 分类表
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 多语言字段
  name_zh TEXT NOT NULL,
  name_en TEXT,
  description_zh TEXT,
  description_en TEXT
);

-- 插入默认分类
INSERT INTO categories (slug, sort, name_zh, name_en, description_zh, description_en) VALUES
  ('tech', 1, '技术', 'Tech', '前端、后端、工程化的技术笔记', 'Notes on frontend, backend, and engineering'),
  ('design', 2, '设计', 'Design', '设计思考与视觉表达', 'Design thinking and visual expression'),
  ('life', 3, '生活', 'Life', '成长感悟与生活片段', 'Growth reflections and life moments')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. 标签表
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 多语言字段
  name_zh TEXT NOT NULL,
  name_en TEXT
);

-- 插入默认标签
INSERT INTO tags (slug, name_zh, name_en) VALUES
  ('react', 'React', 'React'),
  ('nextjs', 'Next.js', 'Next.js'),
  ('frontend', '前端', 'Frontend'),
  ('architecture', '架构', 'Architecture'),
  ('design-system', '设计系统', 'Design System'),
  ('color', '色彩', 'Color'),
  ('growth', '成长', 'Growth'),
  ('women-in-tech', '女性开发者', 'Women in Tech'),
  ('typescript', 'TypeScript', 'TypeScript'),
  ('css', 'CSS', 'CSS')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. 文章表
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 1,
  -- 多语言字段
  title_zh TEXT NOT NULL,
  title_en TEXT,
  excerpt_zh TEXT,
  excerpt_en TEXT,
  content_zh TEXT,
  content_en TEXT,
  seo_title_zh TEXT,
  seo_title_en TEXT,
  seo_description_zh TEXT,
  seo_description_en TEXT,
  -- 可用语言
  available_locales TEXT[] DEFAULT ARRAY['zh-CN'],
  -- 专栏关联
  column_id UUID REFERENCES columns(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES column_chapters(id) ON DELETE SET NULL,
  column_order INTEGER,
  show_in_list BOOLEAN DEFAULT false
);

-- ============================================
-- 4. 专栏表
-- ============================================
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 多语言字段
  title_zh TEXT NOT NULL,
  title_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  cover_image TEXT
);

-- ============================================
-- 5. 专栏章节目
-- ============================================
CREATE TABLE IF NOT EXISTS column_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  sort INTEGER DEFAULT 0,
  -- 多语言字段
  title_zh TEXT NOT NULL,
  title_en TEXT
);

-- ============================================
-- 6. 文章-标签关联表（多对多）
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- 7. 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_column_id ON posts(column_id);
CREATE INDEX IF NOT EXISTS idx_posts_column_order ON posts(column_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_columns_slug ON columns(slug);
CREATE INDEX IF NOT EXISTS idx_column_chapters_column_id ON column_chapters(column_id);

-- ============================================
-- 8. 自动更新 updated_at 触发器
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Row Level Security (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_chapters ENABLE ROW LEVEL SECURITY;

-- 前台：所有人可读已发布文章
CREATE POLICY "公开读取已发布文章" ON posts
  FOR SELECT USING (status = 'published');

-- 前台：所有人可读分类和标签
CREATE POLICY "公开读取分类" ON categories
  FOR SELECT USING (true);

CREATE POLICY "公开读取标签" ON tags
  FOR SELECT USING (true);

CREATE POLICY "公开读取文章标签关联" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "公开读取专栏" ON columns
  FOR SELECT USING (true);

CREATE POLICY "公开读取专栏章节" ON column_chapters
  FOR SELECT USING (true);

-- 后台：认证用户可执行所有操作
CREATE POLICY "管理员完全访问文章" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理员完全访问分类" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理员完全访问标签" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理员完全访问文章标签" ON post_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理员完全访问专栏" ON columns
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "管理员完全访问专栏章节" ON column_chapters
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 10. 插入示例文章数据
-- ============================================
DO $$
DECLARE
  tech_id UUID;
  design_id UUID;
  life_id UUID;
  post1_id UUID;
  post2_id UUID;
  post3_id UUID;
  post4_id UUID;
  tag_react UUID;
  tag_nextjs UUID;
  tag_frontend UUID;
  tag_architecture UUID;
  tag_design_system UUID;
  tag_color UUID;
  tag_growth UUID;
  tag_women UUID;
BEGIN
  -- 获取分类 ID
  SELECT id INTO tech_id FROM categories WHERE slug = 'tech';
  SELECT id INTO design_id FROM categories WHERE slug = 'design';
  SELECT id INTO life_id FROM categories WHERE slug = 'life';

  -- 获取标签 ID
  SELECT id INTO tag_react FROM tags WHERE slug = 'react';
  SELECT id INTO tag_nextjs FROM tags WHERE slug = 'nextjs';
  SELECT id INTO tag_frontend FROM tags WHERE slug = 'frontend';
  SELECT id INTO tag_architecture FROM tags WHERE slug = 'architecture';
  SELECT id INTO tag_design_system FROM tags WHERE slug = 'design-system';
  SELECT id INTO tag_color FROM tags WHERE slug = 'color';
  SELECT id INTO tag_growth FROM tags WHERE slug = 'growth';
  SELECT id INTO tag_women FROM tags WHERE slug = 'women-in-tech';

  -- 文章 1
  INSERT INTO posts (slug, status, published_at, category_id, reading_time, view_count,
    title_zh, excerpt_zh, content_zh, available_locales)
  VALUES (
    'react-19-use-hook-data-fetching',
    'published', NOW() - INTERVAL '6 days', tech_id, 8, 1245,
    '用 React 19 的 use() Hook 重新思考数据获取',
    'React 19 引入了 use() hook，它改变了我们在组件中处理异步数据的方式。本文深入探讨它的工作原理、最佳实践以及与 Suspense 的配合。',
    E'## 前言\n\nReact 19 的 `use()` hook 是一个里程碑式的 API。它让组件可以直接"读取"Promise 或 Context，无需通过 `useEffect` + `useState` 的组合。\n\n## 基础用法\n\n```tsx\nimport { use } from ''react'';\n\nfunction UserProfile({ userPromise }) {\n  const user = use(userPromise);\n  return <div>{user.name}</div>;\n}\n```\n\n## 与 Suspense 的配合\n\n`use()` 会在 Promise 未 resolve 时抛出，交由上层 Suspense 捕获。\n\n## 最佳实践\n\n1. 不要在客户端组件中创建 Promise（会导致重复请求）\n2. 优先在 Server Component 中 `await` 数据\n3. 对于需要流式传输的场景，从 Server 传递 Promise 到 Client\n\n## 总结\n\n`use()` 不是 `useEffect` 的替代，而是配合 Suspense 使用的新范式。',
    ARRAY['zh-CN']
  ) RETURNING id INTO post1_id;

  -- 文章 2
  INSERT INTO posts (slug, status, published_at, category_id, reading_time, view_count,
    title_zh, excerpt_zh, content_zh, available_locales)
  VALUES (
    'build-personal-blog-from-scratch',
    'published', NOW() - INTERVAL '8 days', tech_id, 12, 892,
    '从零搭建个人博客：技术选型与架构设计',
    '记录自己搭建博客的完整过程，包括为什么选择 Next.js 16 + Supabase 的组合，以及在设计系统上的思考。',
    E'## 为什么再造一个博客\n\n市面上博客平台很多，但都不是"我的"。自建博客意味着：\n\n- 完全的数据控制权\n- 自由的设计表达\n- 技术栈与日常工作一致\n\n## 技术选型\n\n| 维度 | 选择 | 理由 |\n|------|------|------|\n| 框架 | Next.js 16 | App Router + SSG，SEO 友好 |\n| 数据库 | Supabase | PostgreSQL + 开箱即用的认证 |\n| 样式 | Tailwind CSS v4 | 快速迭代，与设计 Token 映射 |\n\n## 设计系统优先\n\n在写任何页面前，我先定义了完整的设计规范。这样后续新增页面时风格不会漂移。',
    ARRAY['zh-CN']
  ) RETURNING id INTO post2_id;

  -- 文章 3
  INSERT INTO posts (slug, status, published_at, category_id, reading_time, view_count,
    title_zh, excerpt_zh, content_zh, available_locales)
  VALUES (
    'color-theory-in-dark-theme-design',
    'published', NOW() - INTERVAL '10 days', design_id, 6, 567,
    '设计系统中的色彩理论：如何让暗色主题不只是「黑底白字」',
    '暗色主题不是简单地反转颜色。本文分享我在设计博客暗色主题时的色彩选择逻辑，以及如何兼顾美感与可读性。',
    E'## 暗色主题的常见误区\n\n很多人做暗色主题就是把背景改成黑色、文字改成白色。但这样做出来的界面往往显得廉价、刺眼。\n\n## 我的色彩原则\n\n### 1. 不用纯黑\n\n主背景使用 `#0B0D11` 而非 `#000000`。\n\n### 2. 不用纯白文字\n\n主文字使用 `#E8E6E3`（暖白）。\n\n### 3. 用光晕代替阴影\n\n暗色模式下，阴影几乎不可见。使用微弱的色彩光晕（glow）来表达层级。',
    ARRAY['zh-CN']
  ) RETURNING id INTO post3_id;

  -- 文章 4
  INSERT INTO posts (slug, status, published_at, category_id, reading_time, view_count,
    title_zh, excerpt_zh, content_zh, available_locales)
  VALUES (
    'finding-voice-as-female-developer',
    'published', NOW() - INTERVAL '14 days', life_id, 5, 2103,
    '作为女性开发者，我如何在技术社区找到自己的声音',
    '分享我作为女性开发者的成长经历，从最初的不自信到逐渐建立自己的技术影响力，以及一路上遇到的人和事。',
    E'## 初入行业\n\n刚毕业进入互联网公司时，整个部门只有我一个女生。开会时我很少发言，怕自己的观点不够"技术"。\n\n## 改变的契机\n\n一次技术分享会上，我鼓起勇气讲了自己做的一个性能优化方案。同事的反馈让我意识到：技术不分性别，思考的深度才是关键。\n\n## 给同路人的建议\n\n1. **不要自我设限** — 不要因为"我是女生"就默认自己不适合做某些事\n2. **积极输出** — 写博客、做分享，让你的工作被看见\n3. **找到同伴** — 加入女性开发者社区，互相支持',
    ARRAY['zh-CN']
  ) RETURNING id INTO post4_id;

  -- 关联标签
  INSERT INTO post_tags (post_id, tag_id) VALUES
    (post1_id, tag_react),
    (post1_id, tag_frontend),
    (post2_id, tag_nextjs),
    (post2_id, tag_architecture),
    (post3_id, tag_design_system),
    (post3_id, tag_color),
    (post4_id, tag_growth),
    (post4_id, tag_women);
END $$;


-- ============================================
-- 11. 阅读量自增 RPC 函数
-- ============================================
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. 简历模块（关于我页面 / 后台维护）
-- ============================================

-- 12.1 简历基本信息（单例表，仅一行）
CREATE TABLE IF NOT EXISTS resume_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  avatar TEXT,                       -- 证件照 URL
  phone TEXT,
  email TEXT,
  blog_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 多语言字段
  name_zh TEXT NOT NULL,
  name_en TEXT,
  certificate_zh TEXT,
  certificate_en TEXT,
  job_intention_zh TEXT,
  job_intention_en TEXT,
  edu_zh TEXT,                       -- 毕业院校整段，如「统招本科，YYYY.MM-YYYY.MM，XX 大学，XX 专业」
  edu_en TEXT
);

-- 12.2 专业技能
CREATE TABLE IF NOT EXISTS resume_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content_zh TEXT NOT NULL,
  content_en TEXT
);

-- 12.3 工作经历
CREATE TABLE IF NOT EXISTS resume_experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort INTEGER DEFAULT 0,
  period TEXT,                       -- 如「2021.09-至今」
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_zh TEXT NOT NULL,
  company_en TEXT,
  role_zh TEXT,
  role_en TEXT,
  highlights_zh TEXT,                -- 要点，按换行符分隔，每行一条
  highlights_en TEXT
);

-- 12.4 项目经验
CREATE TABLE IF NOT EXISTS resume_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name_zh TEXT NOT NULL,
  name_en TEXT,
  summary_zh TEXT,
  summary_en TEXT,
  contributions_zh TEXT,             -- 核心贡献，按换行符分隔，每行一条
  contributions_en TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_resume_skills_sort ON resume_skills(sort);
CREATE INDEX IF NOT EXISTS idx_resume_experiences_sort ON resume_experiences(sort);
CREATE INDEX IF NOT EXISTS idx_resume_projects_sort ON resume_projects(sort);

-- 自动更新 updated_at
CREATE TRIGGER resume_profile_updated_at
  BEFORE UPDATE ON resume_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE resume_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "管理员完全访问简历基本信息" ON resume_profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员完全访问简历技能" ON resume_skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员完全访问简历工作经历" ON resume_experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员完全访问简历项目经验" ON resume_projects FOR ALL USING (auth.role() = 'authenticated');
-- 说明：简历表「不」开放公开 SELECT —— 前台简历预览受授权码门禁保护，
-- 由服务端接口 /api/resume/unlock 使用 service_role 客户端读取（绕过 RLS）。
-- 因此匿名用户无法直接查询简历表，避免电话/邮箱等信息被绕过门禁获取。

-- 若你之前已执行过含「公开读取简历…」策略的旧版本，请在 Supabase SQL Editor 执行以下语句移除公开读：
--   DROP POLICY IF EXISTS "公开读取简历基本信息" ON resume_profile;
--   DROP POLICY IF EXISTS "公开读取简历技能" ON resume_skills;
--   DROP POLICY IF EXISTS "公开读取简历工作经历" ON resume_experiences;
--   DROP POLICY IF EXISTS "公开读取简历项目经验" ON resume_projects;

-- ============================================
-- 12.5 证件照存储（Supabase Storage 公开 bucket）
-- ============================================
-- 证件照不再放代码仓库，改为后台上传到 Storage，resume_profile.avatar 存公开 URL。
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume', 'resume', true)
ON CONFLICT (id) DO NOTHING;

-- 允许已认证用户（后台）上传/更新/删除 resume bucket 内对象；公开可读由 bucket public=true 提供。
CREATE POLICY "管理员上传简历资源" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resume');
CREATE POLICY "管理员更新简历资源" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'resume');
CREATE POLICY "管理员删除简历资源" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'resume');

-- ============================================
-- 12.6 简历访问控制（门禁开关 + 授权码，后台维护）
-- ============================================
-- 门禁总开关（单例）：true = 需授权码才能查看简历；false = 简历公开直接可看。
CREATE TABLE IF NOT EXISTS resume_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 授权码（明文存储，仅后台可读写）：可设备注、到期日（空=长期）、单条启停。
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

-- 仅认证用户（后台）可读写；前台不开放，解锁接口用 service_role 读取。
CREATE POLICY "管理员访问简历门禁设置" ON resume_settings
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "管理员访问简历授权码" ON resume_access_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 13. 简历初始数据
-- ============================================
-- 简历初始数据含个人隐私信息，不在此脚本中维护。
-- 现网数据已写入数据库，日常通过后台「/admin/resume」编辑即可。
-- 如需在新环境初始化，可在后台手动录入，或临时编写本地 seed（注意勿提交个人信息到 Git）。
