#!/bin/bash
# 🚀 Vercel 環境變數快速設定腳本 (Linux/macOS)
# 根據 VERCEL_ENV_CONFIG.md 的設定一次性配置所有環境變數

echo "🚀 Vercel 環境變數快速設定工具"
echo "================================="

# 檢查 Vercel CLI 是否安裝
if ! command -v vercel &> /dev/null; then
    echo "❌ 請先安裝 Vercel CLI: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 已安裝: $(vercel --version)"

# 環境變數設定 - 基礎配置
declare -A env_vars=(
    ["NEXT_PUBLIC_RAGIC_ACCOUNT"]="xinsheng"
    ["RAGIC_ACCOUNT"]="xinsheng"
    ["NEXTAUTH_URL"]="https://parkingsearch.vercel.app"
    ["NEXT_PUBLIC_API_BASE_URL"]="https://parkingsearch.vercel.app"
    ["NEXTAUTH_SECRET"]="parkingsearch-secure-secret-key-change-this-in-production"
    ["NEXT_PUBLIC_CACHE_TTL"]="60000"
    ["NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS"]="10"
    ["NEXT_PUBLIC_REQUEST_TIMEOUT"]="10000"
    ["NEXT_PUBLIC_RAGIC_BASE_URL"]="https://ap7.ragic.com"
    ["NEXT_PUBLIC_RAGIC_FORM_ID"]="31"
    ["NEXT_PUBLIC_RAGIC_SUBTABLE_ID"]="6"
    ["NEXT_PUBLIC_RAGIC_ADD_RECORD_ID"]="-20000"
)

# 生產環境專用變數
declare -A prod_env_vars=(
    ["NEXT_PUBLIC_API_BASE_URL_PROD"]="https://parkingsearch.vercel.app/api"
    ["ADMIN_EMAIL"]="admin@yourcompany.com"
    ["NOTIFICATION_FROM_EMAIL"]="your-email@gmail.com"
    ["SMTP_USER"]="your-email@gmail.com"
    ["SMTP_PASS"]="your-app-password"
    ["SMTP_HOST"]="smtp.gmail.com"
    ["SMTP_PORT"]="587"
)

echo
echo "📝 開始設定環境變數..."

# 設定通用環境變數
for name in "${!env_vars[@]}"; do
    value="${env_vars[$name]}"
    echo "設定 $name..."
    
    if vercel env add "$name" development "$value" --force > /dev/null 2>&1 && \
       vercel env add "$name" preview "$value" --force > /dev/null 2>&1 && \
       vercel env add "$name" production "$value" --force > /dev/null 2>&1; then
        echo "✅ $name"
    else
        echo "❌ $name 設定失敗"
    fi
done

echo
echo "📝 設定生產環境專用變數..."

# 設定生產環境專用變數
for name in "${!prod_env_vars[@]}"; do
    value="${prod_env_vars[$name]}"
    echo "設定 $name (僅生產環境)..."
    
    if vercel env add "$name" production "$value" --force > /dev/null 2>&1; then
        echo "✅ $name"
    else
        echo "❌ $name 設定失敗"
    fi
done

echo
echo "⚠️  重要提醒:"
echo "1. 請手動設定 NEXT_PUBLIC_RAGIC_API_KEY (敏感資訊)"
echo "2. 請更新 SMTP 相關設定為您的實際信箱配置"
echo "3. 請更新 NEXTAUTH_SECRET 為安全的隨機字串"

echo
echo "🔍 手動設定指令:"
echo "vercel env add NEXT_PUBLIC_RAGIC_API_KEY"

echo
echo "✅ 環境變數設定完成！"
echo "📋 請查看 VERCEL_ENV_CONFIG.md 了解詳細說明"
