# 環境變數遷移指南

## 目標
將前端可見的環境變數遷移到後端專用，提升安全性。

## 需要修改的環境變數

### 1. Vercel 環境變數
在 Vercel Dashboard 中修改以下環境變數：

**舊的環境變數（需要刪除）：**
- `NEXT_PUBLIC_RAGIC_API_KEY`
- `NEXT_PUBLIC_RAGIC_BASE_URL`
- `NEXT_PUBLIC_RAGIC_ACCOUNT`
- `NEXT_PUBLIC_RAGIC_FORM_ID`
- `NEXT_PUBLIC_RAGIC_SUBTABLE_ID`
- `NEXT_PUBLIC_RAGIC_WRITE_FORM_ID`
- `NEXT_PUBLIC_RAGIC_WRITE_SUBTABLE_ID`

**新的環境變數（僅後端使用）：**
- `RAGIC_API_KEY` = 你的 Ragic API 金鑰
- `RAGIC_BASE_URL` = https://ap7.ragic.com
- `RAGIC_ACCOUNT` = xinsheng
- `RAGIC_FORM_ID` = 31
- `RAGIC_SUBTABLE_ID` = 6
- `RAGIC_WRITE_FORM_ID` = 31
- `RAGIC_WRITE_SUBTABLE_ID` = 6

### 2. 本地開發環境

**修改 `.env.local` 檔案：**
```bash
# 移除 NEXT_PUBLIC_ 前綴
RAGIC_API_KEY=你的API金鑰
RAGIC_BASE_URL=https://ap7.ragic.com
RAGIC_ACCOUNT=xinsheng
RAGIC_FORM_ID=31
RAGIC_SUBTABLE_ID=6
RAGIC_WRITE_FORM_ID=31
RAGIC_WRITE_SUBTABLE_ID=6
```

### 3. Railway 環境變數（如果使用）
同樣移除 `NEXT_PUBLIC_` 前綴，改為後端專用環境變數。

## 遷移後的架構優勢

1. **安全性提升**：API 金鑰不再暴露在客戶端
2. **統一路由**：所有 Ragic API 請求都通過 `/api/vehicles` 路由
3. **錯誤處理**：集中化的錯誤處理和重試機制
4. **環境隔離**：開發、測試、生產環境完全隔離

## 測試清單

遷移後請測試以下功能：

- [ ] 車輛資料讀取
- [ ] 車輛資料新增
- [ ] 搜尋功能
- [ ] 除錯頁面功能
- [ ] 部署環境功能

## 部署步驟

1. 更新 Vercel 環境變數
2. 推送程式碼到 repository
3. 等待 Vercel 自動部署
4. 測試所有功能
5. 刪除舊的 `NEXT_PUBLIC_` 環境變數

## 常見問題

**Q: 前端如何知道 API 是否正常運作？**
A: 透過 `/api/vehicles` 路由的回應狀態碼和錯誤訊息。

**Q: 如何除錯 Ragic 連線問題？**
A: 使用 `/debug-ragic` 頁面進行詳細的連線測試。

**Q: 環境變數更新後需要重新部署嗎？**
A: 是的，環境變數更新後需要重新部署才會生效。
