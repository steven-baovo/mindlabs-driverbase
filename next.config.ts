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
  output: process.env.TAURI_BUILD === "true" ? "export" : undefined,
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.TAURI_BUILD === "true" ? true : undefined,
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
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    if (process.env.TAURI_BUILD === "true") {
      return [];
    }
    return [
      {
        source: "/blog/:path*",
        destination: process.env.NODE_ENV === "development"
          ? "http://localhost:3001/blog/:path*"
          : "https://mindlabs-journal.vercel.app/blog/:path*",
      },
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

