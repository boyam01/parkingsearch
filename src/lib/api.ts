import axios from 'axios';
import { VehicleRecord, ApiResponse } from '@/types/vehicle';

// 獲取基礎 URL
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // 客戶端使用相對路徑
    return '/api';
  }
  
  // 服務端使用完整 URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  
  // Railway 部署環境
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api`;
  }
  
  // 本地開發環境
  return 'http://localhost:3000/api';
};

// API 基礎設定
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 攔截器：處理請求
api.interceptors.request.use(
  (config) => {
    // 加入 API Key 如果有的話
    const apiKey = process.env.NEXT_PUBLIC_RAGIC_API_KEY;
    if (apiKey) {
      config.headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 攔截器：處理回應
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 錯誤:', error);
    return Promise.reject(error);
  }
);

export class VehicleAPI {
  // 取得所有車輛記錄
  static async getAllVehicles(): Promise<VehicleRecord[]> {
    try {
      console.log('VehicleAPI: 開始取得車輛資料...');
      const response = await api.get<ApiResponse<VehicleRecord[]>>('/vehicles');
      console.log('VehicleAPI: API 回應:', response.data);
      
      if (response.data.success) {
        console.log('VehicleAPI: 成功取得', response.data.data.length, '筆記錄');
        return response.data.data;
      } else {
        console.error('VehicleAPI: API 回應失敗:', response.data.error);
        throw new Error(response.data.error || '取得車輛資料失敗');
      }
    } catch (error) {
      console.error('VehicleAPI: 取得車輛資料失敗:', error);
      
      // 如果是網路錯誤或 API 錯誤，嘗試直接呼叫 Ragic API
      try {
        console.log('VehicleAPI: 嘗試直接從 Ragic 取得資料...');
        const ragicData = await RagicAPI.getRecords();
        console.log('VehicleAPI: 直接從 Ragic 取得', ragicData.length, '筆記錄');
        return ragicData;
      } catch (ragicError) {
        console.error('VehicleAPI: 直接從 Ragic 取得資料也失敗:', ragicError);
        // 最後才返回空陣列，而不是模擬資料
        return [];
      }
    }
  }

  // 根據車牌查詢
  static async getVehicleByPlate(plate: string): Promise<VehicleRecord | null> {
    try {
      // 先取得所有車輛，然後過濾車牌
      const vehicles = await this.getAllVehicles();
      return vehicles.find(v => v.plate === plate) || null;
    } catch (error) {
      console.error('查詢車牌失敗:', error);
      return null;
    }
  }

  // 搜尋車輛（支援模糊搜尋）
  static async searchVehicles(query: string): Promise<VehicleRecord[]> {
    try {
      const response = await api.get<ApiResponse<VehicleRecord[]>>('/vehicles/search', {
        params: { q: query }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('搜尋車輛失敗:', error);
      return [];
    }
  }

  // 新增車輛記錄
  static async createVehicle(vehicle: Omit<VehicleRecord, 'id'>): Promise<VehicleRecord> {
    try {
      const response = await api.post<ApiResponse<VehicleRecord>>('/vehicles', vehicle);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '新增車輛記錄失敗');
      }
    } catch (error) {
      console.error('新增車輛記錄失敗:', error);
      throw error;
    }
  }

  // 更新車輛記錄
  static async updateVehicle(id: string, vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    try {
      const response = await api.put<ApiResponse<VehicleRecord>>(`/vehicles/${id}`, vehicle);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '更新車輛記錄失敗');
      }
    } catch (error) {
      console.error('更新車輛記錄失敗:', error);
      throw error;
    }
  }

  // 刪除車輛記錄
  static async deleteVehicle(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/vehicles/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('刪除車輛記錄失敗:', error);
      return false;
    }
  }

  // 取得統計資料
  static async getStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recent: number;
  }> {
    try {
      const response = await api.get<ApiResponse<any>>('/vehicles/statistics');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return {
          total: 0,
          byType: {},
          byStatus: {},
          recent: 0
        };
      }
    } catch (error) {
      console.error('取得統計資料失敗:', error);
      return {
        total: 0,
        byType: {},
        byStatus: {},
        recent: 0
      };
    }
  }

  // 模擬資料（用於開發測試）
  static getMockData(): VehicleRecord[] {
    return [
      {
        id: '1',
        plate: 'ABC-1234',
        vehicleType: 'car',
        applicantName: '張三',
        contactPhone: '0912-345-678',
        identityType: 'staff',
        applicationDate: '2024-01-15',
        visitTime: '09:00',
        brand: 'Toyota',
        color: '白色',
        department: '資訊部',
        approvalStatus: 'approved',
        notes: '長期停車',
        createdAt: '2024-01-15T09:00:00.000Z',
        updatedAt: '2024-01-15T09:00:00.000Z',
        submittedBy: 'admin'
      },
      {
        id: '2',
        plate: 'DEF-5678',
        vehicleType: 'motorcycle',
        applicantName: '李四',
        contactPhone: '0923-456-789',
        identityType: 'visitor',
        applicationDate: '2024-01-16',
        visitTime: '14:30',
        brand: 'Yamaha',
        color: '黑色',
        department: '',
        approvalStatus: 'pending',
        notes: '臨時訪客',
        createdAt: '2024-01-16T14:30:00.000Z',
        updatedAt: '2024-01-16T14:30:00.000Z',
        submittedBy: 'self'
      },
      {
        id: '3',
        plate: 'GHI-9012',
        vehicleType: 'vip',
        applicantName: '王五',
        contactPhone: '0934-567-890',
        identityType: 'executive',
        applicationDate: '2024-01-17',
        visitTime: '10:00',
        brand: 'Mercedes-Benz',
        color: '黑色',
        department: '總經理室',
        approvalStatus: 'approved',
        notes: '貴賓車輛',
        createdAt: '2024-01-17T10:00:00.000Z',
        updatedAt: '2024-01-17T10:00:00.000Z',
        submittedBy: 'admin'
      },
      {
        id: '4',
        plate: 'JKL-3456',
        vehicleType: 'car',
        applicantName: '陳六',
        contactPhone: '0945-678-901',
        identityType: 'partner',
        applicationDate: '2024-01-18',
        visitTime: '15:45',
        brand: 'Honda',
        color: '銀色',
        department: '合作夥伴',
        approvalStatus: 'approved',
        notes: '合作廠商代表',
        createdAt: '2024-01-18T15:45:00.000Z',
        updatedAt: '2024-01-18T15:45:00.000Z',
        submittedBy: 'self'
      },
      {
        id: '5',
        plate: 'MNO-7890',
        vehicleType: 'truck',
        applicantName: '林七',
        contactPhone: '0956-789-012',
        identityType: 'visitor',
        applicationDate: '2024-01-19',
        visitTime: '08:30',
        brand: 'Isuzu',
        color: '白色',
        department: '',
        approvalStatus: 'rejected',
        notes: '貨車禁止進入',
        createdAt: '2024-01-19T08:30:00.000Z',
        updatedAt: '2024-01-19T08:30:00.000Z',
        submittedBy: 'self'
      }
    ];
  }
}

// Ragic API 整合（如果使用 Ragic 作為後端）
export class RagicAPI {
  private static baseURL = process.env.NEXT_PUBLIC_RAGIC_BASE_URL || 'https://ap7.ragic.com';
  private static apiKey = process.env.NEXT_PUBLIC_RAGIC_API_KEY;
  private static accountName = process.env.NEXT_PUBLIC_RAGIC_ACCOUNT || 'xinsheng';
  private static formId = process.env.NEXT_PUBLIC_RAGIC_FORM_ID || '31';
  private static subtableId = process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID || '6';
  private static addRecordId = process.env.NEXT_PUBLIC_RAGIC_ADD_RECORD_ID || '-20000';

  static async getRecords(): Promise<VehicleRecord[]> {
    // 強制使用 Ragic 資料庫，不使用模擬資料
    try {
      const apiKey = this.apiKey || '';
      const url = `${this.baseURL}/${this.accountName}/ragicforms${this.formId}/${this.subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
      console.log('Ragic API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ragic Response:', data);

      // 轉換 Ragic 資料格式為我們的格式
      const transformedData = this.transformRagicData(data);
      console.log('轉換後的資料:', transformedData);
      
      return transformedData;
    } catch (error) {
      console.error('Ragic API 錯誤:', error);
      // 即使發生錯誤也不使用模擬資料，返回空陣列
      return [];
    }
  }

  static async getRecordById(id: string): Promise<VehicleRecord | null> {
    try {
      const apiKey = this.apiKey || '';
      const url = `${this.baseURL}/${this.accountName}/ragicforms${this.formId}/${this.subtableId}/${id}?api&APIKey=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const transformed = this.transformRagicData([data]);
      return transformed.length > 0 ? transformed[0] : null;
    } catch (error) {
      console.error('Ragic API 錯誤:', error);
      return null;
    }
  }

  static async createRecord(vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    console.log('🔥 強制寫入 Ragic 記錄開始');
    console.log('原始車輛資料:', vehicle);
    
    try {
      const ragicData = this.transformToRagicFormat(vehicle);
      console.log('轉換後的 Ragic 格式:', ragicData);
      
      const apiKey = this.apiKey || '';
      if (!apiKey) {
        throw new Error('RAGIC_API_KEY 未設定');
      }
      
      // 強制使用正確的 Ragic API 端點
      const url = `${this.baseURL}/${this.accountName}/ragicforms${this.formId}/${this.subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
      console.log('🚀 強制寫入 URL:', url);
      
      // 多重嘗試寫入機制
      let response: Response;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`📝 嘗試寫入第 ${attempts} 次...`);
        
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: new URLSearchParams(ragicData).toString()
          });
          
          console.log(`📊 第 ${attempts} 次回應狀態:`, response.status);
          
          if (response.ok) {
            break; // 成功就跳出迴圈
          } else if (attempts < maxAttempts) {
            console.warn(`⚠️ 第 ${attempts} 次寫入失敗，準備重試...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // 遞增延遲
            continue;
          }
        } catch (fetchError) {
          console.error(`❌ 第 ${attempts} 次網路錯誤:`, fetchError);
          if (attempts >= maxAttempts) {
            throw fetchError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      if (!response!.ok) {
        const errorText = await response!.text();
        console.error('💥 最終寫入失敗回應:', errorText);
        throw new Error(`強制寫入失敗! HTTP ${response!.status}: ${errorText}`);
      }

      const data = await response!.json();
      console.log('✅ 強制寫入成功回應:', data);
      
      // 強制轉換並驗證資料
      const transformedData = this.transformRagicData([data]);
      if (transformedData.length === 0) {
        throw new Error('資料轉換失敗，無法取得寫入結果');
      }
      
      const result = transformedData[0];
      console.log('🎉 強制寫入完成，最終結果:', result);
      
      return result;
    } catch (error) {
      console.error('💀 強制寫入 Ragic 記錄徹底失敗:', error);
      // 重新拋出錯誤，不允許靜默失敗
      throw new Error(`強制寫入失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async updateRecord(id: string, vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    try {
      const ragicData = this.transformToRagicFormat(vehicle);
      const apiKey = this.apiKey || '';
      const url = `${this.baseURL}/${this.accountName}/ragicforms${this.formId}/${this.subtableId}/${id}?api&APIKey=${encodeURIComponent(apiKey)}`;
      
      console.log('更新 Ragic 記錄 URL:', url);
      console.log('更新資料:', ragicData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(ragicData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('更新失敗回應:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      console.log('更新成功回應:', data);
      return this.transformRagicData([data])[0];
    } catch (error) {
      console.error('更新 Ragic 記錄錯誤:', error);
      throw error;
    }
  }

  static async deleteRecord(id: string): Promise<void> {
    try {
      const apiKey = this.apiKey || '';
      const url = `${this.baseURL}/${this.accountName}/ragicforms${this.formId}/${this.subtableId}/${id}?api&APIKey=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('刪除 Ragic 記錄錯誤:', error);
      throw error;
    }
  }

  private static transformRagicData(ragicData: any): VehicleRecord[] {
    console.log('原始 Ragic 資料:', ragicData);
    console.log('資料類型:', typeof ragicData);
    console.log('是否為陣列:', Array.isArray(ragicData));
    
    // 根據 Ragic 的資料結構進行轉換
    if (!ragicData) {
      console.log('無資料返回空陣列');
      return [];
    }

    // 將物件轉換為陣列
    const dataArray = Array.isArray(ragicData) ? ragicData : Object.values(ragicData);
    console.log('轉換後的資料陣列:', dataArray);
    console.log('陣列長度:', dataArray.length);

    return dataArray.map((item: any, index: number) => {
      console.log(`處理第 ${index} 筆資料:`, item);
      console.log('可用的欄位:', Object.keys(item));
      
      const record: VehicleRecord = {
        id: item._ragicId?.toString() || index.toString(),
        // 使用正確的 Ragic 欄位編號
        plate: item['1003984'] || '',  // 車牌號碼
        vehicleType: this.mapVehicleType(item['1003988'] || ''),  // 車輛類型
        applicantName: item['1003990'] || '',  // 申請人姓名
        contactPhone: item['1003991'] || '',  // 聯絡電話
        identityType: this.mapIdentityType(item['1003989'] || ''),  // 身分類別
        applicationDate: this.formatDate(item['1003992'] || ''),  // 申請日期
        visitTime: item['1003993'] || '',  // 到訪時間
        brand: item['1003985'] || '',  // 車輛品牌
        color: item['1003986'] || '',  // 車輛顏色
        department: item['1003994'] || '',  // 部門單位
        approvalStatus: this.mapApprovalStatus(item['1003987'] || ''),  // 審核狀態
        notes: item['1003995'] || '',  // 備註
        // 申請系統相關欄位 (這些可能需要其他 Ragic 欄位編號)
        applicantEmail: '',
        applicantId: '',
        emergencyContact: '',
        emergencyPhone: '',
        visitPurpose: '',
        expectedDuration: '',
        submittedBy: 'self',
        ipAddress: '',
        userAgent: '',
        createdAt: item._ragic_createdate || new Date(item._dataTimestamp || Date.now()).toISOString(),
        updatedAt: item._ragic_modifydate || new Date(item._dataTimestamp || Date.now()).toISOString()
      };
      
      console.log('轉換後的記錄:', record);
      return record;
    });
  }

  // 車輛類型對應
  private static mapVehicleType(ragicType: string): string {
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
  private static mapIdentityType(ragicType: string): string {
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

  // 審核狀態對應
  private static mapApprovalStatus(ragicStatus: string): 'pending' | 'approved' | 'rejected' | 'deleted' {
    const statusMap: { [key: string]: 'pending' | 'approved' | 'rejected' | 'deleted' } = {
      '待審核': 'pending',
      '已核准': 'approved',
      '已拒絕': 'rejected',
      '已刪除': 'deleted'
    };
    return statusMap[ragicStatus] || 'pending';
  }

  // 日期格式化
  private static formatDate(ragicDate: string): string {
    if (!ragicDate) return new Date().toISOString().split('T')[0];
    
    // Ragic 日期格式通常是 2025/07/08
    const parts = ragicDate.split('/');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    
    return ragicDate;
  }

  private static transformToRagicFormat(vehicle: Partial<VehicleRecord>): any {
    // 使用正確的 Ragic 欄位編號
    const ragicData: any = {};
    
    // 車牌號碼 (1003984) - 必填
    if (vehicle.plate) {
      ragicData['1003984'] = vehicle.plate;
    }
    
    // 車輛類型 (1003988) - 必填，根據表單的下拉選項
    if (vehicle.vehicleType) {
      const typeMap: { [key: string]: string } = {
        'car': '轎車',
        'motorcycle': '機車',
        'truck': '貨車',
        'bus': '巴士',
        'vip': '貴賓用車',
        'other': '其他'
      };
      ragicData['1003988'] = typeMap[vehicle.vehicleType] || '轎車';
    }
    
    // 到訪時間 (1003986)
    if (vehicle.visitTime) {
      ragicData['1003986'] = vehicle.visitTime;
    }
    
    // 身分類別 (1003989) - 根據表單的下拉選項
    if (vehicle.identityType) {
      const identityMap: { [key: string]: string } = {
        'staff': '同仁',
        'visitor': '訪客',
        'executive': '長官',
        'partner': '關係企業',
        'contractor': '承包商',
        'guest': '一般訪客'
      };
      ragicData['1003989'] = identityMap[vehicle.identityType] || '訪客';
    }
    
    // 申請人姓名 (1003990) - 必填
    if (vehicle.applicantName) {
      ragicData['1003990'] = vehicle.applicantName;
    }
    
    // 車輛品牌 (1003991)
    if (vehicle.brand) {
      ragicData['1003991'] = vehicle.brand;
    }
    
    // 聯絡電話 (1003992) - 必填
    if (vehicle.contactPhone) {
      ragicData['1003992'] = vehicle.contactPhone;
    }
    
    // 車輛顏色 (1003993)
    if (vehicle.color) {
      ragicData['1003993'] = vehicle.color;
    }
    
    // 申請日期 (1003994) - 必填，轉換為 yyyy/MM/dd 格式
    if (vehicle.applicationDate) {
      const date = new Date(vehicle.applicationDate);
      if (!isNaN(date.getTime())) {
        ragicData['1003994'] = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    } else {
      // 如果沒有提供申請日期，使用今天的日期
      const today = new Date();
      ragicData['1003994'] = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
    }
    
    // 部門 (1003995)
    if (vehicle.department) {
      ragicData['1003995'] = vehicle.department;
    }
    
    // 備註 - 找不到備註欄位編號，暫時略過
    // if (vehicle.notes) {
    //   ragicData['備註'] = vehicle.notes;
    // }
    
    console.log('轉換為 Ragic 格式 (使用正確欄位編號):', ragicData);
    return ragicData;
  }
}
