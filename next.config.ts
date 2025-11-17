import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Static HTML export (fully client-side)
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
