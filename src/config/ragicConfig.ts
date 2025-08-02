// 🔧 Ragic 整合配置中心
// 集中管理所有 Ragic 相關的配置、欄位對應和表單定義

export interface RagicFormConfig {
  formId: string;
  subtableId: string;
  writeSubtableId?: string; // 如果寫入使用不同的子表
  fieldMapping: {
    [key: string]: string; // 本地欄位名 -> Ragic 欄位 ID
  };
  reverseFieldMapping: {
    [key: string]: string; // Ragic 欄位名/ID -> 本地欄位名
  };
}

export interface RagicConfig {
  baseURL: string;
  account: string;
  apiKey: string;
  forms: {
    [formKey: string]: RagicFormConfig;
  };
}

// 🌐 環境變數驗證
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`缺少必要環境變數: ${key}`);
  }
  return value.trim();
}

// 🚗 車輛表單配置
const VEHICLE_FORM_CONFIG: RagicFormConfig = {
  formId: getRequiredEnv('RAGIC_FORM_ID'),
  subtableId: getRequiredEnv('RAGIC_SUBTABLE_ID'),
  writeSubtableId: process.env.RAGIC_WRITE_SUBTABLE_ID || getRequiredEnv('RAGIC_SUBTABLE_ID'),
  
  // 本地欄位 -> Ragic 欄位 ID 對應 (已更正)
  fieldMapping: {
    plate: '1003984',           // 車牌號碼
    vehicleType: '1003988',     // 車輛類型 (更正)
    applicantName: '1003990',   // 申請人姓名 (更正)
    contactPhone: '1003992',    // 聯絡電話
    applicationDate: '1003994', // 申請日期
    visitTime: '1003986',       // 到訪時間 (更正)
    identityType: '1003989',    // 身份類別
    brand: '1003991',           // 車輛品牌
    department: '1003995',      // 部門
    // 移除不確定的欄位，避免混淆
    // color: '',               // 車輛顏色 (暫時移除)
    // notes: '',               // 備註 (暫時移除)
    // approvalStatus: '',      // 審核狀態 (暫時移除)
  },
  
  // Ragic 欄位名/ID -> 本地欄位名對應（用於讀取資料時轉換）(已更正)
  reverseFieldMapping: {
    // 中文欄位名對應
    '車牌號碼': 'plate',
    '申請人姓名': 'applicantName',
    '車輛類型': 'vehicleType',
    '到訪時間': 'visitTime',
    '身份類別': 'identityType',
    '車輛品牌': 'brand',
    '聯絡電話': 'contactPhone',
    '申請日期': 'applicationDate',
    '部門': 'department',
    
    // 欄位 ID 對應 (已更正)
    '1003984': 'plate',           // 車牌號碼
    '1003988': 'vehicleType',     // 車輛類型 (更正)
    '1003990': 'applicantName',   // 申請人姓名 (更正)
    '1003992': 'contactPhone',    // 聯絡電話
    '1003994': 'applicationDate', // 申請日期
    '1003986': 'visitTime',       // 到訪時間 (更正)
    '1003989': 'identityType',    // 身份類別
    '1003991': 'brand',           // 車輛品牌
    '1003995': 'department',      // 部門
  }
};

// 🏗️ 主要配置物件
export const ragicConfig: RagicConfig = {
  baseURL: getRequiredEnv('RAGIC_BASE_URL'),
  account: getRequiredEnv('RAGIC_ACCOUNT'),
  apiKey: getRequiredEnv('RAGIC_API_KEY'),
  forms: {
    vehicles: VEHICLE_FORM_CONFIG,
    // 未來可擴展其他表單
    // members: MEMBER_FORM_CONFIG,
    // applications: APPLICATION_FORM_CONFIG,
  }
};

// 🔄 資料轉換輔助函式
export class RagicDataTransformer {
  
