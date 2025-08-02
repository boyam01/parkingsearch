# 📋 Ragic 欄位對應表

此檔案記錄了車輛管理系統中本地欄位與 Ragic 表單欄位的對應關係。

## 🚗 車輛表單欄位對應

### 主要資料欄位

| 本地欄位名稱 | 中文名稱 | Ragic 欄位編號 | 資料類型 | 必填 | 備註 |
|------------|---------|---------------|----------|------|------|
| `plate` | 車牌號碼 | `1003984` | String | ✅ | 車輛主要識別碼 |
| `vehicleType` | 車輛類型 | `1003988` | String | ✅ | 轎車/機車/貨車等 |
| `applicantName` | 申請人姓名 | `1003990` | String | ✅ | 車輛申請人 |
| `contactPhone` | 聯絡電話 | `1003992` | String | ✅ | 聯絡方式 |
| `applicationDate` | 申請日期 | `1003994` | Date | ✅ | yyyy/MM/dd 格式 |
| `visitTime` | 到訪時間 | `1003986` | String | ❌ | HH:mm 格式 |
| `identityType` | 身份類別 | `1003989` | String | ✅ | 同仁/長官/訪客等 |
| `brand` | 車輛品牌 | `1003991` | String | ❌ | Toyota/Honda等 |
| `department` | 部門 | `1003995` | String | ❌ | 申請人所屬部門 |

## 🔧 技術規格

### Ragic API 設定
- **Base URL**: `https://ap7.ragic.com`
- **Account**: `xinsheng`
- **Form ID**: `31`
- **Subtable ID**: `6`

### 資料格式要求
- **日期格式**: `yyyy/MM/dd` (例: 2025/08/02)
- **時間格式**: `HH:mm` (例: 14:30)
- **電話格式**: 建議 `09xx-xxx-xxx`

### 車輛類型選項
- 轎車
- 機車
- 貨車
- 巴士
- 貴賓用車
- 其他

### 身份類別選項
- 同仁
- 長官
- 關係企業
- 一般訪客
- 承包商

## 📝 使用說明

### 新增記錄時的必填欄位
1. **車牌號碼** (`plate`) - 必須唯一
2. **車輛類型** (`vehicleType`) - 從選項中選擇
3. **申請人姓名** (`applicantName`) - 完整姓名
4. **聯絡電話** (`contactPhone`) - 有效電話號碼
5. **申請日期** (`applicationDate`) - 當前或未來日期
6. **身份類別** (`identityType`) - 從選項中選擇

### 程式碼範例

```typescript
// 新增車輛記錄
const vehicleData = {
  plate: 'ABC-1234',
  vehicleType: '轎車',
  applicantName: '王小明',
  contactPhone: '0912-345-678',
  applicationDate: '2025/08/02',
  visitTime: '14:30',
  identityType: '訪客',
  brand: 'Toyota',
  department: '資訊部'
};

// 使用 RagicDataTransformer 轉換格式
const ragicFormat = RagicDataTransformer.toRagicFormat('vehicles', vehicleData);
```

## 🔄 更新記錄

此欄位對應表最後更新時間: **2025年8月2日**

如有異動請同步更新以下檔案:
- `src/config/ragicConfig.ts`
- `src/types/vehicle.ts`
- 相關 API 路由

---

**注意**: 修改欄位對應時，請確保同時更新所有相關的配置檔案和類型定義。
