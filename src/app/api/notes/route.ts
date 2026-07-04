import { isAuthorized, unauthorized } from "@/lib/auth";
import { listNotes, upsertNote } from "@/lib/db";
import { parseNoteMarkdown, ContentError } from "@/lib/markdown";
import { readMarkdownBody, json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/notes — list architecture notes
export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  return json(listNotes());
}

// POST /api/notes — create or update a note from an uploaded markdown file
export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { markdown, slug } = await readMarkdownBody(req);
    const parsed = parseNoteMarkdown(markdown, slug);
    const saved = upsertNote(parsed);
    return json({ ok: true, slug: saved.slug, note: saved }, 201);
  } catch (err) {
    if (err instanceof ContentError) return json({ error: err.message }, 400);
    throw err;
  }
}
