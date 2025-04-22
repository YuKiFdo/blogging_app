import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
      
      config.externals.push({
        '@prisma/client': '@prisma/client',
        '.prisma/client': '.prisma/client'
      });
    }
    return config;
  },
  
  // Optional: Enable standalone output for better Prisma compatibility
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;