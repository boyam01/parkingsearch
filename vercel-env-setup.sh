#!/bin/bash

# Vercel 環境變數一鍵設定腳本
# 使用方法: chmod +x vercel-env-setup.sh && ./vercel-env-setup.sh

echo "🚀 開始設定 Vercel 環境變數..."

# 基本 API 設定
vercel env add NEXT_PUBLIC_API_BASE_URL production <<< "/api"
vercel env add NEXT_PUBLIC_API_BASE_URL preview <<< "/api"
vercel env add NEXT_PUBLIC_API_BASE_URL development <<< "/api"

# Ragic API 設定
vercel env add NEXT_PUBLIC_RAGIC_BASE_URL production <<< "https://ap7.ragic.com"
vercel env add NEXT_PUBLIC_RAGIC_BASE_URL preview <<< "https://ap7.ragic.com"
vercel env add NEXT_PUBLIC_RAGIC_BASE_URL development <<< "https://ap7.ragic.com"

vercel env add NEXT_PUBLIC_RAGIC_ACCOUNT production <<< "xinsheng"
vercel env add NEXT_PUBLIC_RAGIC_ACCOUNT preview <<< "xinsheng"
vercel env add NEXT_PUBLIC_RAGIC_ACCOUNT development <<< "xinsheng"

vercel env add NEXT_PUBLIC_RAGIC_API_KEY production <<< "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ=="
vercel env add NEXT_PUBLIC_RAGIC_API_KEY preview <<< "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ=="
vercel env add NEXT_PUBLIC_RAGIC_API_KEY development <<< "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ=="

vercel env add NEXT_PUBLIC_RAGIC_FORM_ID production <<< "31"
vercel env add NEXT_PUBLIC_RAGIC_FORM_ID preview <<< "31"
vercel env add NEXT_PUBLIC_RAGIC_FORM_ID development <<< "31"

vercel env add NEXT_PUBLIC_RAGIC_SUBTABLE_ID production <<< "6"
vercel env add NEXT_PUBLIC_RAGIC_SUBTABLE_ID preview <<< "6"
vercel env add NEXT_PUBLIC_RAGIC_SUBTABLE_ID development <<< "6"

vercel env add NEXT_PUBLIC_RAGIC_ADD_RECORD_ID production <<< "-20000"
vercel env add NEXT_PUBLIC_RAGIC_ADD_RECORD_ID preview <<< "-20000"
vercel env add NEXT_PUBLIC_RAGIC_ADD_RECORD_ID development <<< "-20000"

# 效能設定
vercel env add NEXT_PUBLIC_CACHE_TTL production <<< "60000"
vercel env add NEXT_PUBLIC_CACHE_TTL preview <<< "60000"
vercel env add NEXT_PUBLIC_CACHE_TTL development <<< "60000"

vercel env add NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS production <<< "10"
vercel env add NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS preview <<< "10"
vercel env add NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS development <<< "10"

vercel env add NEXT_PUBLIC_REQUEST_TIMEOUT production <<< "10000"
vercel env add NEXT_PUBLIC_REQUEST_TIMEOUT preview <<< "10000"
vercel env add NEXT_PUBLIC_REQUEST_TIMEOUT development <<< "10000"

# 安全設定
vercel env add NEXTAUTH_SECRET production <<< "parkingsearch-secure-secret-key-2024-production"
vercel env add NEXTAUTH_SECRET preview <<< "parkingsearch-secure-secret-key-2024-preview"
vercel env add NEXTAUTH_SECRET development <<< "parkingsearch-secure-secret-key-2024-dev"

echo "✅ 環境變數設定完成！"
echo ""
echo "🚀 開始部署到生產環境..."
vercel --prod

echo "🎉 部署完成！請檢查 Vercel Dashboard 確認狀態。"
