import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pkramskzwstuweillocd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    return [
      {
        source: "/journal/:path*",
        destination: process.env.NODE_ENV === "development"
          ? "http://localhost:3001/journal/:path*"
          : "https://mindlabs-journal.vercel.app/journal/:path*",
      },
      {
        source: "/studio/:path*",
        destination: process.env.NODE_ENV === "development"
          ? "http://localhost:3001/studio/:path*"
          : "https://mindlabs-journal.vercel.app/studio/:path*",
      },
    ];
  },
};

export default withPWA(nextConfig);

