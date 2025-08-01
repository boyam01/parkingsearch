/**
 * 車輛資料管理 Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { VehicleRecord } from '@/types/vehicle';
import { dataManager } from '@/lib/data-manager';

export interface UseVehicleDataResult {
  data: VehicleRecord[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  
  // 操作方法
  refresh: () => Promise<void>;
  addRecord: (vehicle: Partial<VehicleRecord>) => Promise<VehicleRecord>;
  updateRecord: (id: string, vehicle: Partial<VehicleRecord>) => Promise<VehicleRecord>;
  deleteRecord: (id: string) => Promise<void>;
  searchRecords: (query: string) => Promise<VehicleRecord[]>;
  getRecordByPlate: (plate: string) => Promise<VehicleRecord | null>;
  
  // 統計資料
  statistics: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byIdentity: Record<string, number>;
    recent: number;
  };
}

export function useVehicleData(): UseVehicleDataResult {
  const [data, setData] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 更新本地狀態
  const updateLocalState = useCallback(() => {
    const cachedData = dataManager.getCachedData();
    setData(cachedData);
    setLastUpdate(new Date());
    setError(null);
  }, []);

  // 刷新資料
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await dataManager.refreshData(true);
      updateLocalState();
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取資料失敗');
    } finally {
      setLoading(false);
    }
  }, [updateLocalState]);

  // 新增記錄
  const addRecord = useCallback(async (vehicle: Partial<VehicleRecord>) => {
    try {
      setError(null);
      const newRecord = await dataManager.addRecord(vehicle);
      updateLocalState();
      return newRecord;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '新增記錄失敗';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [updateLocalState]);

  // 更新記錄
  const updateRecord = useCallback(async (id: string, vehicle: Partial<VehicleRecord>) => {
    try {
      setError(null);
      const updatedRecord = await dataManager.updateRecord(id, vehicle);
      updateLocalState();
      return updatedRecord;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '更新記錄失敗';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [updateLocalState]);

  // 刪除記錄
  const deleteRecord = useCallback(async (id: string) => {
    try {
      setError(null);
      await dataManager.deleteRecord(id);
      updateLocalState();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '刪除記錄失敗';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [updateLocalState]);

  // 搜尋記錄
  const searchRecords = useCallback(async (query: string) => {
    try {
      setError(null);
      return await dataManager.searchRecords(query);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '搜尋失敗';
      setError(errorMsg);
      return [];
    }
  }, []);

  // 根據車牌查詢
  const getRecordByPlate = useCallback(async (plate: string) => {
    try {
      setError(null);
      return await dataManager.getRecordByPlate(plate);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '查詢失敗';
      setError(errorMsg);
      return null;
    }
  }, []);

  // 計算統計資料
  const statistics = dataManager.getStatistics();

  // 初始化和監聽資料變化
  useEffect(() => {
    // 訂閱資料變化
    const unsubscribe = dataManager.subscribe(() => {
      updateLocalState();
    });

    // 初始載入
    refresh();

    return unsubscribe;
  }, [refresh, updateLocalState]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    addRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    getRecordByPlate,
    statistics
  };
}

/**
 * 即時資料狀態 Hook
 */
export function useRealtimeData() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 監聽資料同步狀態
    const unsubscribe = dataManager.subscribe(() => {
      setLastSync(new Date());
      setSyncStatus('idle');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    lastSync,
    syncStatus,
    setSyncStatus
  };
}
