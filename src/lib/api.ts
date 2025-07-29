import axios from 'axios';
import { VehicleRecord, ApiResponse } from '@/types/vehicle';

// API 基礎設定
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
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
      const response = await api.get<ApiResponse<VehicleRecord[]>>('/vehicles');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '取得車輛資料失敗');
      }
    } catch (error) {
      console.error('取得車輛資料失敗:', error);
      // 返回模擬資料作為備案
      return this.getMockData();
    }
  }

  // 根據車牌查詢
  static async getVehicleByPlate(plate: string): Promise<VehicleRecord | null> {
    try {
      const response = await api.get<ApiResponse<VehicleRecord>>(`/vehicles/${encodeURIComponent(plate)}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return null;
      }
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
        notes: '長期停車'
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
        notes: '臨時訪客'
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
        notes: '貴賓車輛'
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
        notes: '合作廠商代表'
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
        notes: '貨車禁止進入'
      }
    ];
  }
}

// Ragic API 整合（如果使用 Ragic 作為後端）
export class RagicAPI {
  private static baseURL = process.env.NEXT_PUBLIC_RAGIC_BASE_URL;
  private static apiKey = process.env.NEXT_PUBLIC_RAGIC_API_KEY;

  static async getRecords(): Promise<VehicleRecord[]> {
    if (!this.baseURL || !this.apiKey) {
      console.warn('Ragic 設定不完整，使用模擬資料');
      return VehicleAPI.getMockData();
    }

    try {
      const response = await axios.get(`${this.baseURL}/forms/your-form-id`, {
        headers: {
          'Authorization': `Basic ${btoa(this.apiKey + ':')}`
        }
      });

      // 轉換 Ragic 資料格式為我們的格式
      return this.transformRagicData(response.data);
    } catch (error) {
      console.error('Ragic API 錯誤:', error);
      return VehicleAPI.getMockData();
    }
  }

  private static transformRagicData(ragicData: any): VehicleRecord[] {
    // 根據 Ragic 的資料結構進行轉換
    // 這裡需要根據實際的 Ragic 表單結構來調整
    return [];
  }
}
