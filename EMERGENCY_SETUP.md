# 🚨 緊急環境變數設定指南

## 立即設定步驟（Demo 前必做）

### 1. 創建 .env.local 檔案
在專案根目錄 `d:\parkingsearch\` 創建 `.env.local` 檔案

### 2. 複製並填入以下內容
```bash
# Ragic API 設定
NEXT_PUBLIC_RAGIC_API_KEY=你的_API_KEY_在這裡
NEXT_PUBLIC_RAGIC_BASE_URL=https://ap7.ragic.com
NEXT_PUBLIC_RAGIC_ACCOUNT=xinsheng
NEXT_PUBLIC_RAGIC_FORM_ID=ragicforms31
NEXT_PUBLIC_RAGIC_SUBTABLE_ID=6
```

### 3. 取得 Ragic API Key
1. 登入 Ragic 系統
2. 前往 設定 > API 設定
3. 複製 API Key 取代上面的 `你的_API_KEY_在這裡`

### 4. 驗證設定
設定完成後：
1. 重新啟動開發伺服器：`npm run dev`
2. 前往 http://localhost:3000/emergency-test 檢查狀態
3. 確認所有環境變數都顯示 ✅

## 🔥 欄位對應確認
目前系統使用的 Ragic 欄位對應：
- **車牌號碼**: 1003984
- **申請人姓名**: 1003985  
- **車輛類型**: 1003986

如果車牌仍然顯示空白，請檢查 Ragic 表單中這些欄位 ID 是否正確。

## ⚡ 快速測試流程
1. 設定環境變數
2. 重啟伺服器
3. 訪問 `/emergency-test` 查看診斷
4. 如果車牌分析顯示空白，檢查欄位對應
5. 訪問主頁 `/` 測試搜尋功能

## 🆘 緊急聯絡
如果環境變數設定後仍有問題：
1. 檢查 Ragic API Key 權限
2. 確認 Ragic 表單 ID 和欄位 ID 正確
3. 查看瀏覽器控制台錯誤訊息
