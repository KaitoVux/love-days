/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['utils'],
  experimental: {
    esmExternals: true,
  },
}

module.exports = nextConfig
