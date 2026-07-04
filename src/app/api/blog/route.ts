import { isAuthorized, unauthorized } from "@/lib/auth";
import { listBlog, upsertBlog } from "@/lib/db";
import { parseBlogMarkdown, ContentError } from "@/lib/markdown";
import { readMarkdownBody, json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/blog  — list posts (includes drafts for authed callers)
export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  return json(listBlog({ includeDrafts: true }));
}

// POST /api/blog — create or update a post from an uploaded markdown file
export async function POST(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { markdown, slug } = await readMarkdownBody(req);
    const parsed = parseBlogMarkdown(markdown, slug);
    const saved = upsertBlog(parsed);
    return json({ ok: true, slug: saved.slug, post: saved }, 201);
  } catch (err) {
    if (err instanceof ContentError)
      return json({ error: err.message }, 400);
    throw err;
  }
}
