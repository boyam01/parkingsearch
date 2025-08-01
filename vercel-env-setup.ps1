# Vercel 環境變數設定腳本 (PowerShell 版本)
# 使用方法: .\vercel-env-setup.ps1

Write-Host "🚀 開始設定 Vercel 環境變數..." -ForegroundColor Cyan

# 基本 API 設定
Write-Host "設定基本 API 配置..." -ForegroundColor Yellow
echo "/api" | vercel env add NEXT_PUBLIC_API_BASE_URL production
echo "/api" | vercel env add NEXT_PUBLIC_API_BASE_URL preview
echo "/api" | vercel env add NEXT_PUBLIC_API_BASE_URL development

# Ragic API 設定
Write-Host "設定 Ragic API 配置..." -ForegroundColor Yellow
echo "https://ap7.ragic.com" | vercel env add NEXT_PUBLIC_RAGIC_BASE_URL production
echo "https://ap7.ragic.com" | vercel env add NEXT_PUBLIC_RAGIC_BASE_URL preview
echo "https://ap7.ragic.com" | vercel env add NEXT_PUBLIC_RAGIC_BASE_URL development

echo "xinsheng" | vercel env add NEXT_PUBLIC_RAGIC_ACCOUNT production
echo "xinsheng" | vercel env add NEXT_PUBLIC_RAGIC_ACCOUNT preview
echo "xinsheng" | vercel env add NEXT_PUBLIC_RAGIC_ACCOUNT development

echo "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==" | vercel env add NEXT_PUBLIC_RAGIC_API_KEY production
echo "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==" | vercel env add NEXT_PUBLIC_RAGIC_API_KEY preview
echo "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==" | vercel env add NEXT_PUBLIC_RAGIC_API_KEY development

echo "31" | vercel env add NEXT_PUBLIC_RAGIC_FORM_ID production
echo "31" | vercel env add NEXT_PUBLIC_RAGIC_FORM_ID preview
echo "31" | vercel env add NEXT_PUBLIC_RAGIC_FORM_ID development

echo "6" | vercel env add NEXT_PUBLIC_RAGIC_SUBTABLE_ID production
echo "6" | vercel env add NEXT_PUBLIC_RAGIC_SUBTABLE_ID preview
echo "6" | vercel env add NEXT_PUBLIC_RAGIC_SUBTABLE_ID development

echo "-20000" | vercel env add NEXT_PUBLIC_RAGIC_ADD_RECORD_ID production
echo "-20000" | vercel env add NEXT_PUBLIC_RAGIC_ADD_RECORD_ID preview
echo "-20000" | vercel env add NEXT_PUBLIC_RAGIC_ADD_RECORD_ID development

# 效能設定
Write-Host "設定效能參數..." -ForegroundColor Yellow
echo "60000" | vercel env add NEXT_PUBLIC_CACHE_TTL production
echo "60000" | vercel env add NEXT_PUBLIC_CACHE_TTL preview
echo "60000" | vercel env add NEXT_PUBLIC_CACHE_TTL development

echo "10" | vercel env add NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS production
echo "10" | vercel env add NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS preview  
echo "10" | vercel env add NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS development

echo "10000" | vercel env add NEXT_PUBLIC_REQUEST_TIMEOUT production
echo "10000" | vercel env add NEXT_PUBLIC_REQUEST_TIMEOUT preview
echo "10000" | vercel env add NEXT_PUBLIC_REQUEST_TIMEOUT development

# 安全設定
Write-Host "設定安全配置..." -ForegroundColor Yellow
echo "parkingsearch-secure-secret-key-2024-production" | vercel env add NEXTAUTH_SECRET production
echo "parkingsearch-secure-secret-key-2024-preview" | vercel env add NEXTAUTH_SECRET preview
echo "parkingsearch-secure-secret-key-2024-dev" | vercel env add NEXTAUTH_SECRET development

Write-Host "✅ 環境變數設定完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 開始部署到生產環境..." -ForegroundColor Cyan
vercel --prod

Write-Host "🎉 部署完成！請檢查 Vercel Dashboard 確認狀態。" -ForegroundColor Green
