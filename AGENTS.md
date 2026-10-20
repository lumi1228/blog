# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router blog using React 19, Tailwind CSS v4, Supabase, and `next-intl`.

- `app/`: routes and server-rendered pages. Public pages live under `app/[locale]/`; admin pages live under `app/admin/`; API handlers live under `app/api/`.
- `components/`: shared UI; keep admin-only components in `components/admin/`, Markdown UI in `components/markdown/`, and search UI in `components/search/`.
- `lib/`: server utilities and domain logic. Put all Supabase queries in `lib/db.ts`.
- `messages/`, `i18n/`: translated UI strings and locale configuration (`zh-CN` and `en`).
- `supabase/`: schema and migration SQL. `public/` contains static assets; `tests/` contains Vitest and Playwright tests.
- Read `CODEMAP.md` before changing architecture; update it when directories or key entry points change.

## Build, Test, and Development Commands

```bash
npm install             # install dependencies (Node 20.9+)
npm run dev             # start the local dev server on port 3000
npm run lint            # run ESLint
npm run test            # run Vitest unit/component tests
npm run test:property   # run fast-check property tests
npm run test:e2e        # build/start the app and run Playwright Chromium tests
npm run build           # create a production Next.js build
npm run start           # serve a completed production build
```

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, semicolons, and the existing ESLint formatting. Use PascalCase for React components and types, camelCase for functions/variables, kebab-case for component filenames, and lower-case route folders. Prefer Server Components; add `"use client"` only for hooks, browser APIs, or interaction. Use CSS variables and tokens from `design-spec.md` rather than hard-coded colors. UI strings belong in both `messages/zh-CN.json` and `messages/en.json`.

## Testing Guidelines

Name unit/component tests `*.test.ts` or `*.test.tsx`; place them in `tests/` or beside the component. Put Playwright specs in `tests/e2e/*.spec.ts`. Run focused tests, then run `npm run lint`, `npm run test`, and relevant E2E coverage before submitting changes.

## Commit & Pull Request Guidelines

Follow Conventional Commits, for example `feat(toc): add scrolling support` or `fix(search): handle empty index`. Keep commits focused. Pull requests should explain user-visible and architectural changes, list validation commands, link issues when applicable, and include screenshots for UI changes. Call out database migrations and required environment variables.

## Security & Configuration

Use `.env.local` for Supabase and gate secrets. Never commit `SUPABASE_SERVICE_ROLE_KEY`, `DOCS_GATE_SECRET`, or other credentials, and never expose server-only values to Client Components. Validate schema changes against `supabase/schema.sql` and migrations before deployment.
