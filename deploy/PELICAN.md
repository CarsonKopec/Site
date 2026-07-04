# Hosting on Pelican

Pelican runs each server as a Docker container from an **egg** (Docker image +
install script + startup command + variables), with a persistent volume at
`/home/container`. This app fits that model directly: `next start` serves it, and
the SQLite database lives on the persistent volume so content survives restarts.

The egg is [`deploy/pelican-egg.json`](./pelican-egg.json).

---

## 1. Put the code somewhere the panel can fetch it

Easiest is a git repo. Push this project to GitHub (or your own git host):

```bash
git init && git add -A && git commit -m "carson.systems"
git branch -M main
git remote add origin https://github.com/CarsonKopec/PersonalWebsite.git
git push -u origin main
```

> No repo? You can skip this and upload the project folder over **SFTP** into
> `/home/container` instead (leave `GIT_ADDRESS` blank on the server). Don't
> upload `node_modules/` or `.next/` — the install step builds those.

`.env.local` is git-ignored and **should not** ship — the token is provided as a
Pelican variable instead (step 4).

## 2. Import the egg

Pelican panel → **Admin → Eggs → Import Egg** → upload `deploy/pelican-egg.json`.
(The egg is in Pterodactyl `PTDL_v2` format, which Pelican imports natively.)
Attach it to a Nest/category of your choice.

## 3. Create the server

**Admin → Servers → Create**, then:

- **Egg:** *carson.systems (Next.js content site)*
- **Docker image:** Node 22 (default; 20 or 24 also provided)
- **Memory:** ~1–2 GB for the first build (`next build` is the hungry part);
  runtime idles around 256–512 MB. Disk: ~2 GB.
- **Allocation:** one port. Next binds to it as `0.0.0.0:{{SERVER_PORT}}`.

## 4. Set the variables

| Variable | Value |
| --- | --- |
| `CONTENT_API_TOKEN` | A long random secret (see below). **Required** — writes are disabled if empty. |
| `GIT_ADDRESS` | e.g. `https://github.com/CarsonKopec/PersonalWebsite` (blank for SFTP) |
| `GIT_BRANCH` | `main` |
| `CONTENT_DB_PATH` | `/home/container/data/content.db` (leave as-is — keeps the DB on the volume) |

Generate a token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Install & start

Hit **Install** (or Reinstall). The install script clones the repo, runs
`npm ci`, `npm run build`, and `npm run seed` (idempotent). When it finishes,
**Start** the server. Console shows Next booting; Wings marks it *running* when
it sees `Ready in` in the logs.

Your site is now live on the server's allocation, e.g. `http://<node-ip>:<port>`.

---

## 6. Put it behind a domain + HTTPS

The container serves plain HTTP on the allocation. Front it with either:

- **Cloudflare Tunnel** (you already use these): run `cloudflared` pointed at
  `http://<node-ip>:<port>`, map it to `carson.systems`. No inbound port to open.
- **A reverse proxy** (nginx/Caddy) on the node terminating TLS and proxying to
  the allocation.

Either way you get HTTPS, and the token-gated `/api/*` is safe to expose.

## 7. Manage content remotely

From your laptop, point `carsonctl` at the public URL and use the same token:

```bash
# .env.local (or export in the shell)
CONTENT_API_URL=https://carson.systems
CONTENT_API_TOKEN=<same token as the server>

npm run content -- projects list
npm run content -- blog push ./my-post.md
```

## 8. Backups & updates

- **Backup:** `carsonctl … pull` writes every blog/note/project to markdown you
  can commit. The raw DB is a single file at `/home/container/data/content.db`
  (grab it via SFTP or a Pelican backup).
- **Deploy an update:** push to the repo, then **Reinstall** the server. The
  install script does `git reset --hard origin/<branch>` + rebuild + seed. Your
  `data/` (git-ignored, untracked) is left untouched, so content is preserved.

---

## Notes / gotchas

- **Native module:** `better-sqlite3` installs a prebuilt binary for Node on
  linux-x64/arm64 — no compiler needed in the default Node 22 yolk. If a build
  ever tries to compile and fails, switch the Docker image to another Node
  version or ensure the image has `python3` + build tools.
- **Node version:** requires Node ≥ 18.18 (Next 15). The egg defaults to 22.
- **Not a static export:** pages are dynamic and the API needs the Node runtime,
  so this must run as a live server (`next start`) — which is exactly this egg.
  It will **not** work as a static-file host.
- **Git in the installer:** the install step runs in the Node 22 yolk, which
  includes `git`. If your image lacks it, use the SFTP-upload path instead.
