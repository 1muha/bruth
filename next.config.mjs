/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // HTTPS configuration for development
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Enable HTTPS in development
  devIndicators: {
    buildActivity: true,
  },
}

export default nextConfig