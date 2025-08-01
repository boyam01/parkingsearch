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
  timeout: 30000, // 增加到 30 秒以處理 Vercel 部署環境的延遲
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
      config.headers['Authorization'] = `Basic ${apiKey.trim()}`;
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
    const maxRetries = 2;
    let lastError: any = null;

    // 重試機制
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`VehicleAPI: 第 ${attempt} 次嘗試取得車輛資料...`);
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
        lastError = error;
        console.error(`VehicleAPI: 第 ${attempt} 次嘗試失敗:`, error);
        
        // 如果不是最後一次嘗試，等待一段時間後重試
        if (attempt < maxRetries + 1) {
          const waitTime = attempt * 1000; // 遞增等待時間：1秒、2秒
          console.log(`VehicleAPI: 等待 ${waitTime}ms 後重試...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
    }

    // 所有重試都失敗後，嘗試直接呼叫 Ragic API
    try {
      console.log('VehicleAPI: 所有 API 重試失敗，嘗試直接從 Ragic 取得資料...');
      const ragicData = await RagicAPI.getRecords();
      console.log('VehicleAPI: 直接從 Ragic 取得', ragicData.length, '筆記錄');
      return ragicData;
    } catch (ragicError) {
      console.error('VehicleAPI: 直接從 Ragic 取得資料也失敗:', ragicError);
      
      // 記錄所有錯誤但不拋出例外，返回空陣列確保前端不會崩潰
      console.error('VehicleAPI: 所有資料來源都失敗，返回空陣列');
      console.error('VehicleAPI: 最後的 API 錯誤:', lastError);
      console.error('VehicleAPI: 最後的 Ragic 錯誤:', ragicError);
      
      return []; // 返回空陣列，不拋出例外
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
      const apiKey = this.apiKey?.trim() || '';
      if (!apiKey) {
        console.error('❌ RAGIC_API_KEY 未設定！');
        throw new Error('RAGIC_API_KEY 未設定，請檢查環境變數');
      }

      const url = `${this.baseURL}/${this.accountName}/ragicforms${this.formId}/${this.subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
      console.log('🚀 Ragic API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ParkingSearch/1.0',
        }
      });

      console.log('📡 Ragic 回應狀態:', response.status);
      console.log('📡 Ragic 回應標頭:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ragic HTTP 錯誤:', response.status, errorText);
        throw new Error(`Ragic API 錯誤 ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Ragic 原始回應資料:', data);

      // 轉換 Ragic 資料格式為我們的格式
      const transformedData = this.transformRagicData(data);
      console.log('✅ 最終轉換資料筆數:', transformedData.length);
      
      if (transformedData.length === 0) {
        console.warn('⚠️ 警告：Ragic 回傳了空資料！請檢查表單是否有記錄');
      }
      
      return transformedData;
    } catch (error) {
      console.error('💥 Ragic API 錯誤:', error);
      
      // 如果是網路問題，提供更詳細的錯誤資訊
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌍 網路連接問題：無法連接到 Ragic 伺服器');
        throw new Error('無法連接到 Ragic 伺服器，請檢查網路連接');
      }
      
      // 重新拋出錯誤，不返回空陣列
      throw error;
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
    console.log('🔥 開始寫入 Ragic 記錄');
    console.log('原始車輛資料:', vehicle);
    
    try {
      // 驗證環境變數
      const apiKey = this.apiKey?.trim();
      const accountName = this.accountName?.trim();
      const formId = this.formId?.trim();
      const subtableId = this.subtableId?.trim();
      
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_RAGIC_API_KEY 未設定或為空');
      }
      if (!accountName) {
        throw new Error('NEXT_PUBLIC_RAGIC_ACCOUNT 未設定或為空');
      }
      if (!formId) {
        throw new Error('NEXT_PUBLIC_RAGIC_FORM_ID 未設定或為空');
      }
      if (!subtableId) {
        throw new Error('NEXT_PUBLIC_RAGIC_SUBTABLE_ID 未設定或為空');
      }
      
      console.log('📋 環境變數檢查通過:', {
        baseURL: this.baseURL,
        accountName,
        formId,
        subtableId,
        hasApiKey: !!apiKey
      });
      
      // 轉換資料格式
      const ragicData = this.transformToRagicFormat(vehicle);
      console.log('🔄 轉換後的 Ragic 格式:', ragicData);
      
      // 驗證必要欄位
      const requiredFields = ['1003984', '1003990', '1003992']; // 車牌、申請人、電話
      for (const field of requiredFields) {
        if (!ragicData[field]) {
          throw new Error(`缺少必要欄位: ${field}`);
        }
      }
      
      // 構建 API URL
      const url = `${this.baseURL}/${accountName}/ragicforms${formId}/${subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
      console.log('🚀 寫入 URL:', url);
      
      // 準備請求參數
      const formData = new URLSearchParams();
      Object.entries(ragicData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });
      
      console.log('📤 發送資料:', formData.toString());
      
      // 執行寫入操作（包含重試機制）
      let response: Response;
      let lastError: any = null;
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`� 第 ${attempt} 次寫入嘗試...`);
          
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
              'User-Agent': 'ParkingSearch/1.0',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: formData.toString()
          });
          
          console.log(`📊 第 ${attempt} 次回應狀態:`, response.status);
          
          if (response.ok) {
            break; // 成功就跳出迴圈
          } else {
            const errorText = await response.text();
            console.error(`❌ 第 ${attempt} 次寫入失敗:`, response.status, errorText);
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
            
            if (attempt < maxAttempts) {
              console.log(`⏳ 等待 ${attempt * 2} 秒後重試...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            }
          }
        } catch (fetchError) {
          console.error(`💥 第 ${attempt} 次網路錯誤:`, fetchError);
          lastError = fetchError;
          
          if (attempt < maxAttempts) {
            console.log(`⏳ 等待 ${attempt * 2} 秒後重試...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          }
        }
      }
      
      // 檢查最終結果
      if (!response! || !response!.ok) {
        throw lastError || new Error('所有寫入嘗試都失敗');
      }
      
      // 解析回應
      let responseData;
      try {
        const responseText = await response!.text();
        console.log('� 原始回應內容:', responseText);
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ 解析回應失敗:', parseError);
        throw new Error('無法解析 Ragic 回應資料');
      }
      
      console.log('✅ 寫入成功回應:', responseData);
      
      // 轉換回我們的格式
      const transformedData = this.transformRagicData([responseData]);
      if (transformedData.length === 0) {
        throw new Error('資料轉換失敗，無法取得寫入結果');
      }
      
      const result = transformedData[0];
      console.log('🎉 寫入完成，最終結果:', result);
      
      return result;
    } catch (error) {
      console.error('💀 寫入 Ragic 記錄失敗:', error);
      
      // 提供更詳細的錯誤資訊
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error('Ragic API Key 驗證失敗，請檢查環境變數設定');
        } else if (error.message.includes('HTTP 4')) {
          throw new Error('Ragic API 請求錯誤，請檢查欄位格式和權限');
        } else if (error.message.includes('fetch')) {
          throw new Error('網路連接錯誤，無法連接到 Ragic 伺服器');
        }
      }
      
      throw error;
    }
  }

  static async updateRecord(id: string, vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    console.log('🔄 開始更新 Ragic 記錄');
    console.log('記錄 ID:', id);
    console.log('更新資料:', vehicle);
    
    try {
      // 驗證環境變數
      const apiKey = this.apiKey?.trim();
      const accountName = this.accountName?.trim();
      const formId = this.formId?.trim();
      const subtableId = this.subtableId?.trim();
      
      if (!apiKey || !accountName || !formId || !subtableId) {
        throw new Error('Ragic 環境變數未正確設定');
      }
      
      // 轉換資料格式
      const ragicData = this.transformToRagicFormat(vehicle);
      console.log('🔄 轉換後的更新資料:', ragicData);
      
      // 構建 API URL
      const url = `${this.baseURL}/${accountName}/ragicforms${formId}/${subtableId}/${id}?api&APIKey=${encodeURIComponent(apiKey)}`;
      console.log('🚀 更新 URL:', url);
      
      // 準備請求參數
      const formData = new URLSearchParams();
      Object.entries(ragicData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });
      
      // 執行更新操作
      const response = await fetch(url, {
        method: 'POST', // Ragic 使用 POST 來更新記錄
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'ParkingSearch/1.0',
          'Cache-Control': 'no-cache'
        },
        body: formData.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 更新失敗回應:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      let responseData;
      try {
        const responseText = await response.text();
        console.log('📨 更新回應內容:', responseText);
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ 解析更新回應失敗:', parseError);
        throw new Error('無法解析 Ragic 更新回應');
      }

      console.log('✅ 更新成功回應:', responseData);
      
      // 轉換回我們的格式
      const transformedData = this.transformRagicData([responseData]);
      if (transformedData.length === 0) {
        throw new Error('更新後資料轉換失敗');
      }
      
      return transformedData[0];
    } catch (error) {
      console.error('💥 更新 Ragic 記錄錯誤:', error);
      throw error;
    }
  }

  static async deleteRecord(id: string): Promise<void> {
    console.log('🗑️ 開始刪除 Ragic 記錄');
    console.log('記錄 ID:', id);
    
    try {
      // 驗證環境變數
      const apiKey = this.apiKey?.trim();
      const accountName = this.accountName?.trim();
      const formId = this.formId?.trim();
      const subtableId = this.subtableId?.trim();
      
      if (!apiKey || !accountName || !formId || !subtableId) {
        throw new Error('Ragic 環境變數未正確設定');
      }
      
      // 構建 API URL
      const url = `${this.baseURL}/${accountName}/ragicforms${formId}/${subtableId}/${id}?api&APIKey=${encodeURIComponent(apiKey)}`;
      console.log('🚀 刪除 URL:', url);
      
      // 執行刪除操作
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ParkingSearch/1.0',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 刪除失敗回應:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      console.log('✅ 記錄刪除成功');
    } catch (error) {
      console.error('💥 刪除 Ragic 記錄錯誤:', error);
      throw error;
    }
  }

  private static transformRagicData(ragicData: any): VehicleRecord[] {
    console.log('🔍 原始 Ragic 資料:', ragicData);
    console.log('🔍 資料類型:', typeof ragicData);
    console.log('🔍 是否為陣列:', Array.isArray(ragicData));
    
    // 根據 Ragic 的資料結構進行轉換
    if (!ragicData) {
      console.log('⚠️ 無資料返回空陣列');
      return [];
    }

    // 將物件轉換為陣列
    const dataArray = Array.isArray(ragicData) ? ragicData : Object.values(ragicData);
    console.log('📊 轉換後的資料陣列:', dataArray);
    console.log('📊 陣列長度:', dataArray.length);

    if (dataArray.length === 0) {
      console.log('⚠️ 資料陣列為空');
      return [];
    }

    return dataArray.map((item: any, index: number) => {
      console.log(`🚀 處理第 ${index + 1} 筆資料:`, item);
      console.log(`🔑 可用的欄位:`, Object.keys(item));
      
      // 檢查特定欄位的值 - 🔥 使用中文欄位名稱（Ragic 實際回傳的）
      const carPlate = item["車牌號碼"];
      const applicant = item["申請人姓名"] || item["1003990"];  // 同時檢查中文和ID
      const type = item["車輛類型"];
      
      console.log(`🏷️ 車牌欄位分析:`, {
        fromChinese: item["車牌號碼"],
        fromID: item["1003984"],
        final: carPlate,
        type: typeof carPlate,
        isEmpty: !carPlate || carPlate.trim() === ''
      });
      console.log(`👤 申請人欄位分析:`, {
        fromChinese: item["申請人姓名"],
        fromID: item["1003990"],
        final: applicant,
        type: typeof applicant,
        isEmpty: !applicant || applicant.trim() === ''
      });
      console.log(`🚗 車輛類型欄位分析:`, {
        fromChinese: item["車輛類型"],
        fromID: item["1003988"],
        final: type,
        mapped: this.mapVehicleType(type || 'car')
      });
      
      const record: VehicleRecord = {
        id: item._ragicId?.toString() || `temp_${index}`,
        // 🔥 強化車牌顯示邏輯 - 確保車牌不為空或無效
        plate: carPlate && carPlate.trim() && carPlate.trim() !== '' ? 
               String(carPlate).trim() : 
               `MISSING-${item._ragicId || index}`,
        applicantName: applicant && applicant.trim() && applicant.trim() !== '' ? 
                      String(applicant).trim() : 
                      '未知申請人',
        vehicleType: this.mapVehicleType(type || 'car'),  // 預設為轎車
        contactPhone: String(item['聯絡電話'] || item['1003992'] || '').trim(),
        identityType: this.mapIdentityType(item['身份類別'] || item['1003989'] || 'visitor'),
        applicationDate: this.formatDate(item['申請日期'] || item['1003994'] || ''),
        visitTime: String(item['到訪時間'] || item['1003986'] || '').trim(),
        brand: String(item['車輛品牌'] || item['1003991'] || '').trim(),
        color: String(item['車輛顏色'] || '').trim(),
        department: String(item['部門'] || item['1003995'] || '').trim(),
        approvalStatus: 'pending',  
        notes: String(item['備註'] || item['1003996'] || '').trim(),  
        // 申請系統相關欄位
        applicantEmail: '',
        applicantId: '',
        emergencyContact: '',
        emergencyPhone: '',
        visitPurpose: '',
        expectedDuration: '',
        submittedBy: 'self',
        ipAddress: '',
        userAgent: '',
        createdAt: item._ragic_createdate || new Date().toISOString(),
        updatedAt: item._ragic_modifydate || new Date().toISOString()
      };
      
      console.log(`✅ 轉換後的記錄 #${index + 1}:`, {
        id: record.id,
        plate: record.plate,
        applicantName: record.applicantName,
        vehicleType: record.vehicleType
      });
      
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
    // 使用您提供的正確 Ragic 欄位編號
    const ragicData: any = {};
    
    console.log('🔄 開始轉換資料到 Ragic 格式:', vehicle);
    
    // 車牌號碼 (1003984) - 必填
    if (vehicle.plate && vehicle.plate.trim()) {
      ragicData['1003984'] = vehicle.plate.trim();
      console.log('✅ 車牌號碼:', ragicData['1003984']);
    } else {
      console.warn('⚠️ 缺少車牌號碼');
    }
    
    // 車輛類型 (1003988) - 修正欄位編號
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
      console.log('✅ 車輛類型:', ragicData['1003988']);
    } else {
      ragicData['1003988'] = '轎車'; // 預設值
    }
    
    // 申請人姓名 (1003990) - 修正欄位編號
    if (vehicle.applicantName && vehicle.applicantName.trim()) {
      ragicData['1003990'] = vehicle.applicantName.trim();
      console.log('✅ 申請人姓名:', ragicData['1003990']);
    } else {
      console.warn('⚠️ 缺少申請人姓名');
    }
    
    // 聯絡電話 (1003992) - 必填
    if (vehicle.contactPhone && vehicle.contactPhone.trim()) {
      ragicData['1003992'] = vehicle.contactPhone.trim();
      console.log('✅ 聯絡電話:', ragicData['1003992']);
    } else {
      console.warn('⚠️ 缺少聯絡電話');
    }
    
    // 申請日期 (1003994) - 必填，轉換為 yyyy/MM/dd 格式
    if (vehicle.applicationDate) {
      try {
        const date = new Date(vehicle.applicationDate);
        if (!isNaN(date.getTime())) {
          ragicData['1003994'] = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
          console.log('✅ 申請日期:', ragicData['1003994']);
        } else {
          throw new Error('無效的日期格式');
        }
      } catch (error) {
        console.warn('⚠️ 申請日期格式錯誤，使用今天:', error);
        const today = new Date();
        ragicData['1003994'] = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
      }
    } else {
      // 如果沒有提供申請日期，使用今天的日期
      const today = new Date();
      ragicData['1003994'] = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
      console.log('✅ 申請日期 (預設今天):', ragicData['1003994']);
    }
    
    // 到訪時間 (1003986) - 修正欄位編號
    if (vehicle.visitTime && vehicle.visitTime.trim()) {
      ragicData['1003986'] = vehicle.visitTime.trim();
      console.log('✅ 到訪時間:', ragicData['1003986']);
    }
    
    // 身分類別 (1003989) - 轉換為中文
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
      console.log('✅ 身分類別:', ragicData['1003989']);
    } else {
      ragicData['1003989'] = '訪客'; // 預設值
    }
    
    // 車輛品牌 (1003991)
    if (vehicle.brand && vehicle.brand.trim()) {
      ragicData['1003991'] = vehicle.brand.trim();
      console.log('✅ 車輛品牌:', ragicData['1003991']);
    }
    
    // 部門 (1003995)
    if (vehicle.department && vehicle.department.trim()) {
      ragicData['1003995'] = vehicle.department.trim();
      console.log('✅ 部門:', ragicData['1003995']);
    }
    
    // 備註 (如果有的話，您沒提供備註欄位編號，我保留原來的 1003996)
    if (vehicle.notes && vehicle.notes.trim()) {
      ragicData['1003996'] = vehicle.notes.trim();
      console.log('✅ 備註:', ragicData['1003996']);
    }
    
    console.log('🔄 最終轉換結果:', ragicData);
    
    // 驗證必要欄位 - 使用正確的欄位編號
    const requiredFields = {
      '1003984': '車牌號碼',
      '1003990': '申請人姓名',
      '1003992': '聯絡電話',
      '1003994': '申請日期'
    };
    
    const missingFields = [];
    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
      if (!ragicData[fieldId]) {
        missingFields.push(fieldName);
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`缺少必要欄位: ${missingFields.join(', ')}`);
    }
    
    return ragicData;
  }
}
