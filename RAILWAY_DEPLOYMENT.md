# 🚀 Railway 部署指南

Railway 是一個現代化的雲端平台，對 Next.js 支援非常好，比 Netlify 更穩定。

## 快速部署步驟

### 1. **創建 Railway 帳號**
前往 [railway.app](https://railway.app) 並使用 GitHub 帳號登入

### 2. **連接 GitHub Repository**
1. 點擊 "New Project"
2. 選擇 "Deploy from GitHub repo"
3. 選擇 `boyam01/parkingsearch`
4. Railway 會自動檢測到這是 Next.js 專案

### 3. **環境變數設定**
在 Railway dashboard 中設定以下變數：

```env
# 基本設定
NEXT_PUBLIC_API_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}/api
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
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### 4. **自動部署**
- Railway 會自動從 GitHub main 分支部署
- 每次 push 都會觸發新的部署
- 支援預覽部署（Preview deployments）

## 🎯 Railway 優勢

| 功能 | Railway | Netlify | Vercel |
|------|---------|---------|---------|
| Next.js 支援 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 部署穩定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 錯誤處理 | 清晰明確 | 普通 | 模糊 |
| 免費額度 | $5/月 額度 | 100GB | 100GB |
| 資料庫整合 | 內建支援 | 需外部 | 需外部 |
| 監控工具 | 完整 | 基本 | 基本 |

## 🔧 Railway 特色功能

1. **即時日誌**: 完整的部署和運行日誌
2. **資料庫支援**: 內建 PostgreSQL, MySQL, Redis
3. **自動 HTTPS**: 免費 SSL 憑證
4. **分支部署**: 支援 feature branch 預覽
5. **監控儀表板**: CPU, 記憶體, 網路監控

## 📝 部署檢查清單

- [ ] Railway 帳號創建完成
- [ ] GitHub repository 連接
- [ ] 環境變數設定完成
- [ ] 首次部署成功
- [ ] 自訂域名設定（可選）
- [ ] 監控和警報設定

## 🚨 注意事項

1. **免費額度**: Railway 提供 $5/月 的免費額度
2. **休眠機制**: 閒置時不會自動休眠（比 Heroku 好）
3. **地區選擇**: 支援多個地區部署
4. **擴展性**: 可輕鬆擴展到多個實例

---

**推薦指數**: ⭐⭐⭐⭐⭐ (5/5)

Railway 是目前對 Next.js 支援最好的平台之一，部署簡單、穩定可靠！
