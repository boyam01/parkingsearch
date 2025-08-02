#!/usr/bin/env powershell
# 🚀 Vercel 環境變數快速設定腳本
# 根據 VERCEL_ENV_CONFIG.md 的設定一次性配置所有環境變數

Write-Host "🚀 Vercel 環境變數快速設定工具" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 檢查 Vercel CLI 是否安裝
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI 版本: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 請先安裝 Vercel CLI: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# 環境變數設定 (根據您提供的表格)
$envVars = @{
    # Ragic 連線設定
    "NEXT_PUBLIC_RAGIC_ACCOUNT" = "xinsheng"
    "RAGIC_ACCOUNT" = "xinsheng"
    
    # API 路徑與認證
    "NEXTAUTH_URL" = "https://parkingsearch.vercel.app"
    "NEXT_PUBLIC_API_BASE_URL" = "https://parkingsearch.vercel.app"
    "NEXTAUTH_SECRET" = "parkingsearch-secure-secret-key-change-this-in-production"
    
    # 性能調校
    "NEXT_PUBLIC_CACHE_TTL" = "60000"
    "NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS" = "10"
    "NEXT_PUBLIC_REQUEST_TIMEOUT" = "10000"
    
    # Ragic 表單操作參數
    "NEXT_PUBLIC_RAGIC_BASE_URL" = "https://ap7.ragic.com"
    "NEXT_PUBLIC_RAGIC_FORM_ID" = "31"
    "NEXT_PUBLIC_RAGIC_SUBTABLE_ID" = "6"
    "NEXT_PUBLIC_RAGIC_ADD_RECORD_ID" = "-20000"
}

# 生產環境專用變數
$prodEnvVars = @{
    "NEXT_PUBLIC_API_BASE_URL_PROD" = "https://parkingsearch.vercel.app/api"
    "ADMIN_EMAIL" = "admin@yourcompany.com"
    "NOTIFICATION_FROM_EMAIL" = "your-email@gmail.com"
    "SMTP_USER" = "your-email@gmail.com"
    "SMTP_PASS" = "your-app-password"
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
}

Write-Host "`n📝 開始設定環境變數..." -ForegroundColor Yellow

# 設定通用環境變數 (All Environments)
foreach ($var in $envVars.GetEnumerator()) {
    $name = $var.Key
    $value = $var.Value
    
    Write-Host "設定 $name..." -ForegroundColor Gray
    
    try {
        vercel env add $name development $value --force | Out-Null
        vercel env add $name preview $value --force | Out-Null
        vercel env add $name production $value --force | Out-Null
        Write-Host "✅ $name" -ForegroundColor Green
    } catch {
        Write-Host "❌ $name 設定失敗" -ForegroundColor Red
    }
}

Write-Host "`n📝 設定生產環境專用變數..." -ForegroundColor Yellow

# 設定生產環境專用變數
foreach ($var in $prodEnvVars.GetEnumerator()) {
    $name = $var.Key
    $value = $var.Value
    
    Write-Host "設定 $name (僅生產環境)..." -ForegroundColor Gray
    
    try {
        vercel env add $name production $value --force | Out-Null
        Write-Host "✅ $name" -ForegroundColor Green
    } catch {
        Write-Host "❌ $name 設定失敗" -ForegroundColor Red
    }
}

Write-Host "`n⚠️  重要提醒:" -ForegroundColor Yellow
Write-Host "1. 請手動設定 NEXT_PUBLIC_RAGIC_API_KEY (敏感資訊)" -ForegroundColor Yellow
Write-Host "2. 請更新 SMTP 相關設定為您的實際信箱配置" -ForegroundColor Yellow
Write-Host "3. 請更新 NEXTAUTH_SECRET 為安全的隨機字串" -ForegroundColor Yellow

Write-Host "`n🔍 手動設定指令:" -ForegroundColor Cyan
Write-Host "vercel env add NEXT_PUBLIC_RAGIC_API_KEY" -ForegroundColor Gray

Write-Host "`n✅ 環境變數設定完成！" -ForegroundColor Green
Write-Host "📋 請查看 VERCEL_ENV_CONFIG.md 了解詳細說明" -ForegroundColor Gray
