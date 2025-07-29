# Copilot 指令 - 動態車牌查詢系統

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 專案概述
這是一個動態車牌查詢系統，使用 Next.js + TypeScript 開發，主要功能包括：
- 快速車牌查詢（毫秒級回應）
- 模糊比對搜尋（使用字首樹結構）
- RWD 響應式設計
- 動態路由 `/query/[plate]` 支援直接查詢

## 技術架構指引
- **前端框架**: Next.js 14+ with App Router
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: React Hooks + Context API
- **本地快取**: IndexedDB + localStorage
- **搜尋演算法**: Trie (字首樹) 結構
- **API 整合**: RESTful API 或 Ragic API

## 資料模型
車牌資料結構應包含：
```typescript
interface VehicleRecord {
  id: string;
  plate: string; // 車牌號碼
  vehicleType: string; // 車型（轎車、機車、貴賓用車）
  applicantName: string; // 申請人姓名
  contactPhone: string; // 聯絡電話
  identityType: string; // 身份類別（同仁／長官／關係企業／一般訪客）
  applicationDate: string; // 申請日期
  visitTime?: string; // 到訪時間
  brand?: string; // 車輛品牌
  color?: string; // 車輛顏色
  department?: string; // 部門或單位
  approvalStatus: string; // 審核狀態
  notes?: string; // 備註
}
```

## 開發指引
1. 所有元件使用 TypeScript 嚴格模式
2. 使用 Tailwind CSS 進行樣式設計
3. 實作 Service Worker 進行資料快取
4. 優化搜尋效能，目標查詢時間 < 300ms
5. 支援離線查詢功能
6. 實作錯誤處理和載入狀態
7. 確保 SEO 友善和無障礙設計

## 程式碼風格
- 使用 ESLint 和 Prettier 進行程式碼格式化
- 元件命名使用 PascalCase
- 檔案命名使用 kebab-case
- 函式使用 camelCase
- 常數使用 UPPER_SNAKE_CASE
