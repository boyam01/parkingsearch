import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VehicleRecord } from '@/types/vehicle';

// 合併 Tailwind CSS 類別
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化車牌號碼
export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(\w{3})(\w{4})/, '$1-$2');
}

// 正規化車牌號碼（用於搜尋）
export function normalizePlate(plate: string): string {
  return plate.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// 驗證車牌號碼格式（不限定格式）
export function validatePlate(plate: string): boolean {
  // 移除空白字元後檢查
  const cleanPlate = plate.trim();
  
  // 只要不是空字串且長度在合理範圍內就接受
  if (cleanPlate.length === 0) return false;
  if (cleanPlate.length > 20) return false; // 防止過長的輸入
  
  // 可以包含英文字母、數字、連字號、空格
  const validCharPattern = /^[A-Za-z0-9\-\s]+$/;
  return validCharPattern.test(cleanPlate);
}

// 格式化電話號碼
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // 手機號碼：0912-345-678
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
  } else if (cleaned.length === 9) {
    // 市話：02-2345-6789
    return cleaned.replace(/(\d{2})(\d{4})(\d{3})/, '$1-$2-$3');
  } else if (cleaned.length === 8) {
    // 市話：2345-6789
    return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2');
  }
  
  return phone;
}

// 驗證電話號碼
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 10;
}

// 格式化日期
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 格式化時間
export function formatTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

// 驗證時間格式
export function validateTime(time: string): boolean {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(time);
}

// 計算相對時間
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return '今天';
  } else if (diffInDays === 1) {
    return '昨天';
  } else if (diffInDays < 7) {
    return `${diffInDays} 天前`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} 週前`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} 個月前`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} 年前`;
  }
}

// 高亮搜尋關鍵字
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

// 防抖函式
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 節流函式
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// 深度複製
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// 產生唯一 ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 車輛記錄搜尋相關性計算
export function calculateSearchScore(record: VehicleRecord, query: string): number {
  const normalizedQuery = query.toLowerCase();
  let score = 0;

  // 車牌匹配（最高分）
  const normalizedPlate = normalizePlate(record.plate);
  if (normalizedPlate === normalizePlate(query)) {
    score += 1000; // 完全匹配
  } else if (normalizedPlate.includes(normalizePlate(query))) {
    score += 500; // 部分匹配
  }

  // 申請人姓名匹配
  if (record.applicantName.toLowerCase().includes(normalizedQuery)) {
    score += 200;
  }

  // 其他欄位匹配
  const fieldsToCheck = [
    record.vehicleType,
    record.identityType,
    record.department || '',
    record.brand || '',
    record.color || ''
  ];

  fieldsToCheck.forEach(field => {
    if (field.toLowerCase().includes(normalizedQuery)) {
      score += 50;
    }
  });

  // 根據審核狀態調整分數
  if (record.approvalStatus === 'approved') {
    score += 10;
  } else if (record.approvalStatus === 'pending') {
    score += 5;
  }

  return score;
}

// 排序車輛記錄
export function sortVehicleRecords(
  records: VehicleRecord[],
  sortBy: 'plate' | 'name' | 'date' | 'relevance',
  order: 'asc' | 'desc' = 'desc',
  query?: string
): VehicleRecord[] {
  return [...records].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'plate':
        comparison = a.plate.localeCompare(b.plate);
        break;
      case 'name':
        comparison = a.applicantName.localeCompare(b.applicantName);
        break;
      case 'date':
        comparison = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
        break;
      case 'relevance':
        if (query) {
          comparison = calculateSearchScore(b, query) - calculateSearchScore(a, query);
        }
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });
}

// 匯出 CSV
export function exportToCSV(records: VehicleRecord[], filename: string = 'vehicles.csv'): void {
  const headers = [
    '車牌號碼',
    '車型',
    '申請人姓名',
    '聯絡電話',
    '身份類別',
    '申請日期',
    '到訪時間',
    '車輛品牌',
    '車輛顏色',
    '部門',
    '審核狀態',
    '備註'
  ];

  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      record.plate,
      record.vehicleType,
      record.applicantName,
      record.contactPhone,
      record.identityType,
      record.applicationDate,
      record.visitTime || '',
      record.brand || '',
      record.color || '',
      record.department || '',
      record.approvalStatus,
      record.notes || ''
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 複製到剪貼簿
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 備用方法（適用於不安全的 context）
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('複製到剪貼簿失敗:', error);
    return false;
  }
}

// 狀態顏色工具
export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  const colors = {
    approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    expired: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  };

  return colors[status as keyof typeof colors] || colors.pending;
}

// 身份類型顏色
export function getIdentityColor(identityType: string): { bg: string; text: string } {
  const colors = {
    employee: { bg: 'bg-blue-100', text: 'text-blue-800' },
    executive: { bg: 'bg-purple-100', text: 'text-purple-800' },
    affiliate: { bg: 'bg-orange-100', text: 'text-orange-800' },
    visitor: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  return colors[identityType as keyof typeof colors] || colors.visitor;
}

// 車型圖示
export function getVehicleIcon(vehicleType: string): string {
  const icons = {
    sedan: '🚗',
    suv: '🚙',
    motorcycle: '🏍️',
    truck: '🚚',
    van: '🚐',
    electric: '🔋',
    vip: '👑',
  };

  return icons[vehicleType as keyof typeof icons] || '🚗';
}

// 打印功能
export function printElement(elementId: string): void {
  const printContents = document.getElementById(elementId)?.innerHTML;
  if (!printContents) {
    console.error('找不到要打印的元素');
    return;
  }

  const originalContents = document.body.innerHTML;
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>車輛記錄打印</title>
          <style>
            body { font-family: 'Microsoft JhengHei', sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 20px; }
            .vehicle-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; }
            .plate-number { font-size: 18px; font-weight: bold; color: #2563eb; }
            .applicant-name { font-size: 16px; margin: 5px 0; }
            .details { color: #666; font-size: 14px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>車輛記錄</h1>
            <p>打印時間：${formatDate(new Date())}</p>
          </div>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}

// 檔案大小格式化
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// 隨機生成測試資料
export function generateTestVehicle(): Partial<VehicleRecord> {
  const plates = ['ABC-1234', 'XYZ-5678', 'DEF-9999', 'GHI-0001'];
  const names = ['王小明', '李小華', '張大同', '陳美玲', '劉志明'];
  const vehicles = ['sedan', 'suv', 'motorcycle'] as const;
  const identities = ['employee', 'visitor', 'affiliate'] as const;
  const statuses = ['approved', 'pending', 'rejected'] as const;

  return {
    plate: plates[Math.floor(Math.random() * plates.length)],
    applicantName: names[Math.floor(Math.random() * names.length)],
    vehicleType: vehicles[Math.floor(Math.random() * vehicles.length)],
    identityType: identities[Math.floor(Math.random() * identities.length)],
    approvalStatus: statuses[Math.floor(Math.random() * statuses.length)],
    contactPhone: '0912-345-678',
    applicationDate: new Date().toISOString().split('T')[0],
  };
}
