import { isAuthorized, unauthorized } from "@/lib/auth";
import { getBlog, upsertBlog, deleteBlog } from "@/lib/db";
import { parseBlogMarkdown, blogToMarkdown, ContentError } from "@/lib/markdown";
import { readMarkdownBody, json, markdownResponse } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/blog/:slug        — JSON record
// GET /api/blog/:slug?format=md — markdown source (for pulling to a file)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  const post = getBlog(slug);
  if (!post) return json({ error: `No blog post "${slug}"` }, 404);
  const format = new URL(req.url).searchParams.get("format");
  return format === "md" ? markdownResponse(blogToMarkdown(post)) : json(post);
}

// PUT /api/blog/:slug — update from markdown (slug in the URL wins)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  try {
    const { markdown } = await readMarkdownBody(req);
    const parsed = parseBlogMarkdown(markdown, slug);
    parsed.slug = slug;
    const saved = upsertBlog(parsed);
    return json({ ok: true, slug: saved.slug, post: saved });
  } catch (err) {
    if (err instanceof ContentError) return json({ error: err.message }, 400);
    throw err;
  }
}

// DELETE /api/blog/:slug
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAuthorized(req)) return unauthorized();
  const { slug } = await params;
  const removed = deleteBlog(slug);
  if (!removed) return json({ error: `No blog post "${slug}"` }, 404);
  return json({ ok: true, slug, deleted: true });
}
