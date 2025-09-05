import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uncomment the following lines when building for static export:
  // output: 'export',
  // trailingSlash: true,
  
  images: {
    unoptimized: true,
    domains: ['suryayoga.ge', 'www.suryayoga.ge'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'suryayoga.ge',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.suryayoga.ge',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Security headers for production
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'geolocation=(), microphone=(), camera=()',
            },
          ],
        },
      ];
    }
    return [];
  },

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://suryayoga.ge' : 'http://localhost:3000'),
  },
};

export default nextConfig;
