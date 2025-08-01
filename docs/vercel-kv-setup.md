# Vercel KV 資料庫整合

## 🗃️ 使用 Vercel KV 作為固定資料庫

Vercel KV 是 Vercel 提供的 Redis 雲端資料庫服務，非常適合需要快速存取和多人同步的應用。

### 📊 Vercel KV 限制

| 方案 | 儲存空間 | 請求次數/月 | 費用 |
|------|----------|------------|------|
| **Hobby** | 256MB | 30,000 | 免費 |
| **Pro** | 1GB | 500,000 | $20/月 |
| **Enterprise** | 自訂 | 自訂 | 客製 |

### 🚀 設定步驟

#### 1. 在 Vercel 啟用 KV

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 點擊 "Storage" 標籤
4. 點擊 "Create Database"
5. 選擇 "KV"
6. 建立資料庫

#### 2. 安裝依賴

```bash
npm install @vercel/kv
```

#### 3. 設定環境變數

Vercel 會自動設定以下環境變數：
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 💾 預計可儲存車輛記錄數量

以每筆車輛記錄約 2KB 計算：

- **Hobby 方案**: 約 128,000 筆車輛記錄
- **Pro 方案**: 約 524,000 筆車輛記錄

### ⚡ 特色

- **極快查詢速度**: < 50ms
- **自動備份**: Vercel 自動處理
- **多人同步**: 即時資料同步
- **無需維護**: 完全託管服務
