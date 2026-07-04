// -----------------------------------------------------------------------------
// Project data — the source of truth for the Systems pages.
//
// Everything here was built from Carson's actual repositories. Entries marked
// `confidence: "Needs Carson Review"` are either missing a local README or were
// named in the site brief but not found on disk — their copy is intentionally
// thin and should be filled in by Carson rather than invented.
// -----------------------------------------------------------------------------

export type ProjectStatus =
  | "Active"
  | "Prototype"
  | "Experimental"
  | "Planning"
  | "Paused"
  | "Archived"
  | "Needs Review";

export type ProjectCategory =
  | "Infrastructure"
  | "Pipeline"
  | "Backend"
  | "Developer Tool"
  | "Game Server"
  | "Minecraft Tooling"
  | "Automation"
  | "Dashboard"
  | "Protocol"
  | "AI Workflow"
  | "Hardware"
  | "Other";

export type Project = {
  slug: string;
  name: string;
  status: ProjectStatus;
  category: ProjectCategory;
  summary: string;
  description: string;
  problem?: string;
  systemRole?: string;
  tech: string[];
  highlights: string[];
  architectureNotes?: string[];
  pipelineSteps?: string[];
  lessons?: string[];
  futurePlans?: string[];
  githubUrl?: string;
  demoUrl?: string;
  confidence?: "Confirmed" | "Needs Carson Review";
  featured?: boolean;
};

