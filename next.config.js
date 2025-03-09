/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    basePath: '',
};

module.exports = nextConfig;
