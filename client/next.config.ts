import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:5000/api'}/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
