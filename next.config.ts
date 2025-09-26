import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Enable large file uploads
    serverActions: {
      bodySizeLimit: "350mb", // Slightly higher than our 300MB limit
    },
  },
  images: {
    domains: ["qtt.s3.ir-thr-at1.arvanstorage.ir"],
  },
  // API route configuration for large uploads
  api: {
    bodyParser: {
      sizeLimit: "350mb", // Slightly higher than our 300MB limit
    },
  },
};

export default nextConfig;
