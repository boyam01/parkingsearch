# Vercel 部署準備和執行腳本
# 使用方法: .\deploy-to-vercel.ps1

Write-Host "🚀 開始部署到 Vercel..." -ForegroundColor Cyan

# 1. 確認當前目錄
Write-Host "📂 當前目錄: $(Get-Location)" -ForegroundColor Yellow

# 2. 檢查重要檔案
$requiredFiles = @("package.json", "next.config.ts", ".env.local")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $file 不存在！" -ForegroundColor Red
    }
}

# 3. 檢查 Vercel 登入狀態
try {
    $whoami = vercel whoami 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 已登入 Vercel: $whoami" -ForegroundColor Green
    } else {
        Write-Host "❌ 請先執行 'vercel login'" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 無法檢查 Vercel 登入狀態" -ForegroundColor Red
    exit 1
}

# 4. 初始化項目（如果需要）
Write-Host "🔧 初始化 Vercel 項目..." -ForegroundColor Yellow
vercel

Write-Host "✅ 部署準備完成！" -ForegroundColor Green
Write-Host ""
Write-Host "接下來請執行環境變數設定腳本:" -ForegroundColor Cyan
Write-Host ".\vercel-env-setup.ps1" -ForegroundColor White
