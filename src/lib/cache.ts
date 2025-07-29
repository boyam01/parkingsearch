import { VehicleRecord, CacheConfig } from '@/types/vehicle';

export class VehicleCache {
  private static instance: VehicleCache;
  private cache: Map<string, { data: any; timestamp: number; }>;
  private config: CacheConfig;

  private constructor() {
    this.cache = new Map();
    this.config = {
      maxAge: 24 * 60 * 60 * 1000, // 24小時
      maxSize: 1000 // 最大1000筆記錄
    };
  }

  static getInstance(): VehicleCache {
    if (!VehicleCache.instance) {
      VehicleCache.instance = new VehicleCache();
    }
    return VehicleCache.instance;
  }

  // 設定快取項目
  set(key: string, data: any): void {
    // 如果超過最大容量，移除最舊的項目
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // 同步到 localStorage
    this.saveToLocalStorage();
  }

  // 取得快取項目
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 檢查是否過期
    if (Date.now() - item.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return null;
    }

    return item.data;
  }

  // 快取所有車輛資料
  cacheVehicles(vehicles: VehicleRecord[]): void {
    this.set('all_vehicles', vehicles);
    this.set('cache_timestamp', Date.now());
  }

  // 取得快取的車輛資料
  getCachedVehicles(): VehicleRecord[] | null {
    return this.get('all_vehicles');
  }

  // 檢查快取是否有效
  isCacheValid(): boolean {
    const timestamp = this.get('cache_timestamp');
    if (!timestamp) return false;
    
    return Date.now() - timestamp < this.config.maxAge;
  }

  // 清除快取
  clear(): void {
    this.cache.clear();
    this.clearLocalStorage();
  }

  // 從 localStorage 載入快取
  loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem('vehicle_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(data);
      }
    } catch (error) {
      console.error('載入快取失敗:', error);
    }
  }

  // 儲存快取到 localStorage
  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('vehicle_cache', JSON.stringify(data));
    } catch (error) {
      console.error('儲存快取失敗:', error);
    }
  }

  // 清除 localStorage 快取
  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('vehicle_cache');
    } catch (error) {
      console.error('清除快取失敗:', error);
    }
  }

  // 取得快取統計資訊
  getStats(): { size: number; maxSize: number; maxAge: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      maxAge: this.config.maxAge
    };
  }
}

// IndexedDB 快取（用於大量資料）
export class IndexedDBCache {
  private dbName = 'VehicleDB';
  private version = 1;
  private storeName = 'vehicles';

  // 初始化 IndexedDB
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('plate', 'plate', { unique: false });
          store.createIndex('applicantName', 'applicantName', { unique: false });
        }
      };
    });
  }

  // 儲存車輛資料到 IndexedDB
  async saveVehicles(vehicles: VehicleRecord[]): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // 清空現有資料
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve(undefined);
        clearRequest.onerror = () => reject(clearRequest.error);
      });

      // 儲存新資料
      for (const vehicle of vehicles) {
        await new Promise((resolve, reject) => {
          const addRequest = store.add(vehicle);
          addRequest.onsuccess = () => resolve(undefined);
          addRequest.onerror = () => reject(addRequest.error);
        });
      }

      db.close();
    } catch (error) {
      console.error('儲存到 IndexedDB 失敗:', error);
    }
  }

  // 從 IndexedDB 載入車輛資料
  async loadVehicles(): Promise<VehicleRecord[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('從 IndexedDB 載入失敗:', error);
      return [];
    }
  }

  // 清除 IndexedDB 資料
  async clear(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.error('清除 IndexedDB 失敗:', error);
    }
  }
}
