/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    // Warnings don't fail the build â€” only errors do
    ignoreDuringBuilds: false,
  },
}

export default nextConfig