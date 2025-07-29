'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { VehicleRecord, SearchResult } from '@/types/vehicle';
import { VehicleTrie } from '@/lib/trie';
import { VehicleCache, IndexedDBCache } from '@/lib/cache';
import { VehicleAPI } from '@/lib/api';
import { debounce, sortVehicleRecords } from '@/lib/utils';

export interface UseVehicleSearchOptions {
  enableCache?: boolean;
  enableOfflineSearch?: boolean;
  debounceDelay?: number;
  maxResults?: number;
}

export interface UseVehicleSearchReturn {
  // 搜尋狀態
  query: string;
  setQuery: (query: string) => void;
  results: VehicleRecord[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  searchTime: number;

  // 資料狀態
  allVehicles: VehicleRecord[];
  isDataLoaded: boolean;
  isCacheEnabled: boolean;

  // 搜尋控制
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  refreshData: () => Promise<void>;

  // 統計資訊
  totalRecords: number;
  cacheStats: {
    size: number;
    maxSize: number;
    maxAge: number;
  };
}

export function useVehicleSearch(options: UseVehicleSearchOptions = {}): UseVehicleSearchReturn {
  const {
    enableCache = true,
    enableOfflineSearch = true,
    debounceDelay = 300,
    maxResults = 50
  } = options;

  // 狀態管理
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VehicleRecord[]>([]);
  const [allVehicles, setAllVehicles] = useState<VehicleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 初始化搜尋引擎和快取
  const trie = useMemo(() => new VehicleTrie(), []);
  const cache = useMemo(() => VehicleCache.getInstance(), []);
  const indexedCache = useMemo(() => new IndexedDBCache(), []);

  // 載入車輛資料
  const loadVehicleData = useCallback(async () => {
    if (isDataLoaded) return;

    setIsLoading(true);
    setError(null);

    try {
      let vehicles: VehicleRecord[] = [];

      // 嘗試從快取載入
      if (enableCache) {
        const cachedVehicles = cache.getCachedVehicles();
        if (cachedVehicles && cache.isCacheValid()) {
          vehicles = cachedVehicles;
        } else if (enableOfflineSearch) {
          vehicles = await indexedCache.loadVehicles();
        }
      }

      // 如果快取沒有資料或過期，從 API 載入
      if (vehicles.length === 0) {
        vehicles = await VehicleAPI.getAllVehicles();
        
        // 儲存到快取
        if (enableCache && vehicles.length > 0) {
          cache.cacheVehicles(vehicles);
          if (enableOfflineSearch) {
            await indexedCache.saveVehicles(vehicles);
          }
        }
      }

      // 建立搜尋索引
      trie.clear();
      vehicles.forEach(vehicle => trie.insert(vehicle));

      setAllVehicles(vehicles);
      setIsDataLoaded(true);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : '載入資料失敗');
    } finally {
      setIsLoading(false);
    }
  }, [enableCache, enableOfflineSearch, cache, indexedCache, trie, isDataLoaded]);

  // 執行搜尋
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchTime(0);
      return;
    }

    const startTime = performance.now();
    setIsLoading(true);

    try {
      let searchResults: VehicleRecord[] = [];

      if (isDataLoaded && allVehicles.length > 0) {
        // 本地搜尋
        if (searchQuery.length <= 3) {
          // 短查詢使用字首樹精確搜尋
          searchResults = trie.search(searchQuery);
        } else {
          // 長查詢使用模糊搜尋
          searchResults = trie.fuzzySearch(searchQuery);
        }
      } else {
        // API 搜尋
        searchResults = await VehicleAPI.searchVehicles(searchQuery);
      }

      // 排序結果
      searchResults = sortVehicleRecords(searchResults, 'relevance', 'desc', searchQuery);

      // 限制結果數量
      if (searchResults.length > maxResults) {
        searchResults = searchResults.slice(0, maxResults);
      }

      setResults(searchResults);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : '搜尋失敗');
      setResults([]);
    } finally {
      const endTime = performance.now();
      setSearchTime(endTime - startTime);
      setIsLoading(false);
    }
  }, [isDataLoaded, allVehicles, trie, maxResults]);

  // 防抖搜尋
  const debouncedSearch = useMemo(
    () => debounce(performSearch, debounceDelay),
    [performSearch, debounceDelay]
  );

  // 搜尋函式
  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim()) {
      await debouncedSearch(searchQuery);
    } else {
      setResults([]);
      setSearchTime(0);
    }
  }, [debouncedSearch]);

  // 清除搜尋結果
  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearchTime(0);
    setError(null);
    setIsError(false);
  }, []);

  // 重新整理資料
  const refreshData = useCallback(async () => {
    setIsDataLoaded(false);
    if (enableCache) {
      cache.clear();
      if (enableOfflineSearch) {
        await indexedCache.clear();
      }
    }
    await loadVehicleData();
  }, [enableCache, enableOfflineSearch, cache, indexedCache, loadVehicleData]);

  // 當查詢字串改變時執行搜尋
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  // 初始化載入資料
  useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  // 載入快取配置
  useEffect(() => {
    if (enableCache) {
      cache.loadFromLocalStorage();
    }
  }, [enableCache, cache]);

  return {
    // 搜尋狀態
    query,
    setQuery,
    results,
    isLoading,
    isError,
    error,
    searchTime,

    // 資料狀態
    allVehicles,
    isDataLoaded,
    isCacheEnabled: enableCache,

    // 搜尋控制
    search,
    clearResults,
    refreshData,

    // 統計資訊
    totalRecords: allVehicles.length,
    cacheStats: cache.getStats()
  };
}

// Hook for single vehicle query
export function useVehicleQuery(plate?: string) {
  const [vehicle, setVehicle] = useState<VehicleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async (plateNumber: string) => {
    if (!plateNumber) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await VehicleAPI.getVehicleByPlate(plateNumber);
      setVehicle(result);
      setIsError(false);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : '查詢失敗');
      setVehicle(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (plate) {
      fetchVehicle(plate);
    }
  }, [plate, fetchVehicle]);

  return {
    vehicle,
    isLoading,
    isError,
    error,
    refetch: () => plate && fetchVehicle(plate)
  };
}
