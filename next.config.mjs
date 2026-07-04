/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native module — keep it out of the bundle so the
  // server route handlers load it from node_modules at runtime.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
