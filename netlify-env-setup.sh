#!/bin/bash

# Netlify 環境變數一鍵設定腳本
echo "🚀 開始設定 Netlify 環境變數..."

# 檢查是否安裝了 Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI 未安裝，正在安裝..."
    npm install -g netlify-cli
fi

# 登入 Netlify（如果尚未登入）
echo "🔐 請確保您已登入 Netlify..."
netlify status

# 設定環境變數
echo "📝 設定環境變數..."

# 基本 API 設定
netlify env:set NEXT_PUBLIC_API_BASE_URL "/api"
netlify env:set NODE_ENV "production"

# Ragic API 設定
netlify env:set NEXT_PUBLIC_RAGIC_BASE_URL "https://ap7.ragic.com"
netlify env:set NEXT_PUBLIC_RAGIC_ACCOUNT "xinsheng"
netlify env:set NEXT_PUBLIC_RAGIC_API_KEY "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ=="
netlify env:set NEXT_PUBLIC_RAGIC_FORM_ID "31"
netlify env:set NEXT_PUBLIC_RAGIC_SUBTABLE_ID "6"
netlify env:set NEXT_PUBLIC_RAGIC_ADD_RECORD_ID "-20000"

# 效能優化設定
netlify env:set NEXT_PUBLIC_CACHE_TTL "60000"
netlify env:set NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS "10"
netlify env:set NEXT_PUBLIC_REQUEST_TIMEOUT "10000"

# Auth 設定
netlify env:set NEXTAUTH_SECRET "your-secure-production-secret-key"
netlify env:set NEXTAUTH_URL "https://your-site-name.netlify.app"

echo "✅ 環境變數設定完成！"
echo "🔧 請記得更新 NEXTAUTH_URL 為您的實際 Netlify 網址"
