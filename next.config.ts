import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure pg + Prisma adapter resolve from node_modules at runtime (Vercel serverless)
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.goat.com",
      },
    ],
  },
};

export default nextConfig;
