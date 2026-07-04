// -----------------------------------------------------------------------------
// Markdown <-> record helpers.
//
//   parseBlogMarkdown / parseProjectMarkdown  — uploaded .md  -> stored record
//   blogToMarkdown / projectToMarkdown        — stored record -> .md (for pull)
//   renderMarkdown                            — markdown      -> HTML (for pages)
//
// Content is authored as a YAML frontmatter block + a markdown body.
// -----------------------------------------------------------------------------

import matter from "gray-matter";
import { marked } from "marked";
import type { BlogPost, NotePost, ProjectRecord } from "@/lib/db";
import type { ProjectCategory, ProjectStatus } from "@/data/projects";

export const NOTE_CATEGORIES = [
  "Architecture",
  "Pipeline Design",
  "Infrastructure",
  "Debugging",
  "Deployment",
  "AI-Assisted Development",
  "Minecraft / Game Systems",
  "Server Notes",
  "Build Log",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Active",
  "Prototype",
  "Experimental",
  "Planning",
  "Paused",
  "Archived",
  "Needs Review",
];

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Infrastructure",
  "Pipeline",
  "Backend",
  "Developer Tool",
  "Game Server",
  "Minecraft Tooling",
  "Automation",
  "Dashboard",
  "Protocol",
  "AI Workflow",
  "Hardware",
  "Other",
];

marked.setOptions({ gfm: true, breaks: false });

export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}

export class ContentError extends Error {}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asStringArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  // allow comma-separated scalars in frontmatter
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toDateString(v: unknown): string {
  if (!v) return new Date().toISOString().slice(0, 10);
  // gray-matter may parse an unquoted YAML date into a Date object
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  return s.length >= 10 ? s.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

// ---- Blog -------------------------------------------------------------------

export function parseBlogMarkdown(
  raw: string,
  fallbackSlug?: string,
): Omit<BlogPost, "createdAt" | "updatedAt"> {
  const { data, content } = matter(raw);
  const title = String(data.title ?? "").trim();
  if (!title) throw new ContentError("Blog frontmatter is missing `title`.");
  const slug = slugify(String(data.slug ?? fallbackSlug ?? title));
  if (!slug) throw new ContentError("Could not derive a slug for the post.");

  return {
    slug,
    title,
    category: String(data.category ?? "Build Log").trim(),
    date: toDateString(data.date),
    summary: String(data.summary ?? "").trim(),
    body: content.trim(),
    draft: data.draft === true || data.draft === "true",
  };
}

export function blogToMarkdown(post: BlogPost): string {
  const fm: Record<string, unknown> = {
    slug: post.slug,
    title: post.title,
    category: post.category,
    date: post.date,
    summary: post.summary,
  };
  if (post.draft) fm.draft = true;
  return matter.stringify(`\n${post.body}\n`, fm);
}

// ---- Notes ------------------------------------------------------------------

export function parseNoteMarkdown(
  raw: string,
  fallbackSlug?: string,
): Omit<NotePost, "createdAt" | "updatedAt"> {
  const { data, content } = matter(raw);
  const title = String(data.title ?? "").trim();
  if (!title) throw new ContentError("Note frontmatter is missing `title`.");
  const slug = slugify(String(data.slug ?? fallbackSlug ?? title));
  if (!slug) throw new ContentError("Could not derive a slug for the note.");

  const category = String(data.category ?? "Architecture").trim();
  if (!NOTE_CATEGORIES.includes(category)) {
    throw new ContentError(
      `Invalid category "${category}". Allowed: ${NOTE_CATEGORIES.join(", ")}`,
    );
  }

  return {
    slug,
    title,
    category,
    date: toDateString(data.date),
    summary: String(data.summary ?? "").trim(),
    body: content.trim(),
    related: asStringArray(data.related),
    pipeline: asStringArray(data.pipeline),
  };
}

export function noteToMarkdown(note: NotePost): string {
  const fm: Record<string, unknown> = {
    slug: note.slug,
    title: note.title,
    category: note.category,
    date: note.date,
    summary: note.summary,
  };
  if (note.related?.length) fm.related = note.related;
  if (note.pipeline?.length) fm.pipeline = note.pipeline;
  return matter.stringify(`\n${note.body}\n`, fm);
}

// ---- Projects ---------------------------------------------------------------

export function parseProjectMarkdown(
  raw: string,
  fallbackSlug?: string,
): ProjectRecord {
  const { data, content } = matter(raw);
  const name = String(data.name ?? "").trim();
  if (!name) throw new ContentError("Project frontmatter is missing `name`.");
  const slug = slugify(String(data.slug ?? fallbackSlug ?? name));
  if (!slug) throw new ContentError("Could not derive a slug for the project.");

  const status = String(data.status ?? "Prototype").trim() as ProjectStatus;
  if (!PROJECT_STATUSES.includes(status)) {
    throw new ContentError(
      `Invalid status "${status}". Allowed: ${PROJECT_STATUSES.join(", ")}`,
    );
  }
  const category = String(data.category ?? "Other").trim() as ProjectCategory;
  if (!PROJECT_CATEGORIES.includes(category)) {
    throw new ContentError(
      `Invalid category "${category}". Allowed: ${PROJECT_CATEGORIES.join(", ")}`,
    );
  }

  const confidence =
    data.confidence === "Confirmed" || data.confidence === "Needs Carson Review"
      ? (data.confidence as ProjectRecord["confidence"])
      : undefined;

  // The markdown body is the project's writeup (description). If there's no
  // body, fall back to a `description` frontmatter field, then the summary.
  const description =
    content.trim() || String(data.description ?? data.summary ?? "").trim();

  return {
    slug,
    name,
    status,
    category,
    summary: String(data.summary ?? "").trim(),
    description,
    problem: data.problem ? String(data.problem) : undefined,
    systemRole: data.systemRole ? String(data.systemRole) : undefined,
    tech: asStringArray(data.tech),
    highlights: asStringArray(data.highlights),
    architectureNotes: asStringArray(data.architectureNotes),
    pipelineSteps: asStringArray(data.pipelineSteps),
    lessons: asStringArray(data.lessons),
    futurePlans: asStringArray(data.futurePlans),
    githubUrl: data.githubUrl ? String(data.githubUrl) : undefined,
    demoUrl: data.demoUrl ? String(data.demoUrl) : undefined,
    confidence,
    featured: data.featured === true || data.featured === "true",
    order: typeof data.order === "number" ? data.order : undefined,
  };
}

export function projectToMarkdown(p: ProjectRecord): string {
  const fm: Record<string, unknown> = {
    slug: p.slug,
    name: p.name,
    status: p.status,
    category: p.category,
    summary: p.summary,
  };
  if (p.problem) fm.problem = p.problem;
  if (p.systemRole) fm.systemRole = p.systemRole;
  if (p.tech?.length) fm.tech = p.tech;
  if (p.highlights?.length) fm.highlights = p.highlights;
  if (p.architectureNotes?.length) fm.architectureNotes = p.architectureNotes;
  if (p.pipelineSteps?.length) fm.pipelineSteps = p.pipelineSteps;
  if (p.lessons?.length) fm.lessons = p.lessons;
  if (p.futurePlans?.length) fm.futurePlans = p.futurePlans;
  if (p.githubUrl) fm.githubUrl = p.githubUrl;
  if (p.demoUrl) fm.demoUrl = p.demoUrl;
  if (p.confidence) fm.confidence = p.confidence;
  if (p.featured) fm.featured = true;
  if (typeof p.order === "number") fm.order = p.order;
  return matter.stringify(`\n${p.description ?? ""}\n`, fm);
}
