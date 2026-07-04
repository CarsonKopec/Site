#!/usr/bin/env tsx
/**
 * carsonctl — manage blog posts & projects stored by the site.
 *
 * Talks to the site's HTTP API (localhost or a deployed URL), so it works the
 * same whether the content lives on your laptop or a self-hosted box.
 *
 *   npm run content -- <type> <command> [args]
 *   # or, if linked globally:  carsonctl <type> <command> [args]
 *
 * type    : blog | notes | projects
 * command :
 *   list                       list everything (slug, title/name, status)
 *   get   <slug>               print the markdown to stdout
 *   pull  [slug] [--out DIR]   write <slug>.md files (all if no slug given)
 *   push  <file.md> [file...]  create/update from local markdown file(s)
 *   rm    <slug>               delete
 *
 * Config (env or .env.local / .env in the project root):
 *   CONTENT_API_URL    default http://localhost:3000
 *   CONTENT_API_TOKEN  required — must match the server's token
 *
 * Flags: --url <u>  --token <t>  --out <dir>
 */

import fs from "node:fs";
import path from "node:path";

// --- tiny .env loader (no dependency) ---------------------------------------
function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

// --- arg parsing -------------------------------------------------------------
const argv = process.argv.slice(2);
const flags: Record<string, string> = {};
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith("--")) {
    const key = a.slice(2);
    flags[key] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
  } else positional.push(a);
}

const BASE = (flags.url ?? process.env.CONTENT_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const TOKEN = flags.token ?? process.env.CONTENT_API_TOKEN ?? "";

const [typeArg, command, ...rest] = positional;

function die(msg: string): never {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

const TYPES = ["blog", "notes", "projects"] as const;
type ContentType = (typeof TYPES)[number];

function usage(): never {
  console.log(
    `carsonctl — manage blog posts & projects\n\n` +
      `  npm run content -- <type> <command> [args]\n\n` +
      `  type:     blog | notes | projects\n` +
      `  commands: list | get <slug> | pull [slug] [--out DIR] | push <file...> | rm <slug>\n\n` +
      `  env: CONTENT_API_URL (default ${BASE}), CONTENT_API_TOKEN (required)\n`,
  );
  process.exit(0);
}

if (!typeArg || typeArg === "help" || flags.help) usage();
if (!TYPES.includes(typeArg as ContentType))
  die(`unknown type "${typeArg}" (expected: ${TYPES.join(" | ")})`);
if (!TOKEN) die("CONTENT_API_TOKEN is not set (env, --token, or .env.local).");

const type = typeArg as ContentType;

async function api(
  method: string,
  pathname: string,
  body?: string,
  contentType = "text/markdown",
): Promise<Response> {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      ...(body ? { "content-type": contentType } : {}),
    },
    body,
  });
  return res;
}

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function ensureOk(res: Response, action: string) {
  if (res.ok) return;
  const data = await readJson(res);
  const msg = typeof data === "object" && data?.error ? data.error : String(data);
  die(`${action} failed (${res.status}): ${msg}`);
}

// --- commands ----------------------------------------------------------------

async function cmdList() {
  const res = await api("GET", `/api/${type}`);
  await ensureOk(res, "list");
  const rows = (await readJson(res)) as Record<string, unknown>[];
  if (!rows.length) return console.log("(none)");
  if (type === "blog" || type === "notes") {
    console.log(pad("SLUG", 34) + pad("DATE", 12) + pad("CATEGORY", 24) + "TITLE");
    for (const r of rows)
      console.log(
        pad(String(r.slug), 34) +
          pad(String(r.date), 12) +
          pad(String(r.category), 24) +
          String(r.title) +
          (r.draft ? "  [draft]" : ""),
      );
  } else {
    console.log(pad("SLUG", 26) + pad("STATUS", 14) + pad("CATEGORY", 20) + "NAME");
    for (const r of rows)
      console.log(
        pad(String(r.slug), 26) +
          pad(String(r.status), 14) +
          pad(String(r.category), 20) +
          String(r.name) +
          (r.featured ? "  ★" : ""),
      );
  }
  console.log(`\n${rows.length} ${type} item(s) @ ${BASE}`);
}

async function cmdGet(slug: string) {
  if (!slug) die("get: missing <slug>");
  const res = await api("GET", `/api/${type}/${slug}?format=md`);
  await ensureOk(res, "get");
  process.stdout.write(await res.text());
}

async function cmdPull(slug: string | undefined, outDir: string) {
  fs.mkdirSync(outDir, { recursive: true });
  let slugs: string[];
  if (slug) {
    slugs = [slug];
  } else {
    const res = await api("GET", `/api/${type}`);
    await ensureOk(res, "pull(list)");
    slugs = ((await readJson(res)) as { slug: string }[]).map((r) => r.slug);
  }
  for (const s of slugs) {
    const res = await api("GET", `/api/${type}/${s}?format=md`);
    await ensureOk(res, `pull ${s}`);
    const file = path.join(outDir, `${s}.md`);
    fs.writeFileSync(file, await res.text());
    console.log(`↓ ${file}`);
  }
  console.log(`pulled ${slugs.length} → ${outDir}`);
}

async function cmdPush(files: string[]) {
  if (!files.length) die("push: give one or more <file.md>");
  for (const f of files) {
    if (!fs.existsSync(f)) die(`no such file: ${f}`);
    const md = fs.readFileSync(f, "utf8");
    const slug = path.basename(f).replace(/\.mdx?$/i, "");
    const res = await fetch(`${BASE}/api/${type}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${TOKEN}`,
        "content-type": "text/markdown",
        "x-content-slug": slug,
      },
      body: md,
    });
    const data = await readJson(res);
    if (!res.ok) {
      const msg = typeof data === "object" && data?.error ? data.error : data;
      die(`push ${f} failed (${res.status}): ${msg}`);
    }
    console.log(`↑ ${f} → ${type}/${(data as { slug: string }).slug}`);
  }
}

async function cmdRm(slug: string) {
  if (!slug) die("rm: missing <slug>");
  const res = await api("DELETE", `/api/${type}/${slug}`);
  await ensureOk(res, "rm");
  console.log(`x removed ${type}/${slug}`);
}

function pad(s: string, n: number) {
  return (s.length > n - 1 ? s.slice(0, n - 2) + "…" : s).padEnd(n);
}

async function main() {
  switch (command) {
    case "list":
      return cmdList();
    case "get":
      return cmdGet(rest[0]);
    case "pull":
      return cmdPull(rest[0], flags.out ?? `content/${type}`);
    case "push":
      return cmdPush(rest);
    case "rm":
    case "remove":
    case "delete":
      return cmdRm(rest[0]);
    default:
      die(`unknown command "${command ?? ""}". Try: list | get | pull | push | rm`);
  }
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
