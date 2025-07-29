# 動態車牌查詢系統

一個高效能的車牌查詢系統，支援毫秒級搜尋、模糊比對與響應式設計。

## ✨ 主要功能

- 🚀 **毫秒級查詢**：使用字首樹演算法實現快速車牌搜尋
- 🔍 **模糊搜尋**：支援車牌、申請人姓名、部門等多欄位模糊比對
- 📱 **響應式設計**：完美支援桌面、平板、手機等各種裝置
- 🌐 **動態路由**：透過 `/query/[plate]` 直接查詢特定車牌
- 💾 **智慧快取**：使用 IndexedDB + localStorage 雙層快取策略
- ⚡ **離線支援**：斷網環境下仍可進行本地查詢
- 📊 **統計分析**：提供豐富的車輛統計和分析功能

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

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000) 即可看到車牌查詢系統。

### 環境變數設定
建立 `.env.local` 檔案：
```env
# API 設定
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Ragic API 設定（可選）
NEXT_PUBLIC_RAGIC_BASE_URL=your_ragic_url
NEXT_PUBLIC_RAGIC_API_KEY=your_api_key
```

## 📖 使用方式

### 基本搜尋
1. 在首頁搜尋框輸入車牌號碼或申請人姓名
2. 系統會即時顯示搜尋結果
3. 點擊任一車輛卡片查看詳細資訊

### 直接查詢
透過動態路由直接查詢特定車牌：
```
http://localhost:3000/query/ABC-1234
```

### API 使用

#### 取得所有車輛
```bash
GET /api/vehicles
```

#### 搜尋車輛
```bash
GET /api/vehicles/search?q=ABC
```

#### 查詢特定車牌
```bash
GET /api/vehicles/ABC-1234
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

最簡單的部署方式是使用 [Vercel Platform](https://vercel.com/new)：

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
vercel
```

## 🤝 貢獻

歡迎提出 Issues 和 Pull Requests 來改善這個專案。

---

**動態車牌查詢系統** - 讓車輛管理更簡單高效 🚗✨
