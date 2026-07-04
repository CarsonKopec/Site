// -----------------------------------------------------------------------------
// Notes = the public engineering notebook (Architecture Notes page).
// Devlog = shorter build updates.
//
// The architecture notes below are grounded in real design decisions from
// Carson's projects. The devlog entries marked `placeholder: true` are seeded
// titles from the brief for Carson to flesh out.
// -----------------------------------------------------------------------------

export type NoteCategory =
  | "Architecture"
  | "Pipeline Design"
  | "Infrastructure"
  | "Debugging"
  | "Deployment"
  | "AI-Assisted Development"
  | "Minecraft / Game Systems"
  | "Server Notes"
  | "Build Log";

export type NoteBlock = {
  heading?: string;
  body: string;
};

export type Note = {
  slug: string;
  title: string;
  category: NoteCategory;
  date: string; // ISO
  summary: string;
  related?: string[]; // project slugs
  pipeline?: string[];
  content: NoteBlock[];
  placeholder?: boolean;
};

export const notes: Note[] = [
  {
    slug: "one-way-dependencies",
    title: "Keeping the core ignorant: one-way dependencies in Anchor",
    category: "Architecture",
    date: "2026-06-18",
    summary:
      "Why Anchor's core crate knows nothing about WinFsp or any wire protocol — and what that buys when adding a new backend.",
    related: ["anchor"],
    content: [
      {
        body: "Anchor mounts remote FTP/SFTP servers as Windows drives. The temptation with a project like that is to let the mounting layer, the protocol clients, and the core logic all reference each other freely. That works right up until you want to add a second protocol or test the core without a kernel driver installed.",
      },
      {
        heading: "The rule",
        body: "Dependencies point one way. `anchor-core` owns the RemoteFs trait, the MountManager, config, credentials, and caches — and it has zero knowledge of WinFsp or any wire protocol. `anchor-fs` is the only crate allowed to touch a wire protocol or WinFsp. The CLI and tray app sit on top of core.",
      },
      {
        heading: "What it buys",
        body: "Adding a WebDAV or S3 backend is a contained change in one crate instead of a ripple through the whole tree. The core builds and tests without WinFsp installed at all — the driver is delay-loaded, so non-mount commands run on a machine that has never seen WinFsp. The boundary is the feature, not an accident of the module layout.",
      },
    ],
  },
  {
    slug: "meta-manifest-validation",
    title: "A meta-manifest only earns its keep at the validation layer",
    category: "Pipeline Design",
    date: "2026-06-10",
    summary:
      "Rivet generates native build configs from one manifest — but the real value is catching the cross-file errors the underlying tools can't see.",
    related: ["rivet", "tomlplus"],
    pipeline: [
      "project.tomlp",
      "Parser",
      "Schema check",
      "Cross-file validate",
      "Generators",
      "Native build config",
    ],
    content: [
      {
        body: "Rivet describes Java, C++, Python, and Rust projects with one `project.tomlp` and emits each ecosystem's native build config. It would be easy to stop there and call it a templating tool. But generation alone doesn't justify a new layer — you could hand-write those files.",
      },
      {
        heading: "The checks a single file can't express",
        body: "The payoff is validation that spans files: every dependency entry has to reference a real workspace member; internal dependency chains can't form cycles; a dependency can't cross language boundaries. None of those are things `pyproject.toml` or a CMake file can enforce about your repo — they only make sense one level up.",
      },
      {
        heading: "Version translation",
        body: "One manifest version string gets translated into each ecosystem's dialect — a caret `^2.31` becomes `>=2.31,<3.0` for the tools that want ranges. The manifest stays the single source of truth; the generators speak each tool's language.",
      },
    ],
  },
  {
    slug: "relocatable-by-design",
    title: "Relocatable has to be designed in, not bolted on",
    category: "Infrastructure",
    date: "2026-05-28",
    summary:
      "ToolBox lets you move a tool environment across drives and machines. That only works because the layout was built around a path sentinel from the start.",
    related: ["toolbox"],
    pipeline: ["Create env", "Install", "Bake sentinel", "Activate", "Relocate → re-patch"],
    content: [
      {
        body: "Every tool manager ties an environment to its install path. Move it and the shebangs, RPATHs, and embedded path constants break. ToolBox's whole premise is that you can copy an env to a USB stick or a different drive and it keeps working.",
      },
      {
        heading: "The sentinel",
        body: "Wherever the env's own absolute path would be baked into a binary or script, ToolBox bakes in a sentinel — `__TOOLBOX_PREFIX__` — instead. On activation it patches that sentinel to wherever the env is mounted right now. The env is position-independent because nothing inside it hardcodes where it lives.",
      },
      {
        heading: "Why it can't be an afterthought",
        body: "You can't retrofit this. Either the paths were written as sentinels when the env was built, or they're already concrete and broken the moment you move them. The relocation logic is cheap; designing the layout so relocation is even possible is the actual work.",
      },
    ],
  },
  {
    slug: "mutating-the-parent-shell",
    title: "How a child process changes the shell that launched it",
    category: "Architecture",
    date: "2026-05-15",
    summary:
      "shed activates environments by emitting shell code for the parent to source — the only clean way a subprocess can mutate its caller's environment.",
    related: ["tooling-env"],
    content: [
      {
        body: "shed manages per-project script collections, each pinned to its own Python venv. Activating one has to change the *current* shell's environment — PATH, variables, the works. But a child process can't reach up and modify its parent's environment. That's a hard boundary in every OS.",
      },
      {
        heading: "Emit, don't reach",
        body: "The trick is inversion: subcommands prefixed with `_` print shell code to stdout, and thin PowerShell / POSIX wrappers `source` (or `Invoke-Expression`) that output in the parent. The child never mutates the parent — it hands the parent a script and the parent runs it on itself.",
      },
      {
        heading: "The general pattern",
        body: "Anything that has to alter a live shell — direnv, virtualenv activation, version managers — uses some version of this. Once you see it as 'generate code for the caller to execute,' the same shape shows up across a lot of tooling.",
      },
    ],
  },
  {
    slug: "cartridges-over-core",
    title: "Cartridges: adding a compile target without touching the engine",
    category: "Architecture",
    date: "2026-05-02",
    summary:
      "NodeForge compiles a node graph to Java. New targets plug in as self-contained cartridges so the core codegen contract stays target-agnostic.",
    related: ["nodeforge"],
    pipeline: ["Node graph", "Codegen engine", "Java source", "Gradle / javac", "JAR"],
    content: [
      {
        body: "In NodeForge the node graph is the source of truth: it emits Java source, and a real Gradle/javac toolchain builds it into a JAR. The risk with a codegen tool is that each new output target leaks into the core until the engine 'knows about' Discord bots, Spigot plugins, and Forge mods directly.",
      },
      {
        heading: "The cartridge contract",
        body: "Each target is a cartridge that provides three things and nothing more: a node library + palette, per-node codegen, and a project scaffold. The core defines the codegen contract; cartridges implement it. Adding a target never touches core.",
      },
      {
        heading: "Proof it holds",
        body: "The core carries a unified id space for nodes and pins so there are no collisions, and JSON graph save/load is verified lossless via round-trip codegen. A slice graph like `OnSlashCommand(\"ping\") -> Reply(\"pong!\")` generates a complete, buildable Gradle JDA project whose Java compiles with javac — end to end, without the engine knowing what JDA is.",
      },
    ],
  },
];

