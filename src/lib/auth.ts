import "server-only";

// Bearer-token gate for the write API. Fails closed: if CONTENT_API_TOKEN is
// unset, every request is rejected (so a misconfigured deploy can't be written
// to anonymously).
export function isAuthorized(req: Request): boolean {
  const token = process.env.CONTENT_API_TOKEN;
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const provided = match[1].trim();
  // constant-time-ish comparison
  if (provided.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++)
    diff |= provided.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

export function unauthorized(): Response {
  const reason = process.env.CONTENT_API_TOKEN
    ? "Invalid or missing bearer token."
    : "Server has no CONTENT_API_TOKEN configured; writes are disabled.";
  return new Response(JSON.stringify({ error: reason }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
