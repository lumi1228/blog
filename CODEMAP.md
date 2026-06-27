# CODEMAP — Blog Project

> AI working map. Read this before exploring source files.
> Update this file whenever you add directories, new modules, or change architecture.

---

## Project Summary

Personal blog built with **Next.js 16 App Router** + **Supabase** backend.
Supports bilingual content (zh-CN / en), admin dashboard, full-text search, columns (series), categories, tags, Markdown rendering with syntax highlighting, view counter, SEO, and sitemap.

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| i18n | next-intl 4 |
| Database | Supabase (PostgreSQL) |
| Markdown | react-markdown + remark-gfm + rehype-raw/sanitize |
| Syntax highlight | Shiki 4 + @shikijs/rehype |
| Search | Fuse.js (client-side fuzzy) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Unit test | Vitest + @testing-library/react |
| E2E test | Playwright |

---

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:property # Property-based tests (fast-check)
npm run test:e2e     # Playwright e2e tests
```

---

## Environment Variables

| Var | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client+server | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | service_role key; used by `createAdminClient` (resume unlock API). Never expose to client. |

---

## Directory Responsibilities

```
/
├── app/                         # Next.js App Router
│   ├── [locale]/                # Locale-scoped routes (zh-CN / en)
│   │   ├── page.tsx             # Homepage (post list)
│   │   ├── layout.tsx           # Locale layout (navbar + footer)
│   │   ├── not-found.tsx        # 404 page
│   │   ├── about/               # About page (intro + skills + collaboration + contact + 查看简历 entry)
│   │   ├── category/[slug]/     # Category filtered post list
│   │   ├── tag/[slug]/          # Tag filtered post list
│   │   ├── posts/[slug]/        # Post detail (Markdown render + TOC + view counter)
│   │   └── docs/                # Docs knowledge-base sub-site (replaces former /columns)
│   │       ├── layout.tsx       # Docs shell: DocsTopbar (set tabs → first post) + Footer
│   │       ├── page.tsx         # Docs entry: redirects to first set's first post (empty state if none)
│   │       └── [set]/           # A doc set (= Column); [set] redirects to its first post, [set]/[slug] = detail
│   ├── admin/                   # Admin dashboard (no locale prefix)
│   │   ├── login/               # Admin login
│   │   └── (dashboard)/         # Protected admin pages (posts, categories, tags, columns, resume)
│   ├── api/
│   │   └── search-index/        # GET /api/search-index?locale=zh-CN  → SearchIndexResponse
│   ├── layout.tsx               # Root layout (ThemeProvider, fonts)
│   ├── globals.css              # Global styles + Tailwind v4 config
│   ├── robots.ts                # robots.txt generation
│   └── sitemap.ts               # XML sitemap generation
│
├── components/                  # Shared React components
│   ├── admin/                   # Admin-only components
│   │   ├── post-editor.tsx      # Markdown post editor (create/edit)
│   │   ├── post-editor-modal.tsx
│   │   ├── posts-page-client.tsx
│   │   ├── category-manager.tsx
│   │   ├── tag-manager.tsx
│   │   ├── chapter-manager.tsx
│   │   ├── columns-workspace.tsx # Column drag-sort workspace
│   │   ├── columns-left-panel.tsx
│   │   ├── columns-right-panel.tsx
│   │   ├── column-posts-list.tsx
│   │   ├── sidebar.tsx
│   │   ├── markdown-preview.tsx
│   │   ├── delete-post-button.tsx
│   │   ├── resume-manager.tsx   # Resume admin CRUD (4 tabs: basic info / skills / experiences / projects)
│   │   └── toggle-status-button.tsx
│   ├── docs/                    # Docs sub-site components (public)
│   │   ├── docs-topbar.tsx      # Docs shell top bar (set tabs → first post, scoped search, theme/locale)
│   │   └── docs-sidebar.tsx     # Persistent left chapter tree on doc detail pages
│   ├── markdown/                # Markdown render components
│   ├── search/                  # Search UI (SearchModal, SearchInput; supports scope=docs)
│   ├── navbar.tsx               # Server Component navbar wrapper
│   ├── navbar-client.tsx        # Client navbar (theme toggle, mobile menu, locale switch)
│   ├── footer.tsx
│   ├── article-card.tsx         # Post card used on list pages
│   ├── resume-modal.tsx         # About page: 查看简历 entry + 授权码门禁 + preview modal + PDF export (jsPDF + html2canvas-pro)
│   ├── column-card.tsx          # Doc-set card on homepage featured section (links to /docs)
│   ├── pagination.tsx
│   ├── TableOfContents.tsx      # Floating TOC for post detail
│   ├── view-counter.tsx         # Client component: increments + displays view count
│   ├── theme-provider.tsx       # next-themes wrapper
│   └── theme-toggle.tsx
│
├── lib/                         # Server-side logic & utilities
│   ├── db.ts                    # ALL Supabase queries (single source of truth for data access)
│   ├── types.ts                 # Shared TypeScript interfaces (Post, Category, Tag, Column, …)
│   ├── seo.ts                   # generateMetadata helpers
│   ├── mock-data.ts             # Static mock data for dev / tests
│   ├── markdown/
│   │   ├── extractHeadings.ts   # Parse Markdown headings for TOC
│   │   ├── shiki.ts             # Shiki highlighter singleton
│   │   └── slugify.ts           # Heading → anchor slug
│   └── view-counter/            # View count server action / API helper
│
├── i18n/                        # Internationalization config
│   ├── config.ts                # locales = ["zh-CN", "en"], defaultLocale = "zh-CN"
│   ├── routing.ts               # next-intl routing config
│   └── request.ts               # Per-request locale resolution
│
├── messages/                    # i18n message files
│   ├── zh-CN.json               # Chinese UI strings
│   └── en.json                  # English UI strings
│
├── config/                      # App-level config constants
├── utils/                       # Utility helpers
│   └── supabase/                # Supabase client factories (server.ts, client.ts, middleware.ts)
│
├── supabase/                    # DB schema
│   └── *.sql                    # Table definitions
│
└── tests/                       # Test files (Vitest + Playwright)
```

---

## Architecture Rules

### Server vs Client Components
- **Server Components by default** — all `app/[locale]/*/page.tsx` files are Server Components that call `lib/db.ts` directly
- Mark `"use client"` only when using hooks, browser APIs, or interactivity
- `navbar-client.tsx`, `view-counter.tsx`, `search/`, `theme-*.tsx` are Client Components
- Never import `lib/db.ts` from a Client Component

### Data Access
- **Single gateway**: all DB queries live in `lib/db.ts` — do NOT add Supabase calls elsewhere
- Server Components call `lib/db.ts` functions directly (no API routes for page data)
- Client Components fetch from `/api/*` routes when they need data

### Routing
- All public pages use `app/[locale]/` prefix — locale is always the first dynamic segment
- Admin routes use `app/admin/` (no locale prefix, protected by middleware)
- Locale values: `"zh-CN"` (default) | `"en"`
- Docs sub-site lives at `/docs` with its own shell layout; the `Column` DB entity is surfaced as a "doc set". Entry routes (`/docs`, `/docs/[set]`) redirect straight to the first article (TRAE-style direct-to-content); only `/docs/[set]/[slug]` renders the 3-column layout. Legacy `/columns/*` URLs 301-redirect to `/docs/*` via `next.config.ts`.

### Components
- Admin components live in `components/admin/` — never import them in public pages
- Shared public components live directly under `components/`

### Internationalization
- Content (title, excerpt, content) is stored bilingual in DB: `title_zh` / `title_en`
- UI strings use next-intl `useTranslations()` / `getTranslations()` with keys from `messages/*.json`
- Always provide fallback: `name_en || name_zh`

### Testing
- Unit tests: `vitest` — test files in `tests/` or colocated `*.test.ts`
- Property tests: `fast-check` in `tests/properties/`
- E2E tests: Playwright in `tests/*.spec.ts`

---

## Common Task Entry Points

| Task | Key Files |
|---|---|
| Modify navbar | `components/navbar.tsx`, `components/navbar-client.tsx` |
| Change homepage layout | `app/[locale]/page.tsx`, `components/article-card.tsx` |
| Post detail page | `app/[locale]/posts/[slug]/page.tsx`, `components/TableOfContents.tsx`, `components/view-counter.tsx` |
| Markdown rendering | `components/markdown/`, `lib/markdown/shiki.ts` |
| Search feature | `components/search/`, `app/api/search-index/` (supports `?scope=docs`) |
| Categories | `app/[locale]/category/[slug]/page.tsx`, `lib/db.ts → getCategories` |
| Tags | `app/[locale]/tag/[slug]/page.tsx`, `lib/db.ts → getTags` |
| Docs sub-site (= Columns) | `app/[locale]/docs/`, `components/docs/`, `lib/db.ts → getColumnBySlug`, `getColumnsWithFirstPost` |
| Docs search scope | `lib/db.ts → getDocsSearchIndex`, `app/api/search-index/route.ts` |
| Admin post editor | `components/admin/post-editor.tsx`, `app/admin/(dashboard)/` |
| Admin categories/tags | `components/admin/category-manager.tsx`, `components/admin/tag-manager.tsx` |
| Admin columns | `components/admin/columns-workspace.tsx` |
| About page | `app/[locale]/about/page.tsx`, `config/about.ts`, `components/resume-modal.tsx` |
| Resume (about modal + PDF) | `components/resume-modal.tsx`, `lib/db.ts → getResume(locale, client?)`; 授权码门禁，打开时探测门禁状态，数据不随页面下发 |
| Resume unlock API | `app/api/resume/unlock/route.ts`（POST，读 `resume_settings.gate_enabled`：关→直接返回；开→校验 `resume_access_codes` 后用 `createAdminClient` 返回简历）|
| Admin resume | `app/admin/(dashboard)/resume/page.tsx`, `components/admin/resume-manager.tsx`（5 个 Tab：基本信息/技能/经历/项目/访问控制）；证件照上传到 Storage bucket `resume`（public）；门禁开关与授权码存 `resume_settings`/`resume_access_codes` |
| SEO / metadata | `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` |
| URL redirects | `next.config.ts → redirects()` (`/columns/*` → `/docs/*`, 301, both locales) |
| i18n UI strings | `messages/zh-CN.json`, `messages/en.json` |
| Supabase schema | `supabase/*.sql` |
| DB queries | `lib/db.ts` (all queries in one file) |
| View counter | `components/view-counter.tsx`, `lib/view-counter/`, `lib/db.ts → incrementViewCount` |
| Theme (dark/light) | `components/theme-provider.tsx`, `components/theme-toggle.tsx` |

---

## Key Data Types (`lib/types.ts`)

```ts
Post          // id, slug, title, excerpt, content?, coverImage, category, tags[], publishedAt, readingTime, viewCount?, columnId?, chapterId?
Category      // id, name, slug, description?, sort?, articleCount?
Tag           // id, name, slug
Column        // id, slug, sort, title, description?, coverImage?
ColumnChapter // id, columnId, sort, title
ColumnDetail  // extends Column + chapters: (ColumnChapter & { posts: Post[] })[]
ColumnWithFirstPost // extends Column + firstPostSlug: string | null (docs tabs / entry redirect)
SearchIndexEntry   // slug, title, excerpt, tags[], publishedAt, url? (docs entries carry /docs/[set]/[slug])
SearchIndexResponse // locale, generatedAt, entries[]
ResumeProfile      // name, avatar, phone, email, blogUrl, certificate, jobIntention, edu (locale-resolved)
ResumeSkill        // id, content
ResumeExperience   // id, period, company, role, highlights[] (split from newline-separated text)
ResumeProject      // id, name, summary, contributions[] (split from newline-separated text)
ResumeData         // profile + skills[] + experiences[] + projects[] (returned by getResume)
```

---

## AI Working Rules

1. Read this file first — identify the minimal set of files relevant to the task
2. Only read source files you actually need
3. Follow data access rules: all DB queries via `lib/db.ts`
4. Follow Server/Client Component separation
5. When adding new directories or changing architecture, update this CODEMAP.md
