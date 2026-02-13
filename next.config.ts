import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "laptop-offers.s3.eu-north-1.amazonaws.com",
        pathname: "/profile-images/**",
      },
    ],
  },
};

export default nextConfig;
