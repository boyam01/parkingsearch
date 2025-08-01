import type { NextConfig } from "next";
import path from 'path';

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
  // 使用絕對路徑解析，避免 Vercel 部署路徑問題
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // 確保模組解析使用絕對路徑
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // 優化 Vercel 部署的輸出
    if (!dev && !isServer) {
      config.resolve.modules = [
        path.resolve(__dirname, 'node_modules'),
        'node_modules'
      ];
    }
    
    return config;
  },
};

export default nextConfig;
