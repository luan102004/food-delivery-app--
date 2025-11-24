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

  // ❌ Remove this completely – NOT allowed in Next.js 14+
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig;
