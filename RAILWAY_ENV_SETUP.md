# Railway 環境變數設定指南

## 🔧 環境變數清單

在 Railway Dashboard > Variables 中設定以下變數：

### 基本設定
```
NODE_ENV=production
PORT=3000
```

### API 設定
```
NEXT_PUBLIC_API_BASE_URL=https://your-app-name.up.railway.app/api
```

### Ragic API 設定
```
NEXT_PUBLIC_RAGIC_BASE_URL=https://ap7.ragic.com
NEXT_PUBLIC_RAGIC_ACCOUNT=xinsheng
NEXT_PUBLIC_RAGIC_API_KEY=c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==
NEXT_PUBLIC_RAGIC_FORM_ID=31
NEXT_PUBLIC_RAGIC_SUBTABLE_ID=6
NEXT_PUBLIC_RAGIC_ADD_RECORD_ID=-20000
```

### 效能優化設定
```
NEXT_PUBLIC_CACHE_TTL=60000
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS=10
NEXT_PUBLIC_REQUEST_TIMEOUT=10000
```

### NextAuth 設定
```
NEXTAUTH_SECRET=your-secure-production-secret-key-change-this
NEXTAUTH_URL=https://your-app-name.up.railway.app
```

## 📝 設定步驟

1. 在 Railway Dashboard 中，點擊您的專案
2. 前往 "Variables" 分頁
3. 逐一添加上述環境變數
4. 部署會自動重新啟動

## 🎯 重要提醒

- 記得將 `your-app-name` 替換為您實際的 Railway 應用程式名稱
- `NEXTAUTH_SECRET` 請使用強密碼
- 所有以 `NEXT_PUBLIC_` 開頭的變數會暴露給前端
