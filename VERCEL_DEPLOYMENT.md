# Vercel 部署指南

## 快速部署步驟

### 1. 訪問 Vercel 並導入專案
1. 前往 [vercel.com](https://vercel.com)
2. 使用 GitHub 帳號登入
3. 點擊 "New Project"
4. 選擇您的 GitHub 倉庫 `boyam01/parkingsearch`
5. 點擊 "Import"

### 2. 設定環境變數
在 Vercel 專案設定中，前往 **Settings** > **Environment Variables**，添加以下變數：

#### 必需的環境變數：
```
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_RAGIC_BASE_URL=https://ap7.ragic.com
NEXT_PUBLIC_RAGIC_ACCOUNT=xinsheng
NEXT_PUBLIC_RAGIC_API_KEY=c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==
NEXT_PUBLIC_RAGIC_FORM_ID=31
NEXT_PUBLIC_RAGIC_SUBTABLE_ID=6
NEXT_PUBLIC_RAGIC_ADD_RECORD_ID=-20000
NEXT_PUBLIC_CACHE_TTL=60000
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS=10
NEXT_PUBLIC_REQUEST_TIMEOUT=10000
NEXTAUTH_SECRET=your-secure-production-secret-key
```

#### NEXTAUTH_URL 設定：
部署完成後，將 `NEXTAUTH_URL` 設定為您的 Vercel 域名：
```
NEXTAUTH_URL=https://your-project-name.vercel.app
```

### 3. 可選的環境變數（郵件功能）：
如果需要郵件服務，添加：
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_FROM_EMAIL=your-email@gmail.com
ADMIN_EMAIL=admin@yourcompany.com
```

### 4. 部署設定
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (自動偵測)
- **Output Directory**: `.next` (自動偵測)
- **Install Command**: `npm install` (自動偵測)

### 5. 域名設定
部署完成後，您可以：
- 使用免費的 `.vercel.app` 域名
- 或設定自定義域名（在 Settings > Domains）

## 部署後檢查清單

### 功能測試：
1. ✅ 車牌搜尋功能
2. ✅ 子序列模糊搜尋 (BC → ABC-4567)
3. ✅ 管理介面 (CRUD 操作)
4. ✅ 會員模組
5. ✅ 配額管理
6. ✅ Ragic API 連線

### 效能監控：
- 檢查 Vercel Dashboard 中的功能分析
- 監控 API 回應時間
- 確認快取策略有效運作

## 故障排除

### 常見問題：
1. **環境變數未載入**: 確認所有 `NEXT_PUBLIC_` 前綴正確
2. **API 連線失敗**: 檢查 Ragic API 金鑰和帳號設定
3. **建置失敗**: 查看 Vercel 建置日誌，通常是型別錯誤

### 除錯工具：
- 使用內建的測試頁面：`/test-ragic`, `/search-test`
- 檢查瀏覽器開發者工具的網路請求
- 查看 Vercel 函數日誌

## 聯絡資訊
如有部署問題，請查看 Vercel 文件或聯絡技術支援。
