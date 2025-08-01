@echo off
echo 正在停止佔用 PORT 3000 的進程...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo 發現進程 ID: %%a
    taskkill /f /pid %%a
)
echo PORT 3000 已清空，可以重新啟動開發伺服器
pause
