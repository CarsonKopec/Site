// Skills grouped around Carson's current systems direction.

export type SkillGroup = {
  title: string;
  blurb: string;
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Systems & Backend",
    blurb: "Designing the services and flows underneath a project.",
    skills: [
      "Backend architecture",
      "Server management",
      "Service design",
      "APIs",
      "Protocol experiments",
      "Async systems",
      "Event-driven architecture",
      "Request / response flows",
    ],
  },
  {
    title: "Pipelines & Automation",
    blurb: "Wiring tools together so work moves without a human in the loop.",
    skills: [
      "Automation workflows",
      "Data pipelines",
      "Build pipelines",
      "Tool orchestration",
      "Scripted workflows",
      "AI-assisted planning",
      "System integration",
    ],
  },
  {
    title: "Infrastructure",
    blurb: "Self-hosting and running real servers, not just deploying to a PaaS.",
    skills: [
      "Linux servers",
      "Self-hosting",
      "Cloudflare tunnels",
      "Docker / container concepts",
      "Server panels",
      "Deployment workflows",
      "Observability basics",
      "Debugging real server issues",
    ],
  },
  {
    title: "Programming",
    blurb: "Languages picked to fit the layer of the system being built.",
    skills: [
      "Java",
      "Python",
      "TypeScript",
      "JavaScript",
      "Rust experiments",
      "C / C++",
      "SQL / SQLite",
      "Lua experiments",
    ],
  },
  {
    title: "Project Areas",
    blurb: "Where the systems thinking actually gets applied.",
    skills: [
      "Minecraft tooling",
      "Game server systems",
      "Developer tools",
      "Raspberry Pi / device tooling",
      "Dashboards",
      "Protocol tooling",
      "Automation systems",
      "AI-assisted engineering workflows",
    ],
  },
];
