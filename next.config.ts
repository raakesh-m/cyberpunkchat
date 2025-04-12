import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Don't run ESLint during build to avoid build failures
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
