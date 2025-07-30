import { ValidationRule, ValidationResult, ApplicationFormData } from '@/types/vehicle';

// 台灣身份證字號驗證
export function validateTaiwanId(id: string): boolean {
  if (!/^[A-Z][12]\d{8}$/.test(id)) return false;
  
  const letterMapping: Record<string, number> = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
    K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
    U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33
  };

  const firstLetter = id.charAt(0);
  const letterValue = letterMapping[firstLetter];
  
  let sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9;
  
  for (let i = 1; i < 9; i++) {
    sum += parseInt(id.charAt(i)) * (9 - i);
  }
  
  const checkDigit = parseInt(id.charAt(9));
  return (sum + checkDigit) % 10 === 0;
}

// 車牌號碼驗證（不限定格式）
export function validatePlateNumber(plate: string): boolean {
  // 移除空白字元後檢查
  const cleanPlate = plate.trim();
  
  // 只要不是空字串且長度在合理範圍內就接受
  if (cleanPlate.length === 0) return false;
  if (cleanPlate.length > 20) return false; // 防止過長的輸入
  
  // 可以包含英文字母、數字、連字號、空格
  const validCharPattern = /^[A-Za-z0-9\-\s]+$/;
  return validCharPattern.test(cleanPlate);
}

// 電話號碼驗證（台灣格式）
export function validatePhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/[-\s()]/g, '');
  
  // 手機號碼：09開頭，10碼
  // 市話：02/03/04/05/06/07/08/089開頭
  const patterns = [
    /^09\d{8}$/, // 手機
    /^0[2-8]\d{7,8}$/, // 市話
    /^089\d{6}$/ // 金門馬祖
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
}

// Email 驗證
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// 時間格式驗證
export function validateTime(time: string): boolean {
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(time);
}

// 日期格式驗證
export function validateDate(date: string): boolean {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

// 表單驗證規則
export const validationRules: Record<keyof ApplicationFormData, ValidationRule> = {
  // 車輛資訊
  plate: {
    required: true,
    customValidator: validatePlateNumber,
    errorMessage: '請輸入車牌號碼（可包含英文、數字、連字號）'
  },
  vehicleType: {
    required: true,
    errorMessage: '請選擇車輛類型'
  },
  brand: {
    maxLength: 50,
    errorMessage: '車輛品牌不得超過50個字元'
  },
  color: {
    maxLength: 20,
    errorMessage: '車輛顏色不得超過20個字元'
  },
  
  // 申請人資訊
  applicantName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
    errorMessage: '姓名必須為2-50個字元，只能包含中文、英文和空格'
  },
  applicantEmail: {
    required: true,
    customValidator: validateEmail,
    errorMessage: '請輸入有效的電子郵件地址'
  },
  applicantId: {
    required: true,
    customValidator: validateTaiwanId,
    errorMessage: '請輸入有效的台灣身份證字號'
  },
  contactPhone: {
    required: true,
    customValidator: validatePhoneNumber,
    errorMessage: '請輸入有效的電話號碼'
  },
  identityType: {
    required: true,
    errorMessage: '請選擇身份類別'
  },
  department: {
    maxLength: 100,
    errorMessage: '部門名稱不得超過100個字元'
  },
  
  // 來訪資訊
  visitPurpose: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: '來訪目的必須為5-200個字元'
  },
  applicationDate: {
    required: true,
    customValidator: (date) => {
      if (!validateDate(date)) return false;
      const today = new Date();
      const selectedDate = new Date(date);
      return selectedDate >= today;
    },
    errorMessage: '請選擇今天或未來的日期'
  },
  visitTime: {
    customValidator: (time) => !time || validateTime(time),
    errorMessage: '請輸入有效的時間格式（HH:MM）'
  },
  expectedDuration: {
    required: true,
    errorMessage: '請選擇預期停留時間'
  },
  
  // 緊急聯絡人
  emergencyContact: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
    errorMessage: '緊急聯絡人姓名必須為2-50個字元，只能包含中文、英文和空格'
  },
  emergencyPhone: {
    required: true,
    customValidator: validatePhoneNumber,
    errorMessage: '請輸入有效的緊急聯絡電話'
  },
  
  // 其他
  notes: {
    maxLength: 500,
    errorMessage: '備註不得超過500個字元'
  }
};

// 驗證單一欄位
export function validateField(fieldName: keyof ApplicationFormData, value: string): string | null {
  const rule = validationRules[fieldName];
  
  // 檢查必填欄位
  if (rule.required && (!value || value.trim() === '')) {
    return rule.errorMessage;
  }
  
  // 如果是空值且非必填，跳過後續驗證
  if (!value || value.trim() === '') {
    return null;
  }
  
  // 檢查最小長度
  if (rule.minLength && value.length < rule.minLength) {
    return rule.errorMessage;
  }
  
  // 檢查最大長度
  if (rule.maxLength && value.length > rule.maxLength) {
    return rule.errorMessage;
  }
  
  // 檢查正規表達式
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.errorMessage;
  }
  
  // 檢查自定義驗證
  if (rule.customValidator && !rule.customValidator(value)) {
    return rule.errorMessage;
  }
  
  return null;
}

// 驗證整個表單
export function validateApplicationForm(formData: ApplicationFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // 驗證每個欄位
  for (const [fieldName, value] of Object.entries(formData)) {
    const error = validateField(fieldName as keyof ApplicationFormData, value as string);
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  // 特殊驗證邏輯
  
  // 檢查緊急聯絡人不能與申請人相同
  if (formData.emergencyContact === formData.applicantName) {
    errors.emergencyContact = '緊急聯絡人不能與申請人相同';
  }
  
  // 檢查緊急聯絡電話不能與申請人電話相同
  if (formData.emergencyPhone === formData.contactPhone) {
    errors.emergencyPhone = '緊急聯絡電話不能與申請人電話相同';
  }
  
  // 如果是員工，檢查是否有部門資訊
  if (formData.identityType === 'staff' && (!formData.department || formData.department.trim() === '')) {
    errors.department = '員工申請必須填寫部門資訊';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 取得瀏覽器資訊
export function getBrowserInfo(): { ipAddress?: string; userAgent: string } {
  return {
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
  };
}

// 生成申請編號
export function generateApplicationId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `APP${year}${month}${day}${random}`;
}

// 格式化申請資料以供提交
export function formatApplicationData(formData: ApplicationFormData): Partial<import('@/types/vehicle').VehicleRecord> {
  const browserInfo = getBrowserInfo();
  const now = new Date().toISOString();
  
  return {
    id: generateApplicationId(),
    ...formData,
    approvalStatus: 'pending',
    createdAt: now,
    updatedAt: now,
    submittedBy: 'self',
    userAgent: browserInfo.userAgent,
  };
}
