import { isAuthorized, unauthorized } from "@/lib/auth";
import { getProjectRecord, upsertProject, deleteProject } from "@/lib/db";
import {
  parseProjectMarkdown,
  projectToMarkdown,
  ContentError,
} from "@/lib/markdown";
import { readMarkdownBody, json, markdownResponse } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/projects/:slug          — JSON record
// GET /api/projects/:slug?format=md — markdown source
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  const project = getProjectRecord(slug);
  if (!project) return json({ error: `No project "${slug}"` }, 404);
  const format = new URL(req.url).searchParams.get("format");
  return format === "md"
    ? markdownResponse(projectToMarkdown(project))
    : json(project);
}

// PUT /api/projects/:slug — update from markdown (slug in the URL wins)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  try {
    const { markdown } = await readMarkdownBody(req);
    const parsed = parseProjectMarkdown(markdown, slug);
    parsed.slug = slug;
    const saved = upsertProject(parsed);
    return json({ ok: true, slug: saved.slug, project: saved });
  } catch (err) {
    if (err instanceof ContentError) return json({ error: err.message }, 400);
    throw err;
  }
}

// DELETE /api/projects/:slug
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  const removed = deleteProject(slug);
  if (!removed) return json({ error: `No project "${slug}"` }, 404);
  return json({ ok: true, slug, deleted: true });
}
