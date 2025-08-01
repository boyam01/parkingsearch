import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 圖片優化設定
  images: {
    unoptimized: true, // 適用於 Netlify/Railway 等平台
  },
  // 確保路由正常工作
  trailingSlash: false,
};

export default nextConfig;
