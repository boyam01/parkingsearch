# GitHub 設定和推送腳本
# 使用方法: .\github-setup.ps1

Write-Host "🚀 準備推送到 GitHub..." -ForegroundColor Cyan

# 檢查 Git 是否已安裝
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✅ Git 已安裝" -ForegroundColor Green
} else {
    Write-Host "❌ 請先安裝 Git: winget install Git.Git" -ForegroundColor Red
    exit 1
}

# 檢查是否已經是 Git repository
if (-not (Test-Path ".git")) {
    Write-Host "🔧 初始化 Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - 車牌查詢系統完整版本"
} else {
    Write-Host "✅ Git repository 已存在" -ForegroundColor Green
    
    # 檢查是否有未提交的更改
    $status = git status --porcelain
    if ($status) {
        Write-Host "🔧 提交最新更改..." -ForegroundColor Yellow
        git add .
        git commit -m "更新寫入功能 - 修正 Ragic 欄位對應"
    } else {
        Write-Host "✅ 沒有未提交的更改" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📋 下一步操作說明:" -ForegroundColor Cyan
Write-Host "1. 在 GitHub 創建新的 repository" -ForegroundColor White
Write-Host "2. 執行以下命令連接到 GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 在 Vercel Dashboard 中:" -ForegroundColor White
Write-Host "   - 點擊 'New Project'" -ForegroundColor Gray
Write-Host "   - 選擇 'Import Git Repository'" -ForegroundColor Gray
Write-Host "   - 選擇您的 GitHub repository" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 設定環境變數（參考 GITHUB_DEPLOYMENT.md）" -ForegroundColor White

Write-Host ""
Write-Host "✅ 準備完成！請按照上述步驟完成部署。" -ForegroundColor Green