export const projects: Project[] = [
  // ---------------------------------------------------------------------------
  {
    slug: "anchor",
    name: "Anchor",
    status: "Active",
    category: "Infrastructure",
    confidence: "Confirmed",
    featured: true,
    summary:
      "Mount FTP / FTPS / SFTP servers as real Windows drive letters, backed by a kernel-mode filesystem driver — not a sync-to-local-folder.",
    description:
      "Anchor attaches remote FTP/FTPS/SFTP shares as first-class Windows drives using the WinFsp kernel-mode filesystem driver. It runs in the background from the system tray or headless from a CLI. The workspace is split so that the core knows nothing about any wire protocol or about WinFsp itself — a clean, one-way dependency direction that keeps new backends contained.",
    problem:
      "Remote file access on Windows usually means clunky sync tools or third-party GUIs. Anchor makes a remote server behave like a local disk, transparently, at the OS level.",
    systemRole:
      "Infrastructure glue: turns remote transports into native OS filesystem mounts.",
    tech: ["Rust", "WinFsp", "SFTP", "FTP/FTPS", "TOML+", "System tray"],
    highlights: [
      "Kernel-mode mounts via WinFsp — not a background sync folder",
      "Strict one-way crate dependencies: core has no protocol or WinFsp knowledge",
      "Adding a backend (WebDAV, S3, …) is a contained change in one crate",
      "Ships as both a headless CLI (`anchor`) and a tray app (`anchor-tray`)",
      "Delay-loaded WinFsp: binaries build and non-mount commands run without it",
    ],
    architectureNotes: [
      "`anchor-core` — RemoteFs trait, MountManager, config, credentials, caches",
      "`anchor-fs` — the only crate that touches a wire protocol or WinFsp",
      "`anchor-cli` — headless CLI surface",
      "`anchor-tray` — background system-tray app",
    ],
    pipelineSteps: [
      "Config (TOML+)",
      "MountManager",
      "RemoteFs backend",
      "WinFsp host",
      "Windows drive letter",
    ],
    lessons: [
      "Keeping the core protocol-agnostic makes each new transport a small, testable addition rather than a rewrite.",
    ],
    futurePlans: [
      "Additional backends (WebDAV, S3) as contained additions in anchor-fs",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "rivet",
    name: "Rivet",
    status: "Active",
    category: "Developer Tool",
    confidence: "Confirmed",
    featured: true,
    summary:
      "A polyglot project manager and meta-manifest layer for Java, C++, Python, and Rust — one manifest, many native build systems.",
    description:
      "Rivet describes every project with one or more `project.tomlp` manifests and generates the native build configuration each ecosystem expects. It embeds the tomlplus-syntax crate as its parser/validator and layers on cross-file checks a single file can't express: dependency resolution across workspace members, cycle detection, and single-language dependency scoping.",
    problem:
      "Multi-language repos force you to hand-maintain a different manifest format per ecosystem. Rivet makes one typed manifest the source of truth and emits the rest.",
    systemRole:
      "Pipeline layer between a unified manifest and each language's native build tooling.",
    tech: ["Rust", "TOML+", "tomlplus-syntax", "uv", "Conan", "CMake"],
    highlights: [
      "One `project.tomlp` → pyproject.toml, conanfile.txt, CMake scaffolds",
      "Cross-file validation: real workspace members, no circular deps, language scoping",
      "Version translation: caret `^2.31` → each ecosystem's dialect",
      "Source spans preserved for line/column diagnostics",
    ],
    architectureNotes: [
      "manifest/parser.rs — loads project.tomlp via tomlplus-syntax",
      "manifest/schema.rs — the three manifest shapes as typed Rust structs",
      "manifest/validate.rs — Rivet-level cross-file checks",
      "workspace/ — member discovery, inheritance, dependency graph + cycles",
      "generators/ — per-ecosystem build-config emitters",
    ],
    pipelineSteps: [
      "project.tomlp",
      "Parser",
      "Schema + type check",
      "Cross-file validate",
      "Generators",
      "Native build config",
    ],
    lessons: [
      "A meta-manifest only earns its keep if validation catches the errors the underlying tools can't see across files.",
    ],
    futurePlans: [
      "Broaden generator coverage across the four target languages",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "tomlplus",
    name: "TOML+",
    status: "Active",
    category: "Protocol",
    confidence: "Confirmed",
    featured: true,
    summary:
      "TOML, plus the three things it didn't have: variables, parse-time annotations, and block dictionaries. Published to crates.io.",
    description:
      "TOML+ is a strict superset of TOML that adds referenceable variables, validated `@annotations` (type/min/max/enum/…), environment-variable interpolation with fallbacks, and block-dictionary syntax. It ships a Rust core with Python bindings, editor plugins, and a released syntax crate that other projects (like Rivet) build on.",
    problem:
      "Plain TOML has no variables, no validation, and no ergonomic nested dictionaries — so config either stays dumb or grows a bespoke preprocessor. TOML+ folds those into the format itself.",
    systemRole:
      "Configuration protocol / language used as the substrate for other tools.",
    tech: ["Rust", "Python bindings", "crates.io", "CI/CD", "Editor plugins"],
    highlights: [
      "`[vars]` you can reference later in the document",
      "`@type` / `@min` / `@max` / `@enum` annotations validated at parse time",
      "`$ENV.PORT ?? 8080` — env vars with a fallback",
      "`#{ }#` block dictionaries for readable nested config",
      "Released and versioned — the parser is consumed by Rivet",
    ],
    architectureNotes: [
      "crates/ — Rust parser + syntax crate (tomlplus-syntax)",
      "bindings/ — Python bindings over the core",
      "editors/ — editor integration for the syntax",
    ],
    lessons: [
      "Designing a config language means treating validation as a first-class feature, not a linting afterthought.",
    ],
    githubUrl: "https://github.com/CarsonKopec/tomlplus",
  },
  // ---------------------------------------------------------------------------
  {
    slug: "toolbox",
    name: "ToolBox",
    status: "Prototype",
    category: "Infrastructure",
    confidence: "Confirmed",
    featured: true,
    summary:
      "Portable, relocatable tool environments — carry your toolbelt between machines and paths, and it just keeps working.",
    description:
      "ToolBox manages self-contained environments of CLI tools, libraries, and scripts. An env is an ordinary directory you can copy to a USB stick or move to another drive, and the binaries inside keep working because ToolBox rewrites the absolute paths baked into them when the env moves. Tools are distributed as OCI artifacts — the same registries that host container images.",
    problem:
      "Existing tool managers tie an environment to a fixed install path; move it and the shebangs, RPATHs, and embedded path constants break.",
    systemRole:
      "Infrastructure: position-independent, relocatable developer environments.",
    tech: ["Rust", "OCI artifacts", "PowerShell / POSIX shell hooks"],
    highlights: [
      "Position-independent envs via a baked-in `__TOOLBOX_PREFIX__` sentinel",
      "Sentinel is patched to the current mount point on activation",
      "Tools distributed as OCI artifacts from standard registries",
      "Single Rust binary + shell hook for live `activate`",
      "Core loop (create / install / activate / run / relocate) covered by e2e tests",
    ],
    pipelineSteps: [
      "Create env",
      "Install (OCI / local)",
      "Bake path sentinel",
      "Activate",
      "Relocate → re-patch",
    ],
    lessons: [
      "Relocatability has to be designed into the layout from the start — patching paths after the fact is the whole game.",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "tooling-env",
    name: "shed (tooling-env)",
    status: "Prototype",
    category: "Automation",
    confidence: "Confirmed",
    summary:
      "Per-env script collections with pinned Python venvs, driven by thin shell wrappers that mutate the parent shell.",
    description:
      "shed manages named environments, each a collection of scripts backed by a pinned Python virtualenv. A Python core does the real work and is invoked by small PowerShell / POSIX wrappers; subcommands prefixed with `_` print shell code on stdout that the parent shell sources — that's how activate/deactivate mutate the live environment.",
    problem:
      "Ad-hoc scripts drift across machines and Python versions. shed pins each collection to its own venv and makes activation a first-class, scriptable action.",
    systemRole:
      "Automation: reproducible, per-project script + venv environments.",
    tech: ["Python", "PowerShell", "POSIX shell", "venv"],
    highlights: [
      "Pinned Python venv per environment",
      "Shell wrappers source generated code to mutate the parent shell",
      "`SHED_HOME` layout for envs and metadata",
    ],
    lessons: [
      "Mutating the parent shell cleanly means emitting shell code, not trying to reach out of the child process.",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "serialx",
    name: "serialx",
    status: "Prototype",
    category: "Developer Tool",
    confidence: "Confirmed",
    summary:
      "A TypeScript library for detecting and interacting with serial-connected devices through unified exec and filesystem APIs.",
    description:
      "serialx gives headless / MicroPython-style devices a consistent programmatic surface: detect connected boards, run commands, and read/write their filesystem through one API regardless of the underlying transport. It's the library layer that the Serial Port IDE builds on.",
    problem:
      "Talking to serial devices means a pile of one-off scripts per board. serialx unifies exec and filesystem access behind a single typed interface.",
    systemRole:
      "Developer tool / device transport layer for headless hardware.",
    tech: ["TypeScript", "Serial", "MicroPython", "Biome"],
    highlights: [
      "Unified exec + filesystem APIs across serial devices",
      "Device detection for connected boards",
      "Roadmap ports mpremote's filesystem walker (recursive cp/rm, stat, CRC)",
    ],
    futurePlans: [
      "Recursive directory cp/rm, progress reporting, CRC verification, streaming cat",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "serial-port-ide",
    name: "Serial Port IDE",
    status: "Experimental",
    category: "Developer Tool",
    confidence: "Confirmed",
    summary:
      "A serial-first IDE and remote development toolset for headless devices, delivered as a VS Code extension.",
    description:
      "Serial Port IDE brings editor-grade workflows to devices that only expose a serial port: connect to a board, browse and open files on its filesystem, and drive remote development from inside VS Code. It sits on top of the serialx transport layer.",
    problem:
      "Headless devices lack a real dev environment — you're stuck in a terminal REPL. This turns the serial link into a browsable, editable workspace.",
    systemRole:
      "Developer tool: editor integration over the serial device transport.",
    tech: ["TypeScript", "VS Code Extension API", "serialx"],
    highlights: [
      "Connect-to-device command and serial file explorer inside VS Code",
      "Open and refresh files living on the device's filesystem",
      "Built on the serialx unified device API",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "codegraph-desktop",
    name: "Codegraph Desktop",
    status: "Active",
    category: "Developer Tool",
    confidence: "Confirmed",
    summary:
      "A desktop app for visualizing and learning Python codebases through interactive, force-directed node graphs.",
    description:
      "Codegraph scans a Python project directly (no manual JSON export) and renders it as an interactive graph you can explore, annotate, and turn into a learning path. It tracks understanding with visual progress, opens any node in VS Code at the exact line, and exports notes as Markdown, JSON, or images.",
    problem:
      "Reading an unfamiliar codebase linearly is slow. A navigable graph plus a learning-path overlay makes structure and dependencies legible.",
    systemRole:
      "Developer tool: static-analysis visualization + a learning workflow.",
    tech: ["Electron", "Force-directed graph", "Python scanner", "VS Code integration"],
    highlights: [
      "Scans any Python project directly — no manual JSON generation",
      "Learning mode: mark understood, take notes, build learning paths",
      "Jump to any node in VS Code at the exact line",
      "Export notes/paths as Markdown, JSON, or PNG",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "thermoconsole",
    name: "ThermoConsole",
    status: "Prototype",
    category: "Hardware",
    confidence: "Confirmed",
    featured: true,
    summary:
      "A custom handheld game console built on a Raspberry Pi Zero — 2.8\" DPI LCD, 10-button input, and a Lua game engine.",
    description:
      "ThermoConsole is a from-scratch handheld: a Raspberry Pi Zero drives a Waveshare 2.8\" 640×480 DPI LCD, with a Pi Pico handling 10 buttons over I2C. Games are written in Lua against a PICO-8-inspired API, targeting 60 FPS, with a save system and audio for SFX and music. It ships as a flashable OS image.",
    problem:
      "Learning the full stack — display bring-up, input over I2C, a game runtime — by building a real device end to end rather than in simulation.",
    systemRole:
      "Hardware + runtime: a bespoke console with a scriptable game API.",
    tech: ["Raspberry Pi Zero", "Pi Pico", "Lua", "I2C", "DPI LCD", "Linux"],
    highlights: [
      "640×480 landscape Waveshare 2.8\" DPI LCD",
      "10-button input (D-pad + A/B/X/Y + Start/Select) via Pi Pico over I2C",
      "PICO-8-inspired Lua scripting API targeting 60 FPS",
      "Save system + audio; distributed as a flashable OS image",
    ],
    architectureNotes: [
      "Display: DPI LCD bring-up on the Pi Zero",
      "Input: Pi Pico I2C controller reporting button state",
      "Runtime: Lua game loop against a fixed API",
    ],
  },
  // ---------------------------------------------------------------------------
  {
    slug: "minesight",
    name: "MineSight",
    status: "Active",
    category: "Minecraft Tooling",
    confidence: "Confirmed",
    featured: true,
    summary:
      "Real-time AI perception for Minecraft — a Python ML engine detects ores on-screen with YOLO and streams them to a Forge mod that draws the overlays.",
    description:
      "A Python ML engine captures the Minecraft window, runs YOLO26s ore detection on the GPU, and streams results over a WebSocket to a lightweight Forge 1.8.9 client mod that renders them as overlays — the mod does no detection itself. All spec phases (1–5) are complete: detection, tracking, ore memory, 3D world markers, and radar/suggestions. A PySide6 Control Panel ties together model training, datasets, and the engine, and an automated in-game collector generates perfectly-labeled training data.",
    problem:
      "Running perception on a game means someone has to own the split between heavy GPU inference and light in-game rendering. MineSight keeps detection entirely in the Python engine and leaves the mod as a thin renderer, connected by a defined protocol.",
    systemRole:
      "Real-time perception pipeline: screen capture → GPU inference → WebSocket → in-game overlay.",
    tech: [
      "Python",
      "YOLO26s / Ultralytics",
      "PyTorch",
      "mss",
      "WebSockets",
      "PySide6",
      "Forge 1.8.9",
      "Java",
      "Gradle",
    ],
    highlights: [
      "Python engine + Forge mod split over a WebSocket JSON protocol (mod = client, engine = server)",
      "YOLO26s ore detection on the GPU; the mod renders overlays and never detects",
      "PySide6 Control Panel: pick weights, train models, inspect dataset health, deploy in one click",
      "Automated collector: teleports the player, projects ore boxes from real block positions, and raycasts occlusion for perfectly-labeled screenshots",
      "Multi-module Forge build — detection (2D overlay), world (memory/3D/radar), collector — over a shared core",
    ],
    architectureNotes: [
      "engine/ — Python `minesight` package (mss capture + YOLO26s + WebSocket) and train.py",
      "engine/minesight_gui/ — PySide6 Control Panel for models, datasets, training, and the engine",
      "mod/ — Forge 1.8.9 mods (detection / world / collector) sharing a compiled core library",
      "Protocol — ws://127.0.0.1:8765: player state → engine, detections → mod",
    ],
    pipelineSteps: [
      "Screen capture (mss)",
      "YOLO26s (GPU)",
      "Tracking + ore memory",
      "WebSocket",
      "Forge mod overlay",
    ],
    lessons: [
      "Keeping the mod detection-free and pushing all inference into the Python engine makes the game side cheap and the model side independently trainable and swappable.",
    ],
    githubUrl: "https://github.com/CarsonKopec/Minesight",
  },

];

// ---- helpers ----------------------------------------------------------------

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}
