import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/webp'],
    qualities: [75, 90, 95],
  },
};

export default nextConfig;
