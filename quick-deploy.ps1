# 快速環境變數設定腳本
# 在 Vercel 項目初始化後執行

Write-Host "🔧 快速設定 Vercel 環境變數..." -ForegroundColor Cyan

# 設定環境變數的函數
function Set-VercelEnv {
    param($name, $value, $target = "production,preview,development")
    try {
        Write-Output $value | vercel env add $name $target
        Write-Host "✅ $name 設定完成" -ForegroundColor Green
    } catch {
        Write-Host "❌ $name 設定失敗" -ForegroundColor Red
    }
}

# 設定所有必要的環境變數
Write-Host "設定 Ragic API 配置..." -ForegroundColor Yellow

Set-VercelEnv "NEXT_PUBLIC_RAGIC_BASE_URL" "https://ap7.ragic.com"
Set-VercelEnv "NEXT_PUBLIC_RAGIC_ACCOUNT" "xinsheng"
Set-VercelEnv "NEXT_PUBLIC_RAGIC_FORM_ID" "31"
Set-VercelEnv "NEXT_PUBLIC_RAGIC_SUBTABLE_ID" "6"
Set-VercelEnv "NEXT_PUBLIC_RAGIC_ADD_RECORD_ID" "-20000"
Set-VercelEnv "NEXT_PUBLIC_RAGIC_API_KEY" "c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdLQUZlVDJQV2M1ZzB5dEYxaUNVWENSS29wekxRL0R6bzBkR1NUaFpVYlJBPQ=="

Write-Host "✅ 環境變數設定完成！" -ForegroundColor Green
Write-Host "🚀 開始生產部署..." -ForegroundColor Cyan

# 部署到生產環境
vercel --prod
