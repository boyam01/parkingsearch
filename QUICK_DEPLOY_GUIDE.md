# 簡化 GitHub + Vercel 部署步驟

## 🎯 最快速部署方式

您目前的寫入功能已經完成並測試成功！現在只需要 3 個步驟即可部署：

### 方法 1: 使用 GitHub Desktop (推薦，最簡單)

1. **下載 GitHub Desktop**: https://desktop.github.com/
2. **登入後創建新倉庫**:
   - Repository name: `parking-search-system`
   - Local path: `d:\parkingsearch`
   - 設為 **Public**
3. **發布倉庫到 GitHub**

### 方法 2: 手動上傳到 GitHub 網站

1. 前往 https://github.com/new
2. Repository name: `parking-search-system`
3. 設為 **Public**
4. 創建後，將 `d:\parkingsearch` 資料夾內所有檔案拖曳上傳

## 🚀 連接 Vercel

1. 前往 https://vercel.com/dashboard
2. 點擊 "New Project"
3. 選擇您剛創建的 `parking-search-system` 倉庫
4. 在 "Environment Variables" 設定這些變數：

```
RAGIC_API_KEY=c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdLQUZlVDJQV2M1ZzB5dEYxaUNVWENSS2dzUjFNMEtGdz09
RAGIC_ACCOUNT=xinsheng
RAGIC_FORM_ID=31
RAGIC_PASSWORD=z00000
RAGIC_BASE_URL=https://ap7.ragic.com
NEXT_PUBLIC_APP_NAME=車牌查詢系統
NEXT_PUBLIC_COMPANY_NAME=您的公司名稱
```

5. 點擊 "Deploy"

## ✅ 完成！

部署完成後您就有一個完全可用的車牌查詢系統，包含：
- 快速查詢功能
- 寫入新車輛功能 (已修正並測試)
- 管理界面
- 自動同步更新

每次您修改程式碼並推送到 GitHub，Vercel 會自動重新部署。
