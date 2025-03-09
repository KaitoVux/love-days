/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Cloudflare Pages specific configuration
    output: 'export',
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;
