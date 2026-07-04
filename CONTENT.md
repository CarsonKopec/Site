# Managing content (blogs & projects)

Blog posts, architecture notes, and projects live in a **SQLite database**
(`data/content.db`), not in `.ts` files. You manage them two ways:

- **HTTP API** under `/api/*` — upload/edit/delete, protected by a bearer token.
- **`carsonctl` CLI** (`npm run content -- …`) — list / get / pull / push / rm,
  talking to that API over HTTP (so it works against localhost or a deployed URL).

Content is authored as **markdown with YAML frontmatter**.

> The site reads the DB at request time (pages are dynamic), so pushed changes
> show up immediately — no rebuild needed.

---

## One-time setup

1. Put a secret token in `.env.local` (already generated for local dev):

   ```
   CONTENT_API_TOKEN=<long-random-string>
   CONTENT_API_URL=http://localhost:3000
   ```

   Generate a fresh one anytime:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. Seed the DB from the original static content (run once):

   ```bash
   npm run seed          # seeds only if empty
   npm run seed -- --force   # re-seed from src/data/*
   ```

3. Start the site: `npm run dev` (the API lives at `/api/*`).

---

## The CLI: `carsonctl`

Run as `npm run content -- <type> <command>` (note the `--`). `<type>` is `blog`,
`notes`, or `projects`.

| Command | Does |
| --- | --- |
| `blog list` / `projects list` | List everything stored |
| `blog get <slug>` | Print the markdown to stdout |
| `blog pull [slug] [--out DIR]` | Write `<slug>.md` files (all if no slug). Default dir: `content/blog` or `content/projects` |
| `blog push <file.md> [more…]` | Create/update from local markdown file(s) |
| `blog rm <slug>` | Delete |

Examples:

```bash
npm run content -- projects list
npm run content -- blog push ./drafts/thinking-in-pipelines.md
npm run content -- projects pull                 # back up every project as .md
npm run content -- projects pull minesight --out ./content/projects
npm run content -- blog rm old-post
```

Flags: `--url <u>` and `--token <t>` override the env values; `--out <dir>` sets
the pull destination.

**Editing flow:** `pull` a file → edit it → `push` it back. The slug comes from
the frontmatter, falling back to the filename.

---

## The API (for scripts / other machines)

All routes require `Authorization: Bearer $CONTENT_API_TOKEN`. Writes accept a
raw markdown body (`Content-Type: text/markdown`) or JSON `{ "markdown": "…" }`.

| Method & path | Action |
| --- | --- |
| `GET /api/blog`, `GET /api/projects` | List (JSON) |
| `GET /api/blog/:slug` | One record (JSON); add `?format=md` for markdown |
| `POST /api/blog` | Create/update from markdown (slug from frontmatter or `X-Content-Slug`) |
| `PUT /api/blog/:slug` | Update a specific slug from markdown |
| `DELETE /api/blog/:slug` | Delete |

(Replace `blog` with `notes` or `projects` for those endpoints — same shape.)

```bash
# upload a post
curl -X POST http://localhost:3000/api/blog \
  -H "Authorization: Bearer $CONTENT_API_TOKEN" \
  -H "Content-Type: text/markdown" \
  --data-binary @post.md
```

Errors: `401` (bad/missing token, or server has no token set — writes fail
closed), `400` (invalid frontmatter, e.g. a bad `status`/`category`), `404`.

---

## Frontmatter reference

### Blog post

```markdown
---
title: Why I Started Thinking in Pipelines   # required
slug: thinking-in-pipelines                  # optional (defaults to filename/title)
category: Pipeline Design                     # optional (default "Build Log")
date: 2026-07-01                              # optional (default today)
summary: One-line teaser shown in lists.      # optional
draft: false                                  # optional — drafts are hidden on the site
---

Markdown body goes here. **Bold**, lists, `code`, headings, etc.
```

### Architecture note

Notes are the `/notes` engineering-notebook entries. Same idea as a blog post,
plus optional `pipeline` and `related` (project slugs, shown as links).

```markdown
---
title: Keeping the core ignorant                 # required
slug: one-way-dependencies                       # optional
category: Architecture                            # Architecture | Pipeline Design | Infrastructure | Debugging | Deployment | AI-Assisted Development | Minecraft / Game Systems | Server Notes | Build Log
date: 2026-06-18                                  # optional
summary: Why the core crate knows nothing about the driver.
related: [anchor]                                 # optional — project slugs, rendered as links
pipeline: [Config, MountManager, Backend, Mount] # optional — renders a pipeline diagram
---

The markdown body is the note. Use `## headings`, lists, code blocks, etc.
```

### Project

```markdown
---
name: MineSight            # required
slug: minesight            # optional (defaults to name)
status: Active             # Active | Prototype | Experimental | Planning | Paused | Archived | Needs Review
category: Minecraft Tooling # Infrastructure | Pipeline | Backend | Developer Tool | Game Server | Minecraft Tooling | Automation | Dashboard | Protocol | AI Workflow | Hardware | Other
summary: One-line summary shown on the card.
featured: true             # optional — surfaces on the homepage
confidence: Confirmed      # optional — "Confirmed" | "Needs Carson Review"
githubUrl: https://github.com/CarsonKopec/Minesight   # optional
demoUrl:                   # optional
problem: Why it exists.    # optional
systemRole: One-line role in the wider system.        # optional
tech: [Python, YOLO26s, WebSockets]                   # optional list
highlights:                # optional list
  - First highlight
  - Second highlight
architectureNotes:         # optional list ("Component — description" renders nicely)
  - "engine/ — Python package"
pipelineSteps: [Capture, Inference, WebSocket, Overlay]  # optional list
lessons:                   # optional list
  - Something learned.
futurePlans:               # optional list
  - Next step.
---

The markdown **body becomes the project's "System overview"** writeup and is
rendered as prose. If you omit the body, a `description:` frontmatter field or
the summary is used instead.
```

---

## Notes on deployment

SQLite lives on the server's local disk, so this fits a **self-hosted / long-running
Node server** (`npm run build && npm run start`) — which matches how you host
things. It does **not** persist on Vercel's ephemeral serverless filesystem; if
you ever move there, switch `src/lib/db.ts` to a hosted database (Turso/libSQL or
Postgres) — the API/CLI/pages don't change, only that one module.

Back up your content anytime with `npm run content -- blog pull` and
`… projects pull` (writes every item to markdown files you can commit to git).
