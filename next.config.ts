import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirect /oauth-callback → /oauth/callback (backend uses hyphen, page uses slash)
  async redirects() {
    return [
      {
        source: '/oauth-callback',
        destination: '/oauth/callback',
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;