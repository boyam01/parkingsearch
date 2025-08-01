@echo off
echo 🚨 緊急系統檢查腳本
echo.

echo 📋 檢查 .env.local 檔案...
if exist .env.local (
    echo ✅ .env.local 檔案存在
    echo.
    echo 檔案內容預覽:
    type .env.local | findstr /R "^[^#]"
) else (
    echo ❌ .env.local 檔案不存在！
    echo.
    echo 🔧 請立即創建 .env.local 檔案，內容參考：
    echo NEXT_PUBLIC_RAGIC_API_KEY=你的_API_KEY
    echo NEXT_PUBLIC_RAGIC_BASE_URL=https://ap7.ragic.com
    echo NEXT_PUBLIC_RAGIC_ACCOUNT=xinsheng
    echo NEXT_PUBLIC_RAGIC_FORM_ID=ragicforms31
    echo NEXT_PUBLIC_RAGIC_SUBTABLE_ID=6
)

echo.
echo 🔍 檢查 Node.js 進程...
tasklist /FI "IMAGENAME eq node.exe" | findstr node.exe >nul
if %errorlevel%==0 (
    echo ✅ Node.js 進程運行中
) else (
    echo ❌ Node.js 進程未運行
    echo 💡 請執行: npm run dev
)

echo.
echo 🌐 檢查端口 3000...
netstat -an | findstr :3000 >nul
if %errorlevel%==0 (
    echo ✅ 端口 3000 已開啟
    echo 🔗 測試連結: http://localhost:3000/emergency-test
) else (
    echo ❌ 端口 3000 未開啟
    echo 💡 請執行: npm run dev
)

echo.
echo 📁 檢查關鍵檔案...
if exist "src\lib\api.ts" (
    echo ✅ API 檔案存在
) else (
    echo ❌ API 檔案缺失
)

if exist "src\app\emergency-test\page.tsx" (
    echo ✅ 緊急測試頁面存在
) else (
    echo ❌ 緊急測試頁面缺失
)

echo.
echo 🚀 建議操作順序:
echo 1. 確保 .env.local 檔案正確設定
echo 2. 執行: npm run dev
echo 3. 開啟: http://localhost:3000/emergency-test
echo 4. 檢查車牌欄位分析結果
echo.
pause
