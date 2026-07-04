// Seed the SQLite store from the original static data so nothing is lost when
// the site switches to DB-backed content. Idempotent: by default it only seeds
// empty tables. Pass --force to re-upsert everything from the seed data.
//
//   npm run seed            # seed if empty
//   npm run seed -- --force # overwrite from seed data
//
// Relative imports (not @/…) so it runs under tsx without path-alias config.

import {
  counts,
  upsertBlog,
  upsertNote,
  upsertProject,
  type ProjectRecord,
} from "../src/lib/db";
import { projects as seedProjects } from "../src/data/projects";
import { devlogPosts, notes as seedNotes } from "../src/data/notes";

const force = process.argv.includes("--force");

function seedProjectsTable() {
  const existing = counts().projects;
  if (existing > 0 && !force) {
    console.log(`projects: ${existing} already present — skipping (use --force)`);
    return;
  }
  seedProjects.forEach((p, i) => {
    const rec: ProjectRecord = { ...p, order: (i + 1) * 10 };
    upsertProject(rec);
  });
  console.log(`projects: seeded ${seedProjects.length}`);
}

function seedBlogTable() {
  const existing = counts().blog;
  if (existing > 0 && !force) {
    console.log(`blog: ${existing} already present — skipping (use --force)`);
    return;
  }
  for (const post of devlogPosts) {
    upsertBlog({
      slug: post.slug,
      title: post.title,
      category: post.category,
      date: post.date,
      summary: post.summary,
      // The seed devlog entries were stubs; give them a minimal body.
      body: `${post.summary}\n\n_This post was seeded from the original devlog stub. Replace it by pushing a real markdown file with \`carsonctl blog push\`._`,
      draft: Boolean(post.placeholder),
    });
  }
  console.log(`blog: seeded ${devlogPosts.length}`);
}

function seedNotesTable() {
  const existing = counts().notes;
  if (existing > 0 && !force) {
    console.log(`notes: ${existing} already present — skipping (use --force)`);
    return;
  }
  for (const n of seedNotes) {
    // Flatten the structured content blocks into a markdown body.
    const body = n.content
      .map((b) => (b.heading ? `## ${b.heading}\n\n${b.body}` : b.body))
      .join("\n\n");
    upsertNote({
      slug: n.slug,
      title: n.title,
      category: n.category,
      date: n.date,
      summary: n.summary,
      body,
      related: n.related ?? [],
      pipeline: n.pipeline ?? [],
    });
  }
  console.log(`notes: seeded ${seedNotes.length}`);
}

seedProjectsTable();
seedNotesTable();
seedBlogTable();
console.log("done:", counts());
