/**
 * Vehicle Search Hook
 * Provides high-performance vehicle search functionality with Trie search, cache management and offline support
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VehicleRecord } from '@/types/vehicle';
import { VehicleTrie } from '@/lib/trie';
import { VehicleCache } from '@/lib/cache';
import { dataManager } from '@/lib/data-manager';

export interface UseVehicleSearchOptions {
  enableCache?: boolean;
  enableOfflineSearch?: boolean;
  debounceDelay?: number;
  maxResults?: number;
  initialQuery?: string;
}

export interface UseVehicleSearchResult {
  // Search state
  query: string;
  setQuery: (query: string) => void;
  results: VehicleRecord[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  searchTime: number;
  
  // Data state
  allVehicles: VehicleRecord[];
  isDataLoaded: boolean;
  totalRecords: number;
  
  // Cache state
  isCacheEnabled: boolean;
  cacheStats: {
    size: number;
    lastUpdate: Date | null;
    hitRate: number;
    maxSize: number;
    maxAge: number;
  };
  
  // Methods
  search: (searchQuery: string) => void;
  clearResults: () => void;
  refreshData: () => Promise<void>;
}

export function useVehicleSearch(options: UseVehicleSearchOptions = {}): UseVehicleSearchResult {
  const {
    enableCache = true,
    enableOfflineSearch = true,
    debounceDelay = 300,
    maxResults = 100,
    initialQuery = ''
  } = options;

  // Basic state
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<VehicleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [allVehicles, setAllVehicles] = useState<VehicleRecord[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTrieRef = useRef<VehicleTrie | null>(null);
  const cacheRef = useRef<VehicleCache | null>(null);

  // Initialize cache and Trie
  useEffect(() => {
    if (enableCache) {
      cacheRef.current = VehicleCache.getInstance();
    }
    searchTrieRef.current = new VehicleTrie();
  }, [enableCache]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Loading vehicle data...');
      const data = await dataManager.refreshData();
      
      setAllVehicles(data);
      setIsDataLoaded(true);

      // Build search index
      if (searchTrieRef.current) {
        console.log('Building search index...');
        const trie = new VehicleTrie();
        data.forEach(vehicle => trie.insert(vehicle));
        searchTrieRef.current = trie;
      }

      console.log(`Loaded ${data.length} vehicle records`);
      
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for data manager updates
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('Data updated, reloading...');
      loadInitialData();
    };

    const unsubscribe = dataManager.subscribe(handleDataUpdate);
    
    // Initial load
    loadInitialData();

    return unsubscribe;
  }, [loadInitialData]);

  // Search logic
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearchTime(0);
      return;
    }

    const startTime = performance.now();
    
    try {
      setIsLoading(true);
      setError(null);
      setIsError(false);

      let searchResults: VehicleRecord[] = [];

      // Use Trie search
      if (searchTrieRef.current && enableOfflineSearch) {
        console.log('Using Trie search:', searchQuery);
        searchResults = searchTrieRef.current.search(searchQuery);
      } else {
        // Fallback: simple string matching
        console.log('Using simple search:', searchQuery);
        const queryLower = searchQuery.toLowerCase();
        searchResults = allVehicles.filter(vehicle => 
          vehicle.plate.toLowerCase().includes(queryLower) ||
          vehicle.applicantName?.toLowerCase().includes(queryLower) ||
          vehicle.contactPhone?.includes(searchQuery) ||
          vehicle.department?.toLowerCase().includes(queryLower)
        );
      }

      // Limit results
      if (maxResults > 0) {
        searchResults = searchResults.slice(0, maxResults);
      }

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setResults(searchResults);
      setSearchTime(duration);
      
      console.log(`Search completed: ${searchResults.length} results in ${duration}ms`);

      // Cache search results
      if (enableCache && cacheRef.current) {
        cacheRef.current.set(`search:${searchQuery}`, {
          results: searchResults,
          timestamp: Date.now(),
          searchTime: duration
        });
      }

    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setIsError(true);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [allVehicles, enableOfflineSearch, enableCache, maxResults]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceDelay);
  }, [performSearch, debounceDelay]);

  // Search method
  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (debounceDelay > 0) {
      debouncedSearch(searchQuery);
    } else {
      performSearch(searchQuery);
    }
  }, [debouncedSearch, performSearch, debounceDelay]);

  // Set query and trigger search
  const handleSetQuery = useCallback((newQuery: string) => {
    search(newQuery);
  }, [search]);

  // Clear search results
  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearchTime(0);
    setError(null);
    setIsError(false);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Refresh data - 簡化版本，直接調用 API 強制刷新
  const refreshData = useCallback(async () => {
    console.log('🔄 用戶手動重新整理，強制從 RAGIC 重新讀取...');
    
    try {
      setIsLoading(true);
      setError(null);
      setIsError(false);

      // 直接調用 API 強制刷新，不依賴 data-manager 的複雜邏輯
      const { VehicleAPI } = await import('@/lib/api');
      const data = await VehicleAPI.getAllVehicles({ forceRefresh: true });
      
      console.log(`📡 從 RAGIC 獲取到 ${data.length} 筆資料`);
      
      setAllVehicles(data);
      setIsDataLoaded(true);

      // 重建搜尋索引
      if (searchTrieRef.current) {
        console.log('🌲 重建搜尋索引...');
        const trie = new VehicleTrie();
        data.forEach(vehicle => trie.insert(vehicle));
        searchTrieRef.current = trie;
      }

      // 如果有查詢，重新搜尋
      if (query.trim()) {
        performSearch(query);
      }

      console.log(`✅ 手動重整完成！已載入 ${data.length} 筆最新資料`);
      
    } catch (err) {
      console.error('❌ 手動重整失敗:', err);
      setError(err instanceof Error ? err.message : '重整資料失敗');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [query, performSearch]);

  // Cache stats
  const cacheStats = useMemo(() => {
    if (!enableCache || !cacheRef.current) {
      return {
        size: 0,
        lastUpdate: null,
        hitRate: 0,
        maxSize: 1000,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      };
    }

    const stats = cacheRef.current.getStats();
    return {
      size: stats.size,
      lastUpdate: new Date(), // Simplified version
      hitRate: 0, // Simplified version
      maxSize: stats.maxSize,
      maxAge: stats.maxAge
    };
  }, [enableCache, results]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Search state
    query,
    setQuery: handleSetQuery,
    results,
    isLoading,
    isError,
    error,
    searchTime,
    
    // Data state
    allVehicles,
    isDataLoaded,
    totalRecords: allVehicles.length,
    
    // Cache state
    isCacheEnabled: enableCache,
    cacheStats,
    
    // Methods
    search,
    clearResults,
    refreshData
  };
}