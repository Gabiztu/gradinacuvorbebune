/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  // NU mai pune CSP aici - e deja în middleware.ts
  // NU mai pune Cache-Control aici - e deja în middleware.ts

  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig