import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // El patrón que ya tenías (lo conservamos)
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // El nuevo patrón que añadimos para las imágenes de coches
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