// ---- Devlog -----------------------------------------------------------------

export type DevlogPost = {
  slug: string;
  title: string;
  category: NoteCategory;
  date: string;
  summary: string;
  placeholder?: boolean;
};

export const devlogPosts: DevlogPost[] = [
  {
    slug: "designing-projects-like-systems",
    title: "Designing Projects Like Systems, Not Just Apps",
    category: "Architecture",
    date: "2026-06-20",
    summary:
      "How my projects shifted from 'an app that does X' to 'a system with a core, transports, and a plugin edge.' Placeholder — to be written.",
    placeholder: true,
  },
  {
    slug: "thinking-in-pipelines",
    title: "Why I Started Thinking More in Pipelines",
    category: "Pipeline Design",
    date: "2026-06-05",
    summary:
      "Input → process → validate → store → surface. Framing work as a pipeline made it easier to test and extend. Placeholder — to be written.",
    placeholder: true,
  },
  {
    slug: "experiments-into-infrastructure",
    title: "Turning Experiments Into Infrastructure",
    category: "Build Log",
    date: "2026-05-22",
    summary:
      "Notes on the point where a throwaway experiment becomes something other projects depend on. Placeholder — to be written.",
    placeholder: true,
  },
  {
    slug: "claude-as-a-development-partner",
    title: "Using Claude as a Development Partner",
    category: "AI-Assisted Development",
    date: "2026-05-08",
    summary:
      "Using AI for specs, architecture reasoning, and refactoring — without handing over understanding of the system. Placeholder — to be written.",
    placeholder: true,
  },
  {
    slug: "dashboards-and-observability",
    title: "How I Think About Dashboards and Observability",
    category: "Infrastructure",
    date: "2026-04-24",
    summary:
      "Making systems observable, scriptable, and easy to extend from the first version. Placeholder — to be written.",
    placeholder: true,
  },
];

export function getNote(slug: string): Note | undefined {
  return notes.find((n) => n.slug === slug);
}

export function getNoteSlugs(): string[] {
  return notes.map((n) => n.slug);
}
