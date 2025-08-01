// 車輛記錄資料型別
export interface VehicleRecord {
  id: string;
  plate: string; // 車牌號碼
  vehicleType: string; // 車型（轎車、機車、貴賓用車）
  applicantName: string; // 申請人姓名
  contactPhone: string; // 聯絡電話
  identityType: string; // 身份類別（同仁／長官／關係企業／一般訪客）
  applicationDate: string; // 申請日期（YYYY-MM-DD）
  visitTime?: string; // 到訪時間（HH:MM）
  brand?: string; // 車輛品牌
  color?: string; // 車輛顏色
  department?: string; // 部門或單位
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'deleted'; // 審核狀態
  notes?: string; // 備註
  // 新增申請者建檔相關欄位
  applicantEmail?: string; // 申請人信箱
  applicantId?: string; // 身份證字號或員工編號
  emergencyContact?: string; // 緊急聯絡人
  emergencyPhone?: string; // 緊急聯絡電話
  visitPurpose?: string; // 來訪目的
  expectedDuration?: string; // 預期停留時間
  createdAt: string; // 建檔時間戳
  updatedAt: string; // 最後更新時間戳
  submittedBy: 'self' | 'admin'; // 申請方式
  ipAddress?: string; // 申請來源 IP
  userAgent?: string; // 瀏覽器資訊
}

// 車輛總量配置
export interface VehicleQuotaConfig {
  totalQuota: number; // 總配額
  quotaByType: {
    car: number; // 汽車配額
    motorcycle: number; // 機車配額
    truck: number; // 卡車配額
  };
  quotaByIdentity: {
    staff: number; // 員工配額
    visitor: number; // 訪客配額
    contractor: number; // 承包商配額
    guest: number; // 賓客配額
    vip: number; // VIP配額
  };
  dailyApplicationLimit: number; // 每日申請限制
  enableQuotaControl: boolean; // 是否啟用配額控制
  enableWaitingList: boolean; // 是否啟用候補名單
  quotaWarningThreshold: number; // 配額警告閾值 (百分比)
}

// 配額狀態
export interface QuotaStatus {
  totalUsed: number;
  totalAvailable: number;
  usageRate: number; // 使用率百分比
  byType: {
    car: { used: number; available: number; rate: number };
    motorcycle: { used: number; available: number; rate: number };
    truck: { used: number; available: number; rate: number };
  };
  byIdentity: {
    staff: { used: number; available: number; rate: number };
    visitor: { used: number; available: number; rate: number };
    contractor: { used: number; available: number; rate: number };
    guest: { used: number; available: number; rate: number };
    vip: { used: number; available: number; rate: number };
  };
  dailyApplications: number;
  isOverLimit: boolean;
  warnings: string[];
}

// 搜尋結果型別
export interface SearchResult {
  records: VehicleRecord[];
  query: string;
  total: number;
  searchTime: number; // 搜尋時間（毫秒）
}

// API 回應型別
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 申請表單資料型別
export interface ApplicationFormData {
  // 車輛資訊
  plate: string;
  vehicleType: string;
  brand?: string;
  color?: string;
  
  // 申請人資訊
  applicantName: string;
  applicantEmail: string;
  applicantId: string; // 身份證字號或員工編號
  contactPhone: string;
  identityType: string;
  department?: string;
  
  // 來訪資訊
  visitPurpose: string;
  applicationDate: string;
  visitTime?: string;
  expectedDuration: string;
  
  // 緊急聯絡人
  emergencyContact: string;
  emergencyPhone: string;
  
  // 其他
  notes?: string;
}

// 申請回應型別
export interface ApplicationResponse {
  success: boolean;
  applicationId?: string;
  message: string;
  errors?: Record<string, string>;
  submissionTime?: string;
}

// 通知型別
export interface NotificationData {
  id: string;
  type: 'email' | 'sms' | 'system';
  recipient: string;
  subject: string;
  message: string;
  applicationId: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
}

// 驗證規則型別
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  customValidator?: (value: string) => boolean;
  errorMessage: string;
}

// 表單驗證結果
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 快取設定型別
export interface CacheConfig {
  maxAge: number; // 快取有效期（毫秒）
  maxSize: number; // 最大快取項目數
}

// 字首樹節點型別
export interface TrieNode {
  isEndOfWord: boolean;
  children: Map<string, TrieNode>;
  records: VehicleRecord[];
}

// 身份類別對應的顏色和標籤
export const IDENTITY_TYPES = {
  staff: { label: '同仁', color: 'bg-blue-100 text-blue-800' },
  executive: { label: '長官', color: 'bg-purple-100 text-purple-800' },
  partner: { label: '關係企業', color: 'bg-green-100 text-green-800' },
  visitor: { label: '一般訪客', color: 'bg-gray-100 text-gray-800' }
} as const;

// 車型對應的圖示和標籤
export const VEHICLE_TYPES = {
  car: { label: '轎車', icon: '🚗' },
  motorcycle: { label: '機車', icon: '🏍️' },
  vip: { label: '貴賓用車', icon: '🚙' },
  truck: { label: '貨車', icon: '🚛' },
  other: { label: '其他', icon: '🚐' }
} as const;

// 審核狀態對應的顏色和標籤
export const APPROVAL_STATUS = {
  pending: { label: '待審核', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已通過', color: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒絕', color: 'bg-red-100 text-red-800' }
} as const;
