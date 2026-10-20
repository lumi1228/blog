---
name: project-codemap
description: This skill should be used when working on this blog project and the task requires understanding project structure, locating relevant files, modifying features, adding pages or components, debugging cross-file behavior, refactoring modules, reviewing architecture, updating tests, working with internationalization, Supabase, Markdown rendering, search, admin features, columns, categories, tags, SEO, sitemap, view counter, theme, navbar, or reducing unnecessary code exploration. Load this skill before inspecting any implementation files.
---

# Project Codemap Skill

## Workflow

When this skill is activated:

1. **Read CODEMAP.md first**
   - File: `CODEMAP.md` (project root)
   - This is the single source of truth for project structure, architecture rules, data types, and task entry points

2. **Identify the minimal relevant file set**
   - Use the "Common Task Entry Points" table in CODEMAP.md to find key files
   - Use the "Directory Responsibilities" section to understand what each folder owns
   - Do NOT read entire directories — only the files actually needed for the task

3. **Read only necessary source files**
   - Prioritize files listed in CODEMAP.md for the specific task
   - Avoid reading files that are not directly related to the task

4. **Apply architecture rules before writing code**
   - Server vs Client Component separation
   - All DB queries go through `lib/db.ts` only
   - i18n: content bilingual in DB, UI strings in `messages/*.json`
   - Admin components stay in `components/admin/`

5. **After completing the task**
   - Compare the actual project structure against CODEMAP.md
   - If any directories were added/removed, key files changed, or architecture rules were modified, **update CODEMAP.md immediately** — do not just suggest it
   - Only update the affected sections; do not rewrite the entire file

## Collaboration with Other Skills

### Related Skills
- **design-spec**: Frontend styling, design system, UI consistency
  - Load `design-spec` when the task involves styling, UI implementation, or component visual design
  - Load `project-codemap` when the task requires understanding project structure or file location
  - Both can be loaded together for tasks like "create a new styled component" or "add a new page with specific design"
  
**Division of Responsibility**:
- `project-codemap` → Project structure, module responsibilities, file location, architecture rules
- `design-spec` → Styling rules, color system, typography, animations, component style patterns

**Example Collaboration**:
```
User: "Create a new article search component on the homepage"

project-codemap provides:
- Homepage file location: app/[locale]/page.tsx
- Component directory: components/
- Data fetching logic: lib/db.ts

design-spec provides:
- Search input styling pattern
- Button and icon styling
- Responsive layout rules
- Animation timing

Result: New component created with correct file placement and consistent styling
```
