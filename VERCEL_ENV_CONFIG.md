# 🚀 Vercel 環境變數配置文件
# 用於車牌查詢系統的完整環境變數設定參考

> **📅 最後更新**: 2025年8月2日  
> **🏗️ 部署平台**: Vercel  
> **📋 專案**: parkingsearch  

---

## 📊 環境變數總覽表

### 🔗 Ragic 連線設定

| 變數名稱 | 環境範圍 | 值 | 說明 |
|---------|---------|-----|------|
| `NEXT_PUBLIC_RAGIC_API_KEY` | All Environments | `(隱藏)` | Ragic API 金鑰 |
| `NEXT_PUBLIC_RAGIC_ACCOUNT` | All Environments | `xinsheng` | Ragic 帳號名稱 |
| `RAGIC_ACCOUNT` | All Environments | `xinsheng` | 後備 Ragic 帳號 |

### 🌐 API 路徑與認證

| 變數名稱 | 環境範圍 | 值 | 說明 |
|---------|---------|-----|------|
| `NEXTAUTH_URL` | All Environments | `https://parkingsearch.vercel.app` | NextAuth 基礎 URL |
| `NEXT_PUBLIC_API_BASE_URL` | All Environments | `https://parkingsearch.vercel.app` | API 基礎路徑 |
| `NEXT_PUBLIC_API_BASE_URL_PROD` | Production | `https://parkingsearch.vercel.app/api` | 生產環境 API 路徑 |
| `NEXTAUTH_SECRET` | All Environments | `parkingsearch-secure-secret-key-…` | NextAuth 加密金鑰 |

### 📧 郵件服務設定 (Production)

| 變數名稱 | 環境範圍 | 值 | 說明 |
|---------|---------|-----|------|
| `ADMIN_EMAIL` | Production | `admin@yourcompany.com` | 管理員信箱 |
| `NOTIFICATION_FROM_EMAIL` | Production | `your-email@gmail.com` | 通知寄件者 |
| `SMTP_USER` | Production | `your-email@gmail.com` | SMTP 使用者 |
| `SMTP_PASS` | Production | `your-app-password` | SMTP 密碼 |
| `SMTP_HOST` | Production | `smtp.gmail.com` | SMTP 伺服器 |
| `SMTP_PORT` | Production | `587` | SMTP 端口 |

### ⚡ 性能調校設定

| 變數名稱 | 環境範圍 | 值 | 說明 |
|---------|---------|-----|------|
| `NEXT_PUBLIC_CACHE_TTL` | All Environments | `60000` | 快取存活時間 (毫秒) |
| `NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS` | All Environments | `10` | 最大並發請求數 |
| `NEXT_PUBLIC_REQUEST_TIMEOUT` | All Environments | `10000` | 請求逾時時間 (毫秒) |

### 🗃️ Ragic 表單操作參數

| 變數名稱 | 環境範圍 | 值 | 說明 |
|---------|---------|-----|------|
| `NEXT_PUBLIC_RAGIC_BASE_URL` | All Environments | `https://ap7.ragic.com` | Ragic 基礎 URL |
| `NEXT_PUBLIC_RAGIC_FORM_ID` | All Environments | `31` | 主表單 ID |
| `NEXT_PUBLIC_RAGIC_SUBTABLE_ID` | All Environments | `6` | 子表 ID |
| `NEXT_PUBLIC_RAGIC_ADD_RECORD_ID` | All Environments | `-20000` | 新增記錄 ID |

---

## 🔍 環境變數檢查清單

### ✅ 必要變數 (系統無法運行)
- [ ] `NEXT_PUBLIC_RAGIC_API_KEY`
- [ ] `NEXT_PUBLIC_RAGIC_ACCOUNT` 
- [ ] `NEXT_PUBLIC_RAGIC_BASE_URL`
- [ ] `NEXT_PUBLIC_RAGIC_FORM_ID`
- [ ] `NEXT_PUBLIC_RAGIC_SUBTABLE_ID`

### ⚠️ 重要變數 (功能受限)
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXT_PUBLIC_API_BASE_URL`
- [ ] `NEXT_PUBLIC_CACHE_TTL`

### 🔧 可選變數 (增強功能)
- [ ] `NEXT_PUBLIC_RAGIC_ADD_RECORD_ID`
- [ ] `SMTP_*` (郵件功能)
- [ ] `ADMIN_EMAIL`

---

## 🛠️ 設定步驟

### 在 Vercel 後台設定:

1. 進入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇 `parkingsearch` 專案
3. 點選 **Settings** → **Environment Variables**
4. 按照上表逐一新增環境變數

### 環境範圍說明:
- **All Environments**: 開發、預覽、生產環境都使用
- **Production**: 僅生產環境使用
- **Development**: 僅開發環境使用
- **Preview**: 僅預覽環境使用

---

## 🚨 除錯常見問題

### 1. `缺少必要環境變數` 錯誤
**解決方案**: 檢查必要變數清單，確保都已設定

### 2. Ragic API 連線失敗
**檢查項目**:
- `NEXT_PUBLIC_RAGIC_API_KEY` 是否正確
- `NEXT_PUBLIC_RAGIC_BASE_URL` 是否為 `https://ap7.ragic.com`
- `NEXT_PUBLIC_RAGIC_ACCOUNT` 是否為 `xinsheng`

### 3. 部署後功能異常
**檢查項目**:
- 是否所有 `NEXT_PUBLIC_*` 變數都已設定
- 生產環境是否有設定 Production 專用變數

---

## 📝 維護紀錄

| 日期 | 變更內容 | 變更者 |
|------|---------|--------|
| 2025-08-02 | 建立初始配置文件 | 系統管理員 |
| 2025-08-02 | 修正環境變數命名不一致問題 | 系統管理員 |

---

## 🔗 相關文件

- [Vercel 環境變數文件](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 環境變數指南](https://nextjs.org/docs/basic-features/environment-variables)
- [Ragic API 文件](https://www.ragic.com/intl/zh-TW/doc-api)

---

**⚠️ 安全提醒**: 
- 請勿在公開場所分享包含敏感資訊的環境變數
- 定期更新 API 金鑰和密碼
- 使用強密碼作為 `NEXTAUTH_SECRET`
