/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/fpl",
  images: { unoptimized: true }, // Required for static export
  trailingSlash: true, // Match current URL structure
};

export default nextConfig;
