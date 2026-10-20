import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  //output: 'export', // 👈 ESTA LÍNEA es clave para generar `/out`
  output: 'standalone',
  // En producción se eliminan los console.log/info/debug del bundle;
  // console.error y console.warn se conservan para diagnosticar fallos.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
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
