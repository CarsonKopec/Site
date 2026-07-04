# carson.systems

Personal website for Carson — a systems-focused builder working on
infrastructure, pipelines, automation, backend tooling, and game/server
systems. Built to feel like a technical command center, not a generic
portfolio template.

Stack: **Next.js (App Router) · TypeScript · Tailwind CSS v4**.

## Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Commands

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Local dev server with hot reload      |
| `npm run build` | Production build (also type-checks)   |
| `npm run start` | Serve the production build            |
| `npm run lint`  | Lint (requires `next lint` setup)     |
| `npm run seed`  | Seed the content DB from `src/data/*` |
| `npm run content -- …` | The `carsonctl` content CLI    |

## First run

```bash
npm install
cp .env.example .env.local   # then set CONTENT_API_TOKEN
npm run seed                 # load blogs + projects into data/content.db
npm run dev
```

## Deploying

Blogs/projects live in **SQLite** (`data/content.db`), so run this as a
long-running Node server (self-hosted):

```bash
npm run build && npm run start
```

SQLite doesn't persist on Vercel's serverless filesystem — for Vercel, swap
`src/lib/db.ts` for a hosted DB (Turso/Postgres); nothing else changes. See
[CONTENT.md](CONTENT.md) for the trade-off.

**Hosting on Pelican** (game-server panel): import the ready-made egg and follow
[deploy/PELICAN.md](deploy/PELICAN.md). The SQLite DB persists on the server's
`/home/container` volume.

## Editing content

**Blogs, notes, and projects** are managed through the content API + `carsonctl`
CLI and stored in the DB — see **[CONTENT.md](CONTENT.md)** for the full guide.
Quick version:

```bash
npm run content -- projects list
npm run content -- blog push ./my-post.md      # upload markdown
npm run content -- notes push ./my-note.md
npm run content -- projects pull               # back everything up as .md
```

Everything else is still data-driven in `src/data/`:

| File                    | Controls                                   |
| ----------------------- | ------------------------------------------ |
| `src/data/skills.ts`    | The skills groups                          |
| `src/data/links.ts`     | The Links page + GitHub URL                |
| `src/data/projects.ts`  | **Seed only** — live projects come from the DB |
| `src/data/notes.ts`     | **Seed only** — live notes + devlog come from the DB |

> `src/data/projects.ts` and `notes.ts` (both `notes` and `devlogPosts`) are now
> just the seed source for `npm run seed`. After seeding, the site reads
> projects, notes, and devlog from the database; edit those via the CLI/API.

## Content status — read this

The project list was built from the actual repositories under
`Development/`, not an old portfolio list. A few entries are marked
**Needs Carson Review** and need your input before they're accurate:

- **MediaServer**, **Span**, **Minecraft Bedrock Bot** — real repos, but no
  README, so their copy was inferred from folder layout. Confirm the details.
- **JNova**, **IronGuard** — named in the brief but not found on disk. These
  are deliberate placeholders; add real details or link the repos. Per the
  brief, no details were invented for IronGuard.

Placeholders in `src/data/links.ts` (email, resume) are also yours to fill in.

## Structure

```
src/
  app/            # App Router pages + /api routes (blog, projects)
  components/     # Navbar, Footer, Hero, SystemCard, PipelineFlow, badges, ...
  data/           # skills / links / notes (static) + projects seed
  lib/            # db (SQLite), markdown, auth, api helpers
scripts/
  seed.ts         # seed the DB from src/data/*
  content.ts      # the carsonctl CLI
data/
  content.db      # SQLite store (git-ignored)
```
