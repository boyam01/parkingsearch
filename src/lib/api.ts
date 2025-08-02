import axios from 'axios';
import { VehicleRecord, ApiResponse } from '@/types/vehicle';

// 🔧 API 配置
const API_CONFIG = {
  timeout: 30000, // 30 秒超時
  retries: 3,     // 重試次數
  baseDelay: 1000 // 基礎延遲
};

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
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔧 統一的重試機制
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  retries: number = API_CONFIG.retries
): Promise<T> {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - 第 ${attempt} 次嘗試`);
      const result = await operation();
      console.log(`✅ ${operationName} - 第 ${attempt} 次嘗試成功`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ ${operationName} - 第 ${attempt} 次嘗試失敗:`, error);
      
      if (attempt < retries) {
        const delay = API_CONFIG.baseDelay * attempt;
        console.log(`⏳ ${operationName} - 等待 ${delay}ms 後重試...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error(`${operationName} - 所有重試都失敗`);
}

// 攔截器：處理請求
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 請求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API 請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 攔截器：處理回應
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API 回應: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API 回應錯誤:', error);
    return Promise.reject(error);
  }
);

// 🌐 優化前端 API 客戶端類別
export class VehicleAPI {
  
  // 🚀 優化的車輛資料獲取
  static async getAllVehicles(options?: {
    useCache?: boolean;
    forceRefresh?: boolean;
  }): Promise<VehicleRecord[]> {
    return withRetry(async () => {
      const params = new URLSearchParams();
      if (options?.forceRefresh) {
        params.append('refresh', 'true');
      }
      
      const url = `/vehicles${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<{
        success: boolean;
        data: VehicleRecord[];
        total: number;
        cached?: boolean;
        queryTime?: number;
        error?: string;
      }>(url);
      
      if (response.data.success) {
        const { cached, queryTime } = response.data;
        console.log(`✅ 成功取得 ${response.data.data.length} 筆記錄 (快取: ${cached ? '是' : '否'}, 耗時: ${queryTime}ms)`);
        return response.data.data;
      } else {
        throw new Error(response.data.error || '取得車輛資料失敗');
      }
    }, 'VehicleAPI.getAllVehicles');
  }

  // 🔍 優化的搜尋功能
  static async searchVehicles(query: string, options?: {
    limit?: number;
    useCache?: boolean;
  }): Promise<VehicleRecord[]> {
    if (!query.trim()) {
      return this.getAllVehicles({ useCache: options?.useCache });
    }

    return withRetry(async () => {
      const params = new URLSearchParams();
      params.append('q', query.trim());
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }
      
      const response = await api.get<{
        success: boolean;
        data: VehicleRecord[];
        total: number;
        filteredCount: number;
        cached?: boolean;
        queryTime?: number;
        error?: string;
      }>(`/vehicles?${params.toString()}`);
      
      if (response.data.success) {
        const { cached, queryTime, filteredCount, total } = response.data;
        console.log(`🔍 搜尋 "${query}" 找到 ${filteredCount}/${total} 筆結果 (快取: ${cached ? '是' : '否'}, 耗時: ${queryTime}ms)`);
        return response.data.data;
      } else {
        console.warn('搜尋無結果:', response.data.error);
        return [];
      }
    }, 'VehicleAPI.searchVehicles');
  }

  // 根據車牌快速查詢 (優化版)
  static async getVehicleByPlate(plate: string): Promise<VehicleRecord | null> {
    if (!plate.trim()) return null;
    
    try {
      const results = await this.searchVehicles(plate.trim(), { limit: 1 });
      // 精確匹配車牌號碼
      return results.find(v => v.plate === plate.trim()) || null;
    } catch (error) {
      console.error('查詢車牌失敗:', error);
      return null;
    }
  }

  // 🔄 快取管理
  static async clearCache(): Promise<boolean> {
    try {
      const response = await api.post('/vehicles/cache', { action: 'clear' });
      if (response.data.success) {
        console.log('✅ 快取已清除');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 清除快取失敗:', error);
      return false;
    }
  }

  // 強制重新整理資料
  static async forceRefresh(): Promise<VehicleRecord[]> {
    console.log('🔄 強制重新整理車輛資料...');
    return this.getAllVehicles({ forceRefresh: true });
  }

  // 新增車輛記錄
  static async createVehicle(vehicle: Omit<VehicleRecord, 'id'>): Promise<VehicleRecord> {
    return withRetry(async () => {
      console.log('📝 準備新增車輛:', vehicle);
      
      const response = await api.post<ApiResponse<VehicleRecord>>('/vehicles', {
        plate: vehicle.plate,
        vehicleType: vehicle.vehicleType,
        applicantName: vehicle.applicantName,
        contactPhone: vehicle.contactPhone,
        identityType: vehicle.identityType,
        applicationDate: vehicle.applicationDate,
        visitTime: vehicle.visitTime,
        brand: vehicle.brand,
        color: vehicle.color,
        department: vehicle.department,
        notes: vehicle.notes
      });
      
      if (response.data.success) {
        console.log('✅ 新增車輛成功:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.error || '新增車輛記錄失敗');
      }
    }, 'VehicleAPI.createVehicle');
  }

  // 更新車輛記錄
  static async updateVehicle(id: string, vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    return withRetry(async () => {
      const response = await api.put<ApiResponse<VehicleRecord>>(`/vehicles/${id}`, vehicle);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '更新車輛記錄失敗');
      }
    }, 'VehicleAPI.updateVehicle');
  }

  // 刪除車輛記錄
  static async deleteVehicle(id: string): Promise<boolean> {
    return withRetry(async () => {
      const response = await api.delete<ApiResponse<null>>(`/vehicles/${id}`);
      return response.data.success;
    }, 'VehicleAPI.deleteVehicle');
  }

  // 取得統計資料
  static async getStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recent: number;
  }> {
    return withRetry(async () => {
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
    }, 'VehicleAPI.getStatistics');
  }
}

// 🧪 除錯用途的 RagicAPI 類別（僅保留除錯功能）
export class RagicAPI {
  
  // 🔥 除錯方法：透過後端 API 路由測試連接
  static async debugRagicConnection(): Promise<{
    success: boolean;
    error?: string;
    vehicleCount?: number;
    sampleRecord?: any;
  }> {
    try {
      console.log('🔍 開始除錯 Ragic 連接...');
      
      // 透過 API 路由測試讀取
      const vehicles = await VehicleAPI.getAllVehicles();
      
      return {
        success: true,
        vehicleCount: vehicles.length,
        sampleRecord: vehicles.length > 0 ? vehicles[0] : null
      };
    } catch (error) {
      console.error('💥 除錯測試失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
