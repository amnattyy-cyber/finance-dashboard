import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/finance-dashboard",
  assetPrefix: "/finance-dashboard/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
