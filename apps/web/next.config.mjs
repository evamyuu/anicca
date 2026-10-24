/** @type {import('next').NextConfig} */

// ANICCA_API_ORIGIN lets the panel point at another backend (e.g. the offline demo server).
const apiOrigin = process.env.ANICCA_API_ORIGIN || 'http://127.0.0.1:8000';

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`, // Proxy to Backend FastAPI
      },
    ]
  },
}

export default nextConfig
