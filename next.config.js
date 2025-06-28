/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'cdn.pixabay.com', 'static.wikia.nocookie.net'],
  },
};

module.exports = nextConfig;
