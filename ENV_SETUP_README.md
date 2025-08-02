# 🚀 Vercel 環境變數設定工具

此專案提供快速設定 Vercel 環境變數的自動化腳本，基於 `VERCEL_ENV_CONFIG.md` 的完整配置。

## 📋 可用工具

### 1. PowerShell 腳本 (推薦)
```powershell
.\setup-vercel-env.ps1
```
- **適用平台**: Windows PowerShell 5.1+
- **功能**: 完整環境變數設定，包含錯誤處理和彩色輸出
- **特色**: 中文支援，詳細狀態回饋

### 2. Bash 腳本
```bash
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```
- **適用平台**: Linux, macOS, WSL
- **功能**: 完整環境變數設定
- **特色**: 跨平台相容性

### 3. 批次檔 (簡化版)
```cmd
setup-vercel-env.bat
```
- **適用平台**: Windows CMD
- **功能**: 基礎環境變數設定
- **特色**: 無需額外權限，簡單易用

## 🔧 使用前準備

1. **安裝 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登入 Vercel 帳號**
   ```bash
   vercel login
   ```

3. **連結到您的專案**
   ```bash
   vercel link
   ```

## 📝 設定步驟

### 自動設定 (推薦)

1. 執行對應的設定腳本：
   ```powershell
   # Windows PowerShell (推薦)
   .\setup-vercel-env.ps1
   
   # Linux/macOS
   ./setup-vercel-env.sh
   
   # Windows CMD
   setup-vercel-env.bat
   ```

2. 手動設定敏感變數：
   ```bash
   vercel env add NEXT_PUBLIC_RAGIC_API_KEY
   ```

### 手動設定

如果自動設定失敗，請參考 `VERCEL_ENV_CONFIG.md` 進行手動設定。

## ✅ 設定完成後驗證

1. **檢查環境變數**
   ```bash
   vercel env ls
   ```

2. **執行驗證腳本**
   ```bash
   node check-env.js
   ```

3. **重新部署**
   ```bash
   vercel --prod
   ```

## 🔍 故障排除

### 常見問題

1. **Vercel CLI 未安裝**
   ```bash
   npm install -g vercel@latest
   ```

2. **權限不足 (Linux/macOS)**
   ```bash
   chmod +x setup-vercel-env.sh
   ```

3. **PowerShell 執行策略限制**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### 環境變數設定失敗

1. 檢查 Vercel 登入狀態：
   ```bash
   vercel whoami
   ```

2. 檢查專案連結：
   ```bash
   vercel projects ls
   ```

3. 手動設定失敗的變數：
   ```bash
   vercel env add [變數名稱]
   ```

## 📊 設定內容概覽

### 基礎環境變數 (所有環境)
- Ragic 連線設定
- API 基礎配置
- 快取與性能參數
- 認證設定

### 生產環境專用變數
- SMTP 郵件設定
- 管理員配置
- 生產 API 端點

## 📚 相關文件

- [VERCEL_ENV_CONFIG.md](./VERCEL_ENV_CONFIG.md) - 完整環境變數說明
- [check-env.js](./check-env.js) - 環境變數驗證工具
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - 部署說明

## 🆘 需要幫助？

1. 查看 `VERCEL_ENV_CONFIG.md` 詳細說明
2. 執行 `node check-env.js` 檢查設定
3. 查看 Vercel 專案設定頁面
4. 聯繫開發團隊

---

💡 **提示**: 建議先在測試環境驗證設定後，再應用到生產環境。
