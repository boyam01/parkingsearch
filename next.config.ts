import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Netlify 部署優化
  trailingSlash: false,
  images: {
    unoptimized: true, // Netlify 圖片優化
  },
  // 輸出配置
  output: 'standalone',
};

export default nextConfig;
