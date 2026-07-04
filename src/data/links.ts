// External links. Placeholders where a real URL isn't known — do not invent.

export type LinkItem = {
  label: string;
  href: string;
  description: string;
  handle?: string;
  placeholder?: boolean;
};

export const links: LinkItem[] = [
  {
    label: "GitHub",
    href: "https://github.com/CarsonKopec",
    handle: "@CarsonKopec",
    description: "Systems, tools, and experiments — most of what's on this site lives here.",
  },
  {
    label: "TOML+ (main published project)",
    href: "https://github.com/CarsonKopec/tomlplus",
    handle: "CarsonKopec/tomlplus",
    description: "The config language with variables, annotations, and block dicts. Released on crates.io.",
  },
  {
    label: "Email",
    href: "mailto:kopeccarson@gmail.com",
    description: "Contact email here.",
  },
  {
    label: "Resume / project document",
    href: "/resume.pdf",
    description: "Download Carson's resume as a PDF.",
  },
];

// Convenience for the footer / hero buttons.
export const githubUrl = "https://github.com/CarsonKopec";
