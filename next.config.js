/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
  reactStrictMode: true,
  // Hapus swcMinify karena sudah tidak digunakan di versi Next.js terbaru
};

module.exports = nextConfig;
