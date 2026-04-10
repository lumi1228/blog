This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

[中文版](./README.zh-CN.md)

## Tech Stack

| Technology | Version | Description |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.3 | React framework with SSR, SSG, routing, and API support |
| [React](https://react.dev) | 19.2.4 | UI component library for building user interfaces |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Typed superset of JavaScript for better developer experience |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS framework for rapid styling |
| [PostCSS](https://postcss.org) | - | CSS transformation tool, used as Tailwind CSS build pipeline |
| [ESLint](https://eslint.org) | ^9 | JavaScript/TypeScript linter for code quality |

## Project Structure

```
blog/
├── app/                    # App Router directory (Next.js core)
│   ├── favicon.ico         # Site favicon
│   ├── globals.css         # Global styles (Tailwind directives)
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── public/                 # Static assets served at root path
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .gitignore              # Git ignore rules
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration (Tailwind plugin)
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
