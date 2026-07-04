import { isAuthorized, unauthorized } from "@/lib/auth";
import { listProjects, upsertProject } from "@/lib/db";
import { parseProjectMarkdown, ContentError } from "@/lib/markdown";
import { readMarkdownBody, json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/projects — list all projects
export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  return json(listProjects());
}

// POST /api/projects — create or update a project from an uploaded markdown file
export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { markdown, slug } = await readMarkdownBody(req);
    const parsed = parseProjectMarkdown(markdown, slug);
    const saved = upsertProject(parsed);
    return json({ ok: true, slug: saved.slug, project: saved }, 201);
  } catch (err) {
    if (err instanceof ContentError) return json({ error: err.message }, 400);
    throw err;
  }
}
