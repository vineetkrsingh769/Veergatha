# Veergatha

A digital archive of India's gallantry award recipients and the war memorials that hold
their names. *Veergatha* — Sanskrit for tales of bravery.

This document is the working PRD as well as the repo entry point. Detailed design lives in
[docs/DATA_MODEL.md](docs/DATA_MODEL.md) and [docs/SOURCING.md](docs/SOURCING.md).

## The problem

India's military heritage is recorded across gazette notifications, regimental histories,
memorial plaques and family albums. It is scattered, uneven, and largely unsearchable. A
citation exists on a government portal, the memorial that carries the name is documented
somewhere else, and the conflict they belong to is a third search. Nothing joins them.

Veergatha joins them, and shows its working — every published fact carries its source.

## Scope

**In scope**

- Profiles of gallantry award recipients: service details, award citation, biography, portrait
- A directory of war memorials with location, history and imagery
- Conflicts and operations, each linking to the people who served in them
- Search and filtering by name, regiment, home state, conflict and year
- A media gallery of photographs and document scans
- An editorial dashboard for creating, editing and verifying records

**Out of scope**

- Any record that cannot be traced to a verifiable source
- Classified or operationally sensitive material
- Political commentary, or narrative framing beyond the documented record
- Public user accounts, comments, or user-submitted content. Contributions arrive through
  editors, not a form.
- Personal details of living people beyond their published service record

**Scope decision: recipients who survived.** Three Param Vir Chakra recipients were decorated
for actions they lived through. They are **included** — a Kargil page that silently omitted
two of its four PVC recipients would be a worse historical record — but they carry
`status: 'survived'` and are never rendered with martyrdom language. See
[docs/SOURCING.md](docs/SOURCING.md#editorial-conventions).

## Users

| Who | Needs |
|---|---|
| Public visitor | Find a name, read the story, see where they are memorialised. Mostly on a phone. |
| Student / researcher | Filter by conflict, regiment or state; follow sources to primaries. |
| Family member | Find their relative's record and see it treated accurately. |
| Editor / admin | Draft, source, review and publish records without touching the database. |

## Success criteria

- A visitor can go from the home page to a fully sourced profile in two clicks
- Every published record has at least one primary source and no unlicensed imagery
- A researcher can answer "who from Kerala died at Kargil" in one query
- The Kargil vertical slice is complete before any other conflict is broadened

## Non-functional requirements

| Requirement | Target |
|---|---|
| Page load | Under 3s on a mid-range phone over 4G |
| Layout | Mobile-first; usable from 360px up |
| Images | Cloudinary transforms, correct sizing, lazy loading below the fold |
| Security | Input validation on every write; rate-limited admin login; secrets in env only |
| Transport | HTTPS everywhere (Vercel and Render defaults) |
| Availability | Public browsing never requires authentication |

## Stack

| Layer | Choice | Why |
|---|---|---|
| Database | MongoDB Atlas + Mongoose | Records are document-shaped — embedded citations, sources and awards vary by entity |
| API | Express (Node 20+) | Plain REST, testable in Postman before any UI exists |
| Auth | JWT, admin routes only | Public browsing stays open; no session store to run |
| Media | Cloudinary | Upload, transform and CDN in one free tier |
| Client | React 19 + React Router 7 + Vite | — |
| Styling | Tailwind v4 + ReactBits components | ReactBits registries configured in `client/components.json` |
| Hosting | Vercel (client), Render (API) | Free tiers, git-push deploys |

## Repository layout

```
client/          React SPA
  src/lib/api.js   fetch wrapper; VITE_API_URL in prod, Vite proxy in dev
  components.json  shadcn + ReactBits registries
  vercel.json      SPA rewrite so deep links survive refresh
server/          Express API
  src/app.js       middleware, routes, error handling
  src/config/db.js Mongoose connection
docs/            Data model, sourcing workflow, content worklist
```

## MongoDB Atlas setup

Do this once, before Phase 2 work needs data.

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a
   free **M0** cluster. Pick the region closest to you; `aws / Mumbai (ap-south-1)` is a
   reasonable default.
2. **Database Access** → Add New Database User. This is *not* your Atlas login. Use an
   alphanumeric password — anything with `@ : / ? #` has to be percent-encoded in the URI
   and is the most common cause of a failed first connection.
3. **Network Access** → Add IP Address → **Allow access from anywhere (`0.0.0.0/0`)**.
   Render's free tier has no static IP, so a pinned address works locally and then breaks
   on deploy.
4. **Database → Connect → Drivers** and copy the connection string.
5. Insert the database name into the path, before the `?`:

   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/veergatha?retryWrites=true&w=majority
   ```

   Without it you silently read and write a database called `test`.
6. Paste it into `server/.env` as `MONGODB_URI`, then:

   ```bash
   cd server && npm run db:check
   ```

   That prints the server version, database name and collections on success, and names the
   specific fix on failure.

## Local development

Two terminals.

```bash
# API — http://localhost:5000
cd server
cp .env.example .env      # fill in MONGODB_URI
npm install
npm run dev

# Client — http://localhost:5173
cd client
cp .env.example .env.local   # leave VITE_API_URL empty; Vite proxies /api
npm install
npm run dev
```

The home page shows an API health card. If it reads `disconnected`, the server is up but
Atlas is not wired — that is a valid state and the server will still boot.

## Deployment

| | Vercel (client) | Render (server) |
|---|---|---|
| Root directory | `client` | `server` |
| Build | `npm run build` | `npm install` |
| Start | — | `npm start` |
| Env | `VITE_API_URL` = Render URL, no trailing slash | `MONGODB_URI`, `CORS_ORIGINS`, `NODE_ENV=production` |

Atlas Network Access must allow `0.0.0.0/0` — Render's free tier has no static IP. Render
free instances sleep after 15 minutes idle; the first request after that takes roughly 50
seconds. Add the Vercel domain to `CORS_ORIGINS` once it exists.

## Roadmap

- [x] **Phase 1 — Planning & setup.** Data model, sourcing workflow, PRD, repo skeleton, CI/CD path
- [ ] **Phase 2 — Backend core.** Mongoose schemas, CRUD routes, search, JWT auth, Cloudinary, seed the Kargil set
- [ ] **Phase 3 — Frontend core.** Home, profiles, memorials, search, admin dashboard; responsive throughout
- [ ] **Phase 4 — Content & polish.** Verified records, gallery, performance pass, hardening, cross-device testing

Content work runs in parallel from Phase 2 onward, not at the end. Sourcing is the long pole.
