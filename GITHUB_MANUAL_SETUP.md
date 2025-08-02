# 手動 GitHub 部署指南

## 🚀 快速部署到 GitHub + Vercel

### 步驟 1: 安裝 Git（如果尚未安裝）
```powershell
winget install Git.Git
```
安裝完成後重新開啟 PowerShell

### 步驟 2: 使用 GitHub Desktop（推薦）

1. **下載並安裝 GitHub Desktop**
   - 前往: https://desktop.github.com/
   - 下載並安裝

2. **登入 GitHub 帳號**
   - 開啟 GitHub Desktop
   - 登入您的 GitHub 帳號

3. **創建新倉庫**
   - 點擊 "File" → "New repository"
   - Repository name: `parking-search-system`
   - Local path: `d:\parkingsearch`
   - ✅ 勾選 "Initialize this repository with a README"
   - ✅ 勾選 "Public" (讓 Vercel 可以存取)
   - 點擊 "Create repository"

4. **發布到 GitHub**
   - 點擊 "Publish repository"
   - 確保 "Keep this code private" **未勾選**
   - 點擊 "Publish repository"

### 步驟 3: 連接 Vercel

1. **前往 Vercel Dashboard**
   - 網址: https://vercel.com/dashboard
   - 登入您的帳號 (boyam01)

2. **新增專案**
   - 點擊 "New Project"
   - 點擊 "Import Git Repository"
   - 選擇 `parking-search-system` 倉庫
   - 點擊 "Import"

3. **配置專案設定**
   - Framework Preset: Next.js (應該自動偵測)
   - Root Directory: `./` (預設)
   - Build Command: `npm run build` (預設)
   - Output Directory: `.next` (預設)
   - Install Command: `npm install` (預設)

4. **設定環境變數**
   點擊 "Environment Variables" 並新增以下變數：
   
   ```
   RAGIC_API_KEY=your_actual_api_key_here
   RAGIC_ACCOUNT=your_actual_account_here
   RAGIC_FORM_ID=your_actual_form_id_here
   RAGIC_PASSWORD=your_actual_password_here
   RAGIC_BASE_URL=https://api.ragic.com
   NEXT_PUBLIC_APP_NAME=車牌查詢系統
   NEXT_PUBLIC_COMPANY_NAME=您的公司名稱
   ```

5. **部署**
   - 點擊 "Deploy"
   - 等待部署完成 (約 2-3 分鐘)

### 步驟 4: 測試部署

部署完成後，您會獲得一個網址 (例如: `https://parking-search-system-xxx.vercel.app`)

測試功能：
- 車牌查詢功能
- 新增車輛功能
- 管理界面

### 後續更新

之後每次您修改程式碼：
1. 在 GitHub Desktop 中查看變更
2. 填寫 commit 訊息
3. 點擊 "Commit to main"
4. 點擊 "Push origin"
5. Vercel 會自動重新部署

## 🔧 或使用命令列方式

如果您偏好使用命令列：

```powershell
# 初始化 Git 倉庫
git init

# 添加所有檔案
git add .

# 提交
git commit -m "Initial commit - 車牌查詢系統"

# 在 GitHub 網站創建倉庫後，連接遠端倉庫
git remote add origin https://github.com/YOUR_USERNAME/parking-search-system.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 💡 小提示

- 確保倉庫是 **公開的**，這樣 Vercel 免費方案才能存取
- 環境變數中的敏感資訊不會被推送到 GitHub (它們只存在於 Vercel)
- 每次推送到 main 分支都會觸發自動部署

## 🆘 如果遇到問題

1. **GitHub Desktop 無法推送**
   - 檢查網路連線
   - 確認 GitHub 帳號已登入

2. **Vercel 部署失敗**
   - 檢查環境變數是否正確設定
   - 查看 Vercel 部署日誌

3. **API 無法連接**
   - 確認 RAGIC_API_KEY 等環境變數正確
   - 檢查 Ragic 帳號權限
