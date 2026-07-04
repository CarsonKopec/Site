import { isAuthorized, unauthorized } from "@/lib/auth";
import { getNote, upsertNote, deleteNote } from "@/lib/db";
import { parseNoteMarkdown, noteToMarkdown, ContentError } from "@/lib/markdown";
import { readMarkdownBody, json, markdownResponse } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/notes/:slug          — JSON record
// GET /api/notes/:slug?format=md — markdown source
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return json({ error: `No note "${slug}"` }, 404);
  const format = new URL(req.url).searchParams.get("format");
  return format === "md" ? markdownResponse(noteToMarkdown(note)) : json(note);
}

// PUT /api/notes/:slug — update from markdown (slug in the URL wins)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  try {
    const { markdown } = await readMarkdownBody(req);
    const parsed = parseNoteMarkdown(markdown, slug);
    parsed.slug = slug;
    const saved = upsertNote(parsed);
    return json({ ok: true, slug: saved.slug, note: saved });
  } catch (err) {
    if (err instanceof ContentError) return json({ error: err.message }, 400);
    throw err;
  }
}

// DELETE /api/notes/:slug
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  const removed = deleteNote(slug);
  if (!removed) return json({ error: `No note "${slug}"` }, 404);
  return json({ ok: true, slug, deleted: true });
}
