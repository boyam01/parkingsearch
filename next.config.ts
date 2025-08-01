import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 圖片優化設定 - Vercel 原生支援
  images: {
    domains: ['ap7.ragic.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // 確保路由正常工作
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  // 確保輸出設定與 Vercel 相容
  output: 'standalone',
};

export default nextConfig;
