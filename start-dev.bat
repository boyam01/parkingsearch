@echo off
echo 檢查並清理 PORT 3000...

REM 檢查 PORT 3000 是否被佔用
netstat -ano | findstr :3000 > nul
if %errorlevel% == 0 (
    echo PORT 3000 被佔用，正在清理...
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
        echo 終止進程 ID: %%a
        taskkill /f /pid %%a 2>nul
    )
    timeout /t 2 /nobreak > nul
)

echo 啟動開發伺服器...
npm run dev
