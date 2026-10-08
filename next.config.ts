import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  //output: 'export', // 👈 ESTA LÍNEA es clave para generar `/out`
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.adac.de',
        port: '',
        pathname: '/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
