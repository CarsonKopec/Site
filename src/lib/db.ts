// -----------------------------------------------------------------------------
// SQLite storage layer — the runtime source of truth for blog posts & projects.
//
// Content is authored as markdown (see src/lib/markdown.ts) and stored here.
// The website reads from these functions server-side; the /api routes and the
// carsonctl CLI write through them. Native module: better-sqlite3 (declared in
// next.config `serverExternalPackages`).
// -----------------------------------------------------------------------------

// NOTE: server-only module (uses better-sqlite3). Never import from a Client
// Component. It is intentionally importable from Node scripts (seed/CLI), so we
// don't use the `server-only` guard here.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { Project } from "@/data/projects";

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO (yyyy-mm-dd)
  summary: string;
  body: string; // markdown source
  draft: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NotePost = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO (yyyy-mm-dd)
  summary: string;
  body: string; // markdown source
  related: string[]; // project slugs
  pipeline: string[]; // optional pipeline steps
  createdAt?: string;
  updatedAt?: string;
};

// A stored project mirrors the UI `Project` type; `description` holds the
// markdown body, and `order` controls list position.
export type ProjectRecord = Project & {
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const DB_PATH =
  process.env.CONTENT_DB_PATH ??
  path.join(process.cwd(), "data", "content.db");

// Reuse the connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __contentDb?: Database.Database };

function connect(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog (
      slug        TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Build Log',
      date        TEXT NOT NULL,
      summary     TEXT NOT NULL DEFAULT '',
      body        TEXT NOT NULL DEFAULT '',
      draft       INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      slug        TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'Architecture',
      date        TEXT NOT NULL,
      summary     TEXT NOT NULL DEFAULT '',
      body        TEXT NOT NULL DEFAULT '',
      related     TEXT NOT NULL DEFAULT '[]',
      pipeline    TEXT NOT NULL DEFAULT '[]',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      slug              TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      status            TEXT NOT NULL,
      category          TEXT NOT NULL,
      summary           TEXT NOT NULL DEFAULT '',
      description       TEXT NOT NULL DEFAULT '',
      problem           TEXT,
      system_role       TEXT,
      tech              TEXT NOT NULL DEFAULT '[]',
      highlights        TEXT NOT NULL DEFAULT '[]',
      architecture_notes TEXT NOT NULL DEFAULT '[]',
      pipeline_steps    TEXT NOT NULL DEFAULT '[]',
      lessons           TEXT NOT NULL DEFAULT '[]',
      future_plans      TEXT NOT NULL DEFAULT '[]',
      github_url        TEXT,
      demo_url          TEXT,
      confidence        TEXT,
      featured          INTEGER NOT NULL DEFAULT 0,
      sort_order        INTEGER NOT NULL DEFAULT 0,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );
  `);
  return db;
}

export function getDb(): Database.Database {
  if (!globalForDb.__contentDb) globalForDb.__contentDb = connect();
  return globalForDb.__contentDb;
}

const now = () => new Date().toISOString();
const parseArr = (s: unknown): string[] => {
  try {
    const v = JSON.parse(String(s ?? "[]"));
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
};

// ---- Blog -------------------------------------------------------------------

type BlogRow = {
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  body: string;
  draft: number;
  created_at: string;
  updated_at: string;
};

function rowToBlog(r: BlogRow): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    date: r.date,
    summary: r.summary,
    body: r.body,
    draft: !!r.draft,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listBlog(opts: { includeDrafts?: boolean } = {}): BlogPost[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM blog ${opts.includeDrafts ? "" : "WHERE draft = 0"} ORDER BY date DESC, slug ASC`,
    )
    .all() as BlogRow[];
  return rows.map(rowToBlog);
}

export function getBlog(slug: string): BlogPost | undefined {
  const r = getDb().prepare("SELECT * FROM blog WHERE slug = ?").get(slug) as
    | BlogRow
    | undefined;
  return r ? rowToBlog(r) : undefined;
}

