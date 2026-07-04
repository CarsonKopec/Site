import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Carson — Builder",
    template: "%s | Carson",
  },
  description:
    "Personal site for Carson — a systems-minded builder working across infrastructure and developer tools, game and Minecraft systems, computer vision, and custom hardware, plus technical project notes.",
  keywords: [
    "systems",
    "developer tools",
    "infrastructure",
    "game systems",
    "Minecraft",
    "computer vision",
    "machine learning",
    "hardware",
    "Rust",
    "Java",
    "TypeScript",
  ],
  openGraph: {
    title: "Carson — Builder",
    description:
      "Systems, tools, games, ML/CV, and hardware — built mostly to understand how they work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carson — Builder",
    description:
      "Systems, tools, games, ML/CV, and hardware — built mostly to understand how they work.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-surface-2 focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
