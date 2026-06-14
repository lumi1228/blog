# Blog · Personal Blog System

> A bilingual (Chinese / English) personal blog system built with Next.js 16 + React 19. Features post management, categories & tags, columns, full-text search, Markdown rendering with syntax highlighting, and light/dark theme switching.

[中文版](./README.md)

## ✨ Features

- 📝 **Post Management** — Markdown editor in admin panel with live preview and draft/published status
- 🌐 **Bilingual i18n** — Powered by next-intl; Chinese has no prefix, English uses `/en` subpath, SEO-friendly
- 🗂️ **Categories / Tags / Columns** — Multi-dimensional content organization; columns support chapters and drag-and-drop ordering
- 🔍 **Full-text Search** — Client-side search with fuse.js, triggered via `Ctrl/Cmd + K`
- 🎨 **Markdown Rendering** — react-markdown + remark-gfm, shiki syntax highlighting, copy button, table of contents (TOC)
- 🌓 **Light/Dark Theme** — Follows system preference with manual toggle
- 🔐 **Admin Panel** — `/admin` for managing posts, categories, tags, and columns
- 📊 **SEO & Analytics** — Dynamic metadata, OpenGraph, sitemap, robots, view counter

## 🧰 Tech Stack

### Runtime Environment

| Technology | Version | Description |
|---|---|---|
| [Node.js](https://nodejs.org) | v20.20.2 (`.nvmrc` pins major `20`, requires >= 20.9) | JavaScript runtime environment |
| [npm](https://www.npmjs.com) | v10.8.2 | Node.js package manager |

### Core Dependencies

| Technology | Version | Description |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.3 | React full-stack framework, App Router |
| [React](https://react.dev) | 19.2.4 | UI component library |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Typed superset of JavaScript |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS framework (`@theme` design tokens) |
| [Supabase](https://supabase.com) | @supabase/supabase-js ^2 · @supabase/ssr ^0.10 | Database and authentication |
| [next-intl](https://next-intl.dev) | ^4 | Internationalization (i18n) routing and messages |
| [react-markdown](https://github.com/remarkjs/react-markdown) | ^10 | Markdown rendering (with remark-gfm, rehype-sanitize) |
| [shiki](https://shiki.style) | ^4 | Code syntax highlighting |
| [fuse.js](https://fusejs.io) | ^7 | Client-side fuzzy search |
| [@dnd-kit](https://dndkit.com) | ^6 | Drag-and-drop ordering (column chapters) |

### Development & Testing

| Technology | Description |
|---|---|
| [ESLint](https://eslint.org) | Linting |
| [Vitest](https://vitest.dev) | Unit testing |
| [Testing Library](https://testing-library.com) | React component testing |
| [fast-check](https://fast-check.dev) | Property-based testing |
| [Playwright](https://playwright.dev) | End-to-end (E2E) testing |

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root with your Supabase configuration:

```bash
# Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# Supabase anon / publishable key (used on the client)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# Supabase service role key (server-side only, never expose to the client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` has full database access. Use it server-side only and never commit it. `.env.local` is already in `.gitignore`.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server (requires build first) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:property` | Run property-based tests |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

## 📁 Project Structure

```
blog/
├── app/                          # App Router directory
│   ├── [locale]/                 # Bilingual frontend routes (zh-CN default / en)
│   │   ├── page.tsx              # Home page (post list)
│   │   ├── posts/[slug]/         # Post detail page
│   │   ├── category/[slug]/      # Posts by category
│   │   ├── tag/[slug]/           # Posts by tag
│   │   ├── columns/              # Column list and detail
│   │   ├── about/                # About page
│   │   ├── layout.tsx            # Frontend layout
│   │   └── not-found.tsx         # 404 page
│   ├── admin/                    # Admin panel
│   │   ├── (dashboard)/          # Dashboard (posts/categories/tags/columns)
│   │   └── login/                # Admin login
│   ├── api/                      # Route Handlers (e.g. search index)
│   ├── globals.css               # Global styles and design tokens
│   ├── layout.tsx                # Root layout
│   ├── robots.ts / sitemap.ts    # SEO configuration
│   └── loading.tsx               # Global loading state
├── components/                   # Components
│   ├── admin/                    # Admin management components
│   ├── markdown/                 # Markdown rendering and code blocks
│   ├── search/                   # Search modal and trigger
│   └── ...                       # Navbar, footer, cards, theme toggle, etc.
├── config/                       # Site config (e.g. about page content)
├── i18n/                         # next-intl config (routing / request)
├── lib/                          # Utilities (db, markdown processing, etc.)
├── .docs/                        # Project docs (PRD, deployment guide, etc.)
├── .kiro/                        # Kiro steering rules and config
├── next.config.ts                # Next.js config (next-intl integration)
├── eslint.config.mjs             # ESLint config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies and scripts
```

## 🌐 Internationalization

- Supported locales: `zh-CN` (default), `en`
- Routing strategy: `localePrefix: "as-needed"`; Chinese paths have no prefix (`/about`), English paths are prefixed (`/en/about`)
- Browser language auto-detection is disabled; `zh-CN` is always the default, switchable via the navbar
- Configured in `i18n/routing.ts`, wired up through the next-intl plugin in `next.config.ts`

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🚢 Deployment

Deploying with [Vercel](https://vercel.com) is recommended:

1. Import the repository into Vercel
2. Add the Supabase environment variables under Settings → Environment Variables
3. Deploy — Vercel auto-detects Next.js and handles the build

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more.

## 📄 License

This project is open-sourced under the terms in the [LICENSE](./LICENSE) file.
