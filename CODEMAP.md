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

## Directory Responsibilities

```
/
├── app/                         # Next.js App Router
│   ├── [locale]/                # Locale-scoped routes (zh-CN / en)
│   │   ├── page.tsx             # Homepage (post list)
│   │   ├── layout.tsx           # Locale layout (navbar + footer)
│   │   ├── not-found.tsx        # 404 page
│   │   ├── about/               # About page
│   │   ├── category/[slug]/     # Category filtered post list
│   │   ├── tag/[slug]/          # Tag filtered post list
│   │   ├── posts/[slug]/        # Post detail (Markdown render + TOC + view counter)
│   │   └── columns/[slug]/      # Column (series) detail
│   ├── admin/                   # Admin dashboard (no locale prefix)
│   │   ├── login/               # Admin login
│   │   └── (dashboard)/         # Protected admin pages (posts, categories, tags, columns)
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
│   │   └── toggle-status-button.tsx
│   ├── markdown/                # Markdown render components
│   ├── search/                  # Search UI (SearchModal, SearchInput)
│   ├── navbar.tsx               # Server Component navbar wrapper
│   ├── navbar-client.tsx        # Client navbar (theme toggle, mobile menu, locale switch)
│   ├── footer.tsx
│   ├── article-card.tsx         # Post card used on list pages
│   ├── pagination.tsx
│   ├── TableOfContents.tsx      # Floating TOC for post detail
│   ├── view-counter.tsx         # Client component: increments + displays view count
│   ├── column-sidebar.tsx       # Column navigation sidebar
│   ├── column-chapters-list.tsx
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
| Search feature | `components/search/`, `app/api/search-index/` |
| Categories | `app/[locale]/category/[slug]/page.tsx`, `lib/db.ts → getCategories` |
| Tags | `app/[locale]/tag/[slug]/page.tsx`, `lib/db.ts → getTags` |
| Columns (series) | `app/[locale]/columns/[slug]/page.tsx`, `components/column-sidebar.tsx`, `lib/db.ts → getColumnBySlug` |
| Admin post editor | `components/admin/post-editor.tsx`, `app/admin/(dashboard)/` |
| Admin categories/tags | `components/admin/category-manager.tsx`, `components/admin/tag-manager.tsx` |
| Admin columns | `components/admin/columns-workspace.tsx` |
| SEO / metadata | `lib/seo.ts`, `app/sitemap.ts`, `app/robots.ts` |
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
SearchIndexEntry   // slug, title, excerpt, tags[], publishedAt
SearchIndexResponse // locale, generatedAt, entries[]
```

---

## AI Working Rules

1. Read this file first — identify the minimal set of files relevant to the task
2. Only read source files you actually need
3. Follow data access rules: all DB queries via `lib/db.ts`
4. Follow Server/Client Component separation
5. When adding new directories or changing architecture, update this CODEMAP.md
