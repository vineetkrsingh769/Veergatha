# Veergatha

A digital archive of India's gallantry award recipients, the conflicts they served in, and the
war memorials that carry their names. *Veergatha*: Sanskrit for tales of bravery.

Every published fact carries its source. Drafts are never public. A record cannot be verified
without a primary source, a recipient who survived is never given a date of death, and media
cannot be published until its licence is cleared. These rules are enforced in the database
(see `drizzle/migrations/0000_archive_schema.sql`), not only in the UI.

## Stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start (React 19, file-based routing, SSR, server functions) |
| Data and auth | Supabase (Postgres with row-level security, Supabase Auth) |
| Schema | SQL migrations in `drizzle/migrations/` |
| Styling | Tailwind CSS v4 with shadcn/ui components |
| Build | Vite 8 with Nitro |
| Package manager | pnpm |

## Getting started

```sh
pnpm install
cp .env.example .env    # fill in your Supabase values
pnpm dev                # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build into `.output/` |
| `pnpm preview` | Serve the production build |
| `pnpm test` | Run the tests (Vitest) |
| `pnpm lint` | Lint with ESLint |

## Environment

| Variable | Used by | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | No |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Server rendering | No |
| `DATABASE_URL` | Applying migrations with drizzle-kit | **Yes** |

`.env` is git-ignored. Never commit the database URL. The site needs no service-role key: every
read and write goes through row-level security.

## Database

The schema, editorial rules, access policies and seed data live in `drizzle/migrations/`, in
order. To set up a fresh Supabase project, run them in sequence in the Supabase SQL editor, or
with `DATABASE_URL` set.

The first account to sign up becomes the archive's administrator. Create your own account
immediately after setting up a new database.

## Project layout

```
src/
  routes/          one file per page (TanStack file-based routing)
    _authenticated/  pages that require sign-in (the editorial desk)
  components/
    archive/       site chrome, recipient cards, memorial map, shared page pieces
    admin/         editorial desk forms and helpers
    ui/            the shadcn/ui primitives the site uses
  integrations/supabase/   Supabase client and generated database types
  lib/             data access (archive.functions.ts), formatting helpers
drizzle/migrations/        database schema, seed data and data fixes
```