  // 將本地資料轉換為 Ragic 格式
  static toRagicFormat(formKey: string, localData: Record<string, any>): Record<string, string> {
    const formConfig = ragicConfig.forms[formKey];
    if (!formConfig) {
      throw new Error(`未找到表單配置: ${formKey}`);
    }
    
    const ragicData: Record<string, string> = {};
    
    Object.entries(localData).forEach(([localField, value]) => {
      const ragicFieldId = formConfig.fieldMapping[localField];
      if (ragicFieldId && value !== undefined && value !== null) {
        ragicData[ragicFieldId] = String(value);
      }
    });
    
    return ragicData;
  }
  
  // 將 Ragic 資料轉換為本地格式
  static fromRagicFormat(formKey: string, ragicData: Record<string, any>): Record<string, any> {
    const formConfig = ragicConfig.forms[formKey];
    if (!formConfig) {
      throw new Error(`未找到表單配置: ${formKey}`);
    }
    
    const localData: Record<string, any> = {};
    
    Object.entries(ragicData).forEach(([ragicField, value]) => {
      const localField = formConfig.reverseFieldMapping[ragicField];
      if (localField && value !== undefined && value !== null && value !== '') {
        localData[localField] = value;
      }
    });
    
    return localData;
  }
  
  // 車輛類型對應
  static mapVehicleType(ragicType: string): string {
    const typeMap: { [key: string]: string } = {
      '轎車': 'car',
      '機車': 'motorcycle',
      '貨車': 'truck',
      '巴士': 'bus',
      '貴賓用車': 'vip',
      '其他': 'other'
    };
    return typeMap[ragicType] || 'car';
  }
  
  // 身份類別對應
  static mapIdentityType(ragicType: string): string {
    const typeMap: { [key: string]: string } = {
      '同仁': 'staff',
      '長官': 'executive',
      '關係企業': 'partner',
      '一般訪客': 'visitor',
      '訪客': 'visitor',
      '承包商': 'contractor'
    };
    return typeMap[ragicType] || 'visitor';
  }
  
  // 日期格式化（Ragic 使用 yyyy/MM/dd）
  static formatDateForRagic(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }
  
  // 解析 Ragic 日期格式
  static parseDateFromRagic(ragicDate: string): string {
    if (!ragicDate) return '';
    
    const parts = ragicDate.split('/');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    
    return ragicDate;
  }
}

// 🛠️ 配置驗證
export function validateRagicConfig(): void {
  try {
    // 驗證基本配置
    if (!ragicConfig.baseURL) throw new Error('RAGIC_BASE_URL 未設定');
    if (!ragicConfig.account) throw new Error('RAGIC_ACCOUNT 未設定');
    if (!ragicConfig.apiKey) throw new Error('RAGIC_API_KEY 未設定');
    
    // 驗證表單配置
    Object.entries(ragicConfig.forms).forEach(([formKey, config]) => {
      if (!config.formId) throw new Error(`${formKey} 的 formId 未設定`);
      if (!config.subtableId) throw new Error(`${formKey} 的 subtableId 未設定`);
      if (Object.keys(config.fieldMapping).length === 0) {
        throw new Error(`${formKey} 的 fieldMapping 為空`);
      }
    });
    
    console.log('✅ Ragic 配置驗證通過');
  } catch (error) {
    console.error('❌ Ragic 配置驗證失敗:', error);
    throw error;
  }
}

// 🔍 除錯輔助
export function debugRagicConfig(): void {
  console.log('🔧 Ragic 配置資訊:');
  console.log('  Base URL:', ragicConfig.baseURL);
  console.log('  Account:', ragicConfig.account);
  console.log('  API Key Length:', ragicConfig.apiKey?.length || 0);
  console.log('  可用表單:', Object.keys(ragicConfig.forms));
  
  Object.entries(ragicConfig.forms).forEach(([formKey, config]) => {
    console.log(`  ${formKey}:`);
    console.log(`    Form ID: ${config.formId}`);
    console.log(`    Subtable ID: ${config.subtableId}`);
    console.log(`    Write Subtable ID: ${config.writeSubtableId}`);
    console.log(`    欄位數量: ${Object.keys(config.fieldMapping).length}`);
  });
}
