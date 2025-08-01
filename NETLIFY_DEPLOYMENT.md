# 🚀 Netlify 部署指南

## 快速部署步驟

### 1. **準備 Netlify CLI**
```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login
```

### 2. **初始化專案**
```bash
# 在專案根目錄執行
netlify init

# 選擇：
# ✅ "Create & configure a new site"
# ✅ Team: 選擇您的團隊
# ✅ Site name: parkingsearch (或您偏好的名稱)
```

### 3. **設定環境變數**
```bash
# 執行環境變數設定腳本
./netlify-env-setup.sh
# 或 Windows:
./netlify-env-setup.ps1
```

### 4. **部署**
```bash
# 測試部署
netlify build

# 生產部署
netlify deploy --prod
```

## 🔧 手動設定步驟

### 網頁介面設定

1. **前往 [Netlify Dashboard](https://app.netlify.com/)**
2. **點擊 "Add new site" > "Import an existing project"**
3. **連接 GitHub 倉庫**：
   - 選擇 `boyam01/parkingsearch`
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `.next`

### 環境變數設定

在 Netlify Dashboard > Site settings > Environment variables 中添加：

```env
# 基本設定
NEXT_PUBLIC_API_BASE_URL=/api
NODE_ENV=production

# Ragic API 設定
NEXT_PUBLIC_RAGIC_BASE_URL=https://ap7.ragic.com
NEXT_PUBLIC_RAGIC_ACCOUNT=xinsheng
NEXT_PUBLIC_RAGIC_API_KEY=c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==
NEXT_PUBLIC_RAGIC_FORM_ID=31
NEXT_PUBLIC_RAGIC_SUBTABLE_ID=6
NEXT_PUBLIC_RAGIC_ADD_RECORD_ID=-20000

# 效能設定
NEXT_PUBLIC_CACHE_TTL=60000
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS=10
NEXT_PUBLIC_REQUEST_TIMEOUT=10000

# 認證設定
NEXTAUTH_SECRET=your-secure-production-secret-key
NEXTAUTH_URL=https://your-site-name.netlify.app
```

## 🌍 域名設定

### 使用 Netlify 子域名
- 您的網站將自動獲得：`https://your-site-name.netlify.app`

### 自訂域名（可選）
1. **在 Netlify Dashboard**：Site settings > Domain management
2. **添加自訂域名**
3. **更新 DNS 設定**

## 🔍 故障排除

### 常見問題

1. **Build 失敗**
   ```bash
   # 檢查本地 build
   npm run build
   
   # 檢查 Node.js 版本
   node --version  # 建議 18.x
   ```

2. **API 路由問題**
   - 確保 `netlify.toml` 中的重寫規則正確
   - 檢查環境變數是否正確設定

3. **圖片載入問題**
   - `next.config.ts` 中已設定 `images.unoptimized: true`

### 部署狀態檢查
```bash
# 檢查部署狀態
netlify status

# 查看部署日誌
netlify logs

# 開啟網站
netlify open:site
```

## 📊 優勢比較

| 功能 | Netlify | Vercel |
|------|---------|---------|
| 部署穩定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 免費額度 | 100GB 頻寬 | 100GB 頻寬 |
| Build 時間 | 300 分鐘/月 | 6000 分鐘/月 |
| 環境變數管理 | 簡單直觀 | 複雜 |
| 錯誤處理 | 清晰明確 | 經常模糊 |
| 社群支援 | 優秀 | 良好 |

## 🎯 部署完成檢查清單

- [ ] Netlify CLI 安裝並登入
- [ ] 專案初始化完成
- [ ] 環境變數設定完成
- [ ] 首次部署成功
- [ ] 網站可正常訪問
- [ ] API 功能正常
- [ ] 車輛查詢功能測試通過
- [ ] CRUD 操作測試通過

---

**需要幫助？** 
- 📧 [Netlify 支援](https://www.netlify.com/support/)
- 📖 [Next.js on Netlify 文件](https://docs.netlify.com/frameworks/next-js/)
