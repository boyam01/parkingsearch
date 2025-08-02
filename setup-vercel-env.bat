@echo off
chcp 65001 > nul
title Vercel 環境變數快速設定工具

echo 🚀 Vercel 環境變數快速設定工具
echo =================================

REM 檢查 Vercel CLI
vercel --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 請先安裝 Vercel CLI: npm i -g vercel
    pause
    exit /b 1
)

echo ✅ Vercel CLI 已安裝

echo.
echo 📝 開始設定環境變數...

REM 基礎環境變數設定
call :set_env "NEXT_PUBLIC_RAGIC_ACCOUNT" "xinsheng"
call :set_env "RAGIC_ACCOUNT" "xinsheng"
call :set_env "NEXTAUTH_URL" "https://parkingsearch.vercel.app"
call :set_env "NEXT_PUBLIC_API_BASE_URL" "https://parkingsearch.vercel.app"
call :set_env "NEXTAUTH_SECRET" "parkingsearch-secure-secret-key-change-this-in-production"
call :set_env "NEXT_PUBLIC_CACHE_TTL" "60000"
call :set_env "NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS" "10"
call :set_env "NEXT_PUBLIC_REQUEST_TIMEOUT" "10000"
call :set_env "NEXT_PUBLIC_RAGIC_BASE_URL" "https://ap7.ragic.com"
call :set_env "NEXT_PUBLIC_RAGIC_FORM_ID" "31"
call :set_env "NEXT_PUBLIC_RAGIC_SUBTABLE_ID" "6"
call :set_env "NEXT_PUBLIC_RAGIC_ADD_RECORD_ID" "-20000"

echo.
echo 📝 設定生產環境專用變數...

REM 生產環境專用變數
call :set_prod_env "NEXT_PUBLIC_API_BASE_URL_PROD" "https://parkingsearch.vercel.app/api"
call :set_prod_env "ADMIN_EMAIL" "admin@yourcompany.com"
call :set_prod_env "NOTIFICATION_FROM_EMAIL" "your-email@gmail.com"
call :set_prod_env "SMTP_USER" "your-email@gmail.com"
call :set_prod_env "SMTP_PASS" "your-app-password"
call :set_prod_env "SMTP_HOST" "smtp.gmail.com"
call :set_prod_env "SMTP_PORT" "587"

echo.
echo ⚠️  重要提醒:
echo 1. 請手動設定 NEXT_PUBLIC_RAGIC_API_KEY (敏感資訊)
echo 2. 請更新 SMTP 相關設定為您的實際信箱配置
echo 3. 請更新 NEXTAUTH_SECRET 為安全的隨機字串

echo.
echo 🔍 手動設定指令:
echo vercel env add NEXT_PUBLIC_RAGIC_API_KEY

echo.
echo ✅ 環境變數設定完成！
echo 📋 請查看 VERCEL_ENV_CONFIG.md 了解詳細說明

pause
exit /b 0

:set_env
echo 設定 %~1...
vercel env add %~1 development %~2 --force > nul 2>&1
vercel env add %~1 preview %~2 --force > nul 2>&1
vercel env add %~1 production %~2 --force > nul 2>&1
if errorlevel 1 (
    echo ❌ %~1 設定失敗
) else (
    echo ✅ %~1
)
goto :eof

:set_prod_env
echo 設定 %~1 (僅生產環境)...
vercel env add %~1 production %~2 --force > nul 2>&1
if errorlevel 1 (
    echo ❌ %~1 設定失敗
) else (
    echo ✅ %~1
)
goto :eof
