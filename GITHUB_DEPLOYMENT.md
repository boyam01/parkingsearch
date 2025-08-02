# GitHub 部署說明

## 推送到 GitHub 並自動部署到 Vercel

### 步驟 1: 初始化 Git（如果尚未初始化）
```bash
git init
git add .
git commit -m "Initial commit - 車牌查詢系統完整版本"
```

### 步驟 2: 創建 GitHub Repository
1. 前往 [GitHub](https://github.com)
2. 點擊 "New repository"
3. 命名為 `parkingsearch` 或其他您喜歡的名稱
4. 不要初始化 README、.gitignore 或 license（因為我們已經有了）
5. 創建 repository

### 步驟 3: 連接到 GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 步驟 4: 在 Vercel 設定自動部署
1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "New Project"
3. 選擇 "Import Git Repository"
4. 選擇您剛創建的 GitHub repository
5. 點擊 "Import"

### 步驟 5: 設定環境變數
在 Vercel 項目設定中添加以下環境變數：

#### 必要的環境變數：
- `NEXT_PUBLIC_RAGIC_BASE_URL` = `https://ap7.ragic.com`  
- `NEXT_PUBLIC_RAGIC_ACCOUNT` = `xinsheng`
- `NEXT_PUBLIC_RAGIC_FORM_ID` = `31`
- `NEXT_PUBLIC_RAGIC_SUBTABLE_ID` = `6`
- `NEXT_PUBLIC_RAGIC_ADD_RECORD_ID` = `-20000`
- `NEXT_PUBLIC_RAGIC_API_KEY` = `c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdLQUZlVDJQV2M1ZzB5dEYxaUNVWENSS29wekxQL0R6bzBkR1NUaFpVYlJBPQ==`

### 步驟 6: 部署
Vercel 會自動檢測到您的 Next.js 項目並開始部署。

### 自動化腳本
如果您已經安裝了 Git，可以執行 `.\github-setup.ps1` 來自動化部分步驟。

## 功能特點
- ✅ 車牌查詢功能
- ✅ 寫入功能（已修正欄位對應）
- ✅ Ragic API 整合
- ✅ 響應式設計
- ✅ 錯誤處理和重試機制
- ✅ 環境變數配置

## 技術架構
- **前端**: Next.js 15.4.4 + TypeScript
- **樣式**: Tailwind CSS
- **後端**: Ragic API 整合
- **部署**: Vercel
- **版本控制**: Git + GitHub
