/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'maps.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig