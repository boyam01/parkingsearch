# 車牌查詢系統 (Parking Search System)

動態車牌查詢系統，使用 Next.js + TypeScript 開發，支援快速車牌搜尋和管理功能。

🚀 **最新更新**: 車牌顯示問題已修復，系統已準備好進行 Demo！

## ✨ 主要功能

- 🚀 **毫秒級查詢**：使用字首樹演算法實現快速車牌搜尋
- 🔍 **模糊搜尋**：支援車牌、申請人姓名、部門等多欄位模糊比對
- 📱 **響應式設計**：完美支援桌面、平板、手機等各種裝置
- 🌐 **動態路由**：透過 `/query/[plate]` 直接查詢特定車牌
- 💾 **智慧快取**：使用 IndexedDB + localStorage 雙層快取策略
- ⚡ **離線支援**：斷網環境下仍可進行本地查詢
- 📊 **統計分析**：提供豐富的車輛統計和分析功能
- 📝 **申請者建檔系統**：多步驟車輛申請表單與審核流程
- ✅ **即時表單驗證**：台灣身分證、手機號碼等格式驗證
- 📧 **自動通知系統**：電子郵件申請確認與審核結果通知
- 👥 **管理員介面**：完整的申請審核與狀態管理功能

## 🛠️ 技術架構

### 前端技術
- **Next.js 14+** - React 全端框架，支援 App Router
- **TypeScript** - 型別安全的 JavaScript
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Lucide React** - 現代化圖示庫

### 搜尋引擎
- **字首樹 (Trie)** - 實現高效能前綴匹配
- **模糊搜尋** - 支援多欄位關鍵字搜尋
- **相關性排序** - 智慧搜尋結果排序

### 快取策略
- **Memory Cache** - 記憶體快取用於即時查詢
- **localStorage** - 瀏覽器本地儲存
- **IndexedDB** - 大容量離線資料儲存

## 🚀 快速開始

### 環境需求
- Node.js 18+ 
- npm 或 yarn

### 本地開發

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數檔案
cp .env.example .env.local

# 3. 編輯 .env.local 設定您的 Ragic API 資訊

# 4. 建置專案 (確保沒有編譯錯誤)
npm run build

# 5. 啟動開發伺服器
npm run dev
```

### Vercel 部署

#### 方法一：自動部署 (推薦)
1. Fork 此專案到您的 GitHub
2. 在 [Vercel](https://vercel.com) 導入專案
3. 環境變數會自動從 Vercel Dashboard 設定

#### 方法二：CLI 部署
```bash
# 1. 安裝 Vercel CLI
npm install -g vercel

# 2. 登入 Vercel
vercel login

# 3. 一鍵設定環境變數並部署
chmod +x vercel-env-setup.sh
./vercel-env-setup.sh

# 或手動部署
vercel --prod
```

#### 環境變數設定
在 Vercel Dashboard > Settings > Environment Variables 中設定：

**必要變數：**
```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_RAGIC_BASE_URL=https://ap7.ragic.com
NEXT_PUBLIC_RAGIC_ACCOUNT=your-account
NEXT_PUBLIC_RAGIC_API_KEY=your-api-key
NEXT_PUBLIC_RAGIC_FORM_ID=31
NEXT_PUBLIC_RAGIC_SUBTABLE_ID=6
NEXT_PUBLIC_RAGIC_ADD_RECORD_ID=-20000
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

**效能調校變數：**
```env
NEXT_PUBLIC_CACHE_TTL=60000
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS=10
NEXT_PUBLIC_REQUEST_TIMEOUT=10000
```
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 即可看到車牌查詢系統。

### 環境變數設定
建立 `.env.local` 檔案：
```env
# API 設定
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Ragic API 設定（推薦用於生產環境）
NEXT_PUBLIC_RAGIC_BASE_URL=https://www.ragic.com.tw/your-account
NEXT_PUBLIC_RAGIC_API_KEY=your-api-key
NEXT_PUBLIC_RAGIC_FORM_ID=your-form-id
```

### 資料儲存選項

#### 開發/測試環境
- **模擬資料**: 8 筆範例車輛記錄
- **適用**: 功能測試、介面展示

#### 生產環境 (推薦 Ragic)
- **Ragic 免費版**: 1,000 筆車輛記錄
- **Ragic 專業版**: 10,000+ 筆車輛記錄
- **完整功能**: 雲端同步、權限管理、報表分析
- **設定指南**: 查看 [Ragic 整合說明](./docs/ragic-setup.md)

## 📖 使用方式

### 基本搜尋
1. 在首頁搜尋框輸入車牌號碼或申請人姓名
2. 系統會即時顯示搜尋結果
3. 點擊任一車輛卡片查看詳細資訊

### 直接查詢
透過動態路由直接查詢特定車牌：
```
http://localhost:3000/query/ABC1234
http://localhost:3000/query/XYZ-5678
http://localhost:3000/query/123ABC
```

### API 使用

#### 車輛查詢 API

```bash
# 取得所有車輛
GET /api/vehicles

# 搜尋車輛
GET /api/vehicles/search?q=ABC&type=轎車&status=審核通過

# 查詢特定車牌
GET /api/vehicles/ABC-1234
```

#### 車輛申請 API

```bash
# 提交新申請
POST /api/applications
Content-Type: application/json

{
  "plate": "ABC-1234",
  "vehicleType": "轎車",
  "applicantName": "王小明",
  "applicantEmail": "user@example.com",
  "contactPhone": "0912345678",
  "identityType": "同仁"
}

# 取得申請列表（管理員）
GET /api/applications

# 審核申請（管理員）
PUT /api/applications/123
Content-Type: application/json

{
  "action": "approve", // 或 "reject"
  "notes": "審核備註"
}
```

## 🔧 開發指令

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產版本
npm start

# 程式碼檢查
npm run lint
```

## 📊 效能指標

- **搜尋響應時間**：< 300ms
- **首次載入時間**：< 2s
- **快取命中率**：> 95%
- **離線可用性**：✅

## 🚀 部署

### 自動部署到 Vercel（推薦）

1. **前往 Vercel 並連接 GitHub**
   - 訪問 [vercel.com/new](https://vercel.com/new)
   - 使用 GitHub 帳號登入
   - 選擇 `boyam01/parkingsearch` 儲存庫
   - 點擊 "Deploy"

2. **Vercel 會自動處理**
   - 自動偵測 Next.js 專案
   - 安裝依賴並建置
   - 部署到全球 CDN

3. **取得部署 URL**
   - 部署完成後會獲得類似 `https://parkingsearch-xxx.vercel.app` 的網址
   - 每次推送程式碼到 `main` 分支都會自動重新部署

### 手動部署（使用 Vercel CLI）

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署
vercel

# 部署到生產環境
vercel --prod
```

### 環境變數設定

在 Vercel Dashboard 中設定以下環境變數：

```env
# API 基礎 URL（生產環境會自動設定）
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api

# 可選：郵件服務配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🤝 貢獻

歡迎提出 Issues 和 Pull Requests 來改善這個專案。

---

**動態車牌查詢系統** - 讓車輛管理更簡單高效 🚗✨
