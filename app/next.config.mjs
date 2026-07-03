/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nxtraa.online',
        port: '',
        pathname: '/product-images/**',
      },
    ],
  },
};

export default nextConfig;