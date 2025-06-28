/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
    domains: ['images.unsplash.com', 'cdn.pixabay.com', 'static.wikia.nocookie.net'],
  },
  assetPrefix: isProd ? '/ayauka' : '', // For GitHub Pages
  basePath: isProd ? '/ayauka' : '', // For GitHub Pages
  output: 'export', // Enable static export
  distDir: 'out', // Output directory
};

module.exports = nextConfig;