export function upsertBlog(
  post: Omit<BlogPost, "createdAt" | "updatedAt">,
): BlogPost {
  const existing = getBlog(post.slug);
  const ts = now();
  getDb()
    .prepare(
      `INSERT INTO blog (slug, title, category, date, summary, body, draft, created_at, updated_at)
       VALUES (@slug, @title, @category, @date, @summary, @body, @draft, @created_at, @updated_at)
       ON CONFLICT(slug) DO UPDATE SET
         title=@title, category=@category, date=@date, summary=@summary,
         body=@body, draft=@draft, updated_at=@updated_at`,
    )
    .run({
      slug: post.slug,
      title: post.title,
      category: post.category,
      date: post.date,
      summary: post.summary,
      body: post.body,
      draft: post.draft ? 1 : 0,
      created_at: existing?.createdAt ?? ts,
      updated_at: ts,
    });
  return getBlog(post.slug)!;
}

export function deleteBlog(slug: string): boolean {
  return getDb().prepare("DELETE FROM blog WHERE slug = ?").run(slug).changes > 0;
}

// ---- Notes ------------------------------------------------------------------

type NoteRow = {
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  body: string;
  related: string;
  pipeline: string;
  created_at: string;
  updated_at: string;
};

function rowToNote(r: NoteRow): NotePost {
  return {
    slug: r.slug,
    title: r.title,
    category: r.category,
    date: r.date,
    summary: r.summary,
    body: r.body,
    related: parseArr(r.related),
    pipeline: parseArr(r.pipeline),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listNotes(): NotePost[] {
  const rows = getDb()
    .prepare("SELECT * FROM notes ORDER BY date DESC, slug ASC")
    .all() as NoteRow[];
  return rows.map(rowToNote);
}

export function getNote(slug: string): NotePost | undefined {
  const r = getDb().prepare("SELECT * FROM notes WHERE slug = ?").get(slug) as
    | NoteRow
    | undefined;
  return r ? rowToNote(r) : undefined;
}

export function upsertNote(
  note: Omit<NotePost, "createdAt" | "updatedAt">,
): NotePost {
  const existing = getNote(note.slug);
  const ts = now();
  getDb()
    .prepare(
      `INSERT INTO notes (slug, title, category, date, summary, body, related, pipeline, created_at, updated_at)
       VALUES (@slug, @title, @category, @date, @summary, @body, @related, @pipeline, @created_at, @updated_at)
       ON CONFLICT(slug) DO UPDATE SET
         title=@title, category=@category, date=@date, summary=@summary,
         body=@body, related=@related, pipeline=@pipeline, updated_at=@updated_at`,
    )
    .run({
      slug: note.slug,
      title: note.title,
      category: note.category,
      date: note.date,
      summary: note.summary,
      body: note.body,
      related: JSON.stringify(note.related ?? []),
      pipeline: JSON.stringify(note.pipeline ?? []),
      created_at: existing?.createdAt ?? ts,
      updated_at: ts,
    });
  return getNote(note.slug)!;
}

export function deleteNote(slug: string): boolean {
  return getDb().prepare("DELETE FROM notes WHERE slug = ?").run(slug).changes > 0;
}

// ---- Projects ---------------------------------------------------------------

type ProjectRow = {
  slug: string;
  name: string;
  status: string;
  category: string;
  summary: string;
  description: string;
  problem: string | null;
  system_role: string | null;
  tech: string;
  highlights: string;
  architecture_notes: string;
  pipeline_steps: string;
  lessons: string;
  future_plans: string;
  github_url: string | null;
  demo_url: string | null;
  confidence: string | null;
  featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function rowToProject(r: ProjectRow): ProjectRecord {
  return {
    slug: r.slug,
    name: r.name,
    status: r.status as Project["status"],
    category: r.category as Project["category"],
    summary: r.summary,
    description: r.description,
    problem: r.problem ?? undefined,
    systemRole: r.system_role ?? undefined,
    tech: parseArr(r.tech),
    highlights: parseArr(r.highlights),
    architectureNotes: parseArr(r.architecture_notes),
    pipelineSteps: parseArr(r.pipeline_steps),
    lessons: parseArr(r.lessons),
    futurePlans: parseArr(r.future_plans),
    githubUrl: r.github_url ?? undefined,
    demoUrl: r.demo_url ?? undefined,
    confidence: (r.confidence as Project["confidence"]) ?? undefined,
    featured: !!r.featured,
    order: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listProjects(): ProjectRecord[] {
  const rows = getDb()
    .prepare("SELECT * FROM projects ORDER BY sort_order ASC, name ASC")
    .all() as ProjectRow[];
  return rows.map(rowToProject);
}

export function listFeaturedProjects(): ProjectRecord[] {
  return listProjects().filter((p) => p.featured);
}

export function getProjectRecord(slug: string): ProjectRecord | undefined {
  const r = getDb()
    .prepare("SELECT * FROM projects WHERE slug = ?")
    .get(slug) as ProjectRow | undefined;
  return r ? rowToProject(r) : undefined;
}

export function upsertProject(p: ProjectRecord): ProjectRecord {
  const existing = getProjectRecord(p.slug);
  const ts = now();
  getDb()
    .prepare(
      `INSERT INTO projects (
         slug, name, status, category, summary, description, problem, system_role,
         tech, highlights, architecture_notes, pipeline_steps, lessons, future_plans,
         github_url, demo_url, confidence, featured, sort_order, created_at, updated_at
       ) VALUES (
         @slug, @name, @status, @category, @summary, @description, @problem, @system_role,
         @tech, @highlights, @architecture_notes, @pipeline_steps, @lessons, @future_plans,
         @github_url, @demo_url, @confidence, @featured, @sort_order, @created_at, @updated_at
       )
       ON CONFLICT(slug) DO UPDATE SET
         name=@name, status=@status, category=@category, summary=@summary,
         description=@description, problem=@problem, system_role=@system_role,
         tech=@tech, highlights=@highlights, architecture_notes=@architecture_notes,
         pipeline_steps=@pipeline_steps, lessons=@lessons, future_plans=@future_plans,
         github_url=@github_url, demo_url=@demo_url, confidence=@confidence,
         featured=@featured, sort_order=@sort_order, updated_at=@updated_at`,
    )
    .run({
      slug: p.slug,
      name: p.name,
      status: p.status,
      category: p.category,
      summary: p.summary,
      description: p.description ?? "",
      problem: p.problem ?? null,
      system_role: p.systemRole ?? null,
      tech: JSON.stringify(p.tech ?? []),
      highlights: JSON.stringify(p.highlights ?? []),
      architecture_notes: JSON.stringify(p.architectureNotes ?? []),
      pipeline_steps: JSON.stringify(p.pipelineSteps ?? []),
      lessons: JSON.stringify(p.lessons ?? []),
      future_plans: JSON.stringify(p.futurePlans ?? []),
      github_url: p.githubUrl ?? null,
      demo_url: p.demoUrl ?? null,
      confidence: p.confidence ?? null,
      featured: p.featured ? 1 : 0,
      sort_order: p.order ?? existing?.order ?? nextProjectOrder(),
      created_at: existing?.createdAt ?? ts,
      updated_at: ts,
    });
  return getProjectRecord(p.slug)!;
}

export function deleteProject(slug: string): boolean {
  return getDb().prepare("DELETE FROM projects WHERE slug = ?").run(slug).changes > 0;
}

function nextProjectOrder(): number {
  const r = getDb()
    .prepare("SELECT COALESCE(MAX(sort_order), 0) + 10 AS next FROM projects")
    .get() as { next: number };
  return r.next;
}

export function counts(): { blog: number; notes: number; projects: number } {
  const one = (t: string) =>
    (getDb().prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
  return { blog: one("blog"), notes: one("notes"), projects: one("projects") };
}
