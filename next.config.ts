import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uncomment the following lines when building for static export:
  // output: 'export',
  // trailingSlash: true,
  
  images: {
    unoptimized: true,
    domains: ['suryayoga.ge', 'www.suryayoga.ge', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'suryayoga.ge',
        port: '',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'www.suryayoga.ge',
        port: '',
        pathname: '/api/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
    ],
  },
  
  // Maximum size for server actions (2GB)
  experimental: {
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
  
  // Combined headers for security and CORS
  async headers() {
    const headers = [];
    
    // CORS headers for API routes
    headers.push({
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NODE_ENV === 'production' 
            ? 'https://suryayoga.ge' 
            : 'http://localhost:3000',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
        {
          key: 'Access-Control-Allow-Credentials',
          value: 'true',
        },
      ],
    });
    
    // Security headers for production
    if (process.env.NODE_ENV === 'production') {
      headers.push({
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
      });
    }
    
    return headers;
  },

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://suryayoga.ge' : 'http://localhost:3000'),
  },
};

export default nextConfig;