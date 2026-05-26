import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Strict mode catches React issues early
  reactStrictMode: true,

  // Allow YouTube thumbnails in ResourceCard img tags
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "img.youtube.com",
        pathname:  "/vi/**",
      },
    ],
  },

  // Silence specific build warnings that aren't real issues
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig