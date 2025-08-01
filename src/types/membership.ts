// 會員資料型別
export interface MemberRecord {
  id: string;
  memberNumber: string; // 會員編號
  name: string; // 姓名
  email: string; // 電子郵件
  phone: string; // 聯絡電話
  idNumber: string; // 身份證字號/員工編號
  department?: string; // 部門
  position?: string; // 職位
  membershipType: 'monthly' | 'yearly' | 'permanent'; // 會員類型
  status: 'active' | 'inactive' | 'suspended' | 'expired'; // 狀態
  registrationDate: string; // 註冊日期
  expiryDate: string; // 到期日期
  lastRenewalDate?: string; // 最後續約日期
  vehicleQuota: number; // 車輛配額
  usedQuota: number; // 已使用配額
  notes?: string; // 備註
  createdAt: string;
  updatedAt: string;
}

// 月租車記錄
export interface MonthlyParkingRecord {
  id: string;
  memberId: string; // 關聯會員ID
  memberNumber: string; // 會員編號
  plate: string; // 車牌號碼
  vehicleType: 'car' | 'motorcycle' | 'truck';
  brand?: string; // 車輛品牌
  color?: string; // 車輛顏色
  model?: string; // 車型
  parkingSpaceNumber?: string; // 停車位號碼
  contractStartDate: string; // 合約開始日期
  contractEndDate: string; // 合約結束日期
  monthlyFee: number; // 月租費用
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled'; // 付款狀態
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'auto_debit'; // 付款方式
  lastPaymentDate?: string; // 最後付款日期
  nextPaymentDue?: string; // 下次付款到期日
  renewalReminders: RenewalReminder[]; // 續約提醒記錄
  status: 'active' | 'inactive' | 'expired' | 'cancelled'; // 狀態
  notes?: string; // 備註
  createdAt: string;
  updatedAt: string;
}

// 續約提醒記錄
export interface RenewalReminder {
  id: string;
  type: 'email' | 'sms' | 'system'; // 提醒類型
  scheduledDate: string; // 預定提醒日期
  sentDate?: string; // 實際發送日期
  status: 'pending' | 'sent' | 'failed' | 'cancelled'; // 狀態
  message: string; // 提醒內容
  recipientEmail?: string; // 收件人郵箱
  recipientPhone?: string; // 收件人電話
  attempt: number; // 嘗試次數
  lastAttempt?: string; // 最後嘗試時間
  createdAt: string;
}

// 會員申請表單
export interface MemberApplicationForm {
  // 基本資訊
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  department?: string;
  position?: string;
  
  // 會員資訊
  membershipType: 'monthly' | 'yearly' | 'permanent';
  vehicleQuota: number;
  
  // 車輛資訊（可多輛）
  vehicles: {
    plate: string;
    vehicleType: 'car' | 'motorcycle' | 'truck';
    brand?: string;
    color?: string;
    model?: string;
  }[];
  
  // 合約資訊
  contractStartDate: string;
  contractEndDate: string;
  monthlyFee: number;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'auto_debit';
  
  notes?: string;
}

// 續約表單
export interface RenewalForm {
  membershipId: string;
  newExpiryDate: string;
  monthlyFee: number;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'auto_debit';
  notes?: string;
}

// API 回應型別
export interface MembershipApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 統計資料
export interface MembershipStatistics {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  occupancyRate: number; // 占用率
  upcomingExpirations: number; // 即將到期數量
  overduePayments: number; // 逾期付款數量
}

// 提醒設定
export interface ReminderSettings {
  daysBeforeExpiry: number[]; // 到期前幾天提醒 (例: [30, 15, 7, 3, 1])
  emailTemplate: string; // 郵件模板
  smsTemplate: string; // 簡訊模板
  enableEmail: boolean;
  enableSms: boolean;
  enableSystemNotification: boolean;
  maxRetryAttempts: number; // 最大重試次數
  retryInterval: number; // 重試間隔（小時）
}

// 會員查詢選項
export interface MemberSearchOptions {
  query?: string;
  status?: MemberRecord['status'];
  membershipType?: MemberRecord['membershipType'];
  expiringWithinDays?: number;
  department?: string;
  sortBy?: 'name' | 'expiryDate' | 'registrationDate' | 'memberNumber';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 常數定義
export const MEMBERSHIP_TYPES = {
  monthly: '月租',
  yearly: '年租', 
  permanent: '永久'
} as const;

export const MEMBER_STATUS = {
  active: '正常',
  inactive: '停用',
  suspended: '暫停',
  expired: '已到期'
} as const;

export const PAYMENT_STATUS = {
  paid: '已付款',
  pending: '待付款',
  overdue: '逾期',
  cancelled: '已取消'
} as const;

export const PAYMENT_METHODS = {
  cash: '現金',
  transfer: '轉帳',
  card: '刷卡',
  auto_debit: '自動扣款'
} as const;
