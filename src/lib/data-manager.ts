/**
 * 資料管理器 - 處理資料的自動更新和讀寫操作
 */
import { VehicleRecord } from '@/types/vehicle';
import { VehicleAPI } from './api';

export class DataManager {
  private static instance: DataManager;
  private cache: VehicleRecord[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 30000; // 30秒自動更新
  private listeners: Set<() => void> = new Set();
  private autoUpdateEnabled: boolean = true;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoUpdate();
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * 啟動自動更新
   */
  private startAutoUpdate() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      if (this.autoUpdateEnabled) {
        await this.refreshData();
      }
    }, this.updateInterval);

    // 初始載入
    this.refreshData();
  }

  /**
   * 強制重新獲取資料
   */
  async refreshData(force: boolean = false): Promise<VehicleRecord[]> {
    const now = Date.now();
    
    // 如果不是強制更新且快取還新鮮，直接返回快取
    if (!force && this.cache.length > 0 && (now - this.lastUpdate) < 10000) {
      return this.cache;
    }

    try {
      console.log('📡 重新獲取資料...');
      const data = await VehicleAPI.getAllVehicles();
      
      // 檢查資料是否有變化
      const hasChanged = JSON.stringify(this.cache) !== JSON.stringify(data);
      
      this.cache = data;
      this.lastUpdate = now;
      
      if (hasChanged) {
        console.log('✅ 資料已更新，通知所有監聽器');
        this.notifyListeners();
      }
      
      return this.cache;
    } catch (error) {
      console.error('❌ 獲取資料失敗:', error);
      return this.cache; // 返回快取資料
    }
  }

  /**
   * 獲取快取資料
   */
  getCachedData(): VehicleRecord[] {
    return [...this.cache];
  }

  /**
   * 新增車輛記錄
   */
  async addRecord(vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    try {
      console.log('📝 新增車輛記錄:', vehicle.plate);
      const newRecord = await VehicleAPI.createVehicle(vehicle as Omit<VehicleRecord, 'id'>);
      
      // 立即重新獲取資料以確保同步
      await this.refreshData(true);
      
      return newRecord;
    } catch (error) {
      console.error('❌ 新增記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 更新車輛記錄
   */
  async updateRecord(id: string, vehicle: Partial<VehicleRecord>): Promise<VehicleRecord> {
    try {
      console.log('✏️ 更新車輛記錄:', id);
      const updatedRecord = await VehicleAPI.updateVehicle(id, vehicle);
      
      // 立即重新獲取資料以確保同步
      await this.refreshData(true);
      
      return updatedRecord;
    } catch (error) {
      console.error('❌ 更新記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除車輛記錄
   */
  async deleteRecord(id: string): Promise<void> {
    try {
      console.log('🗑️ 刪除車輛記錄:', id);
      await VehicleAPI.deleteVehicle(id);
      
      // 立即重新獲取資料以確保同步
      await this.refreshData(true);
    } catch (error) {
      console.error('❌ 刪除記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 根據車牌查詢記錄
   */
  async getRecordByPlate(plate: string): Promise<VehicleRecord | null> {
    const data = await this.refreshData();
    return data.find(record => record.plate === plate) || null;
  }

  /**
   * 搜尋記錄
   */
  async searchRecords(query: string): Promise<VehicleRecord[]> {
    const data = await this.refreshData();
    const normalizedQuery = query.toLowerCase();
    
    return data.filter(record => 
      record.plate.toLowerCase().includes(normalizedQuery) ||
      record.applicantName.toLowerCase().includes(normalizedQuery) ||
      record.vehicleType.toLowerCase().includes(normalizedQuery) ||
      record.identityType.toLowerCase().includes(normalizedQuery) ||
      record.department?.toLowerCase().includes(normalizedQuery) ||
      record.brand?.toLowerCase().includes(normalizedQuery) ||
      record.color?.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * 監聽資料變化
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // 返回取消訂閱函數
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 通知所有監聽器
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('監聽器執行錯誤:', error);
      }
    });
  }

  /**
   * 設置自動更新間隔
   */
  setUpdateInterval(ms: number) {
    this.updateInterval = ms;
    this.startAutoUpdate();
  }

  /**
   * 啟用/停用自動更新
   */
  setAutoUpdate(enabled: boolean) {
    this.autoUpdateEnabled = enabled;
    if (!enabled && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    } else if (enabled && !this.intervalId) {
      this.startAutoUpdate();
    }
  }

  /**
   * 獲取資料統計
   */
  getStatistics() {
    const data = this.getCachedData();
    
    const stats = {
      total: data.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byIdentity: {} as Record<string, number>,
      recent: 0
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    data.forEach(record => {
      // 按車型統計
      stats.byType[record.vehicleType] = (stats.byType[record.vehicleType] || 0) + 1;
      
      // 按狀態統計
      stats.byStatus[record.approvalStatus] = (stats.byStatus[record.approvalStatus] || 0) + 1;
      
      // 按身份統計
      stats.byIdentity[record.identityType] = (stats.byIdentity[record.identityType] || 0) + 1;
      
      // 最近一週
      const recordDate = new Date(record.applicationDate);
      if (recordDate > oneWeekAgo) {
        stats.recent++;
      }
    });

    return stats;
  }

  /**
   * 清理資源
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
    this.cache = [];
  }
}

// 導出單例實例
export const dataManager = DataManager.getInstance();
