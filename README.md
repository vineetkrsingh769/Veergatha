# Veergatha

**Live site:** https://veergatha.vercel.app

A digital archive of India's gallantry award recipients, the conflicts they served in, and the
war memorials that carry their names. Every published fact names its source, and records go
through editorial review before they are public.

## Features

**Public site**

- Roll of Honour with filters for award, conflict, service, home state, status and decade
- A page for each recipient: biography, awards, citations, memorials and sources
- Conflicts on a timeline, each with its key events and recipients
- War memorials on a map, each with the names it honours
- Photo gallery with the licence and credit for every image
- Search across recipients, conflicts and memorials
- Corrections form for readers to report an error

**Editorial Desk** (`/admin`, sign-in required)

- Edit recipients, conflicts and memorials, moving each through draft, in review and verified
- Upload photos with their licence and credit
- Review reader corrections
- Sign up, sign in and reset a forgotten password by email

## Rules enforced by the database

1. A record cannot be verified without a primary source.
2. A recipient who survived cannot have a date of death or a posthumous award.
3. A photo cannot be published until its licence is cleared.
4. Visitors see only verified records; only editors can write.

## Tech stack

TanStack Start (React 19), Supabase (Postgres, row-level security, Auth, Storage), Tailwind CSS,
Leaflet, Vite, Vitest, pnpm. Hosted on Vercel.

## Run locally

Requires Node.js 22+ and pnpm.

```sh
pnpm install
cp .env.example .env    # fill in your Supabase values
pnpm dev                # http://localhost:3000
```

| Command      | Purpose            |
| ------------ | ------------------ |
| `pnpm dev`   | Development server |
| `pnpm build` | Production build   |
| `pnpm test`  | Run tests          |
| `pnpm lint`  | Lint               |

## Environment variables

| Variable                                                                         | Secret? |
| -------------------------------------------------------------------------------- | ------- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | No      |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`                | No      |
| `DATABASE_URL` (only for applying migrations)                                    | Yes     |

## Database setup

1. Create a Supabase project.
2. Run the SQL files in `drizzle/migrations/` in order. They create the schema, rules and data.
3. Sign up at `/auth`. The first account becomes the administrator.
4. To add an editor, insert a row in the `user_roles` table with their user ID and role `editor`.

## Project structure

```
src/
  routes/                  pages (file-based routing)
    _authenticated/        Editorial Desk pages
  components/              site, Desk and UI components
  integrations/supabase/   Supabase client and types
  lib/                     data access and helpers
  test/                    tests
drizzle/migrations/        database schema, rules and data
```
