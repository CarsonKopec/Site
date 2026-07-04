import "server-only";

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function markdownResponse(md: string, status = 200): Response {
  return new Response(md, {
    status,
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

// Accepts either a raw markdown body (text/markdown, text/plain) or a JSON
// payload of the shape { markdown: string, slug?: string }. An optional slug
// hint can also arrive via the X-Content-Slug header.
export async function readMarkdownBody(
  req: Request,
): Promise<{ markdown: string; slug?: string }> {
  const type = req.headers.get("content-type") ?? "";
  const slugHeader = req.headers.get("x-content-slug") ?? undefined;

  if (type.includes("application/json")) {
    const data = (await req.json()) as { markdown?: string; slug?: string };
    return {
      markdown: String(data.markdown ?? ""),
      slug: data.slug ?? slugHeader,
    };
  }

  const text = await req.text();
  return { markdown: text, slug: slugHeader };
}
