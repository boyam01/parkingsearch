'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchBox, SearchStats } from '@/components/SearchBox';
import { VehicleGrid } from '@/components/VehicleCard';
import { useVehicleSearch } from '../hooks/useVehicleSearch';
import { VehicleRecord } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { RefreshCw, Download, Settings, Info, Plus } from 'lucide-react';

export interface VehicleSearchPageProps {
  className?: string;
  onVehicleSelect?: (vehicle: VehicleRecord) => void;
  initialQuery?: string;
  showHeader?: boolean;
  showStats?: boolean;
  showActions?: boolean;
}

export function VehicleSearchPage({
  className,
  onVehicleSelect,
  initialQuery = '',
  showHeader = true,
  showStats = true,
  showActions = true
}: VehicleSearchPageProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    isError,
    error,
    searchTime,
    allVehicles,
    isDataLoaded,
    isCacheEnabled,
    search,
    clearResults,
    refreshData,
    totalRecords,
    cacheStats
  } = useVehicleSearch({
    enableCache: true,
    enableOfflineSearch: true,
    debounceDelay: 150, // 減少延遲時間，讓搜尋更即時
    maxResults: 50
  });

  const [showCacheInfo, setShowCacheInfo] = useState(false);

  // 設定初始查詢
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query, setQuery]);

  // 處理車輛選擇
  const handleVehicleSelect = (vehicle: VehicleRecord) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  };

  // 匯出搜尋結果
  const handleExport = () => {
    const dataToExport = query ? results : allVehicles;
    if (dataToExport.length === 0) return;

    // 這裡可以實作 CSV 匯出功能
    console.log('匯出車輛資料:', dataToExport);
  };

  // 重新整理資料
  const handleRefresh = async () => {
    try {
      console.log('🔄 用戶點擊重整按鈕');
      await refreshData();
      console.log('✅ 重整完成');
      
      // 可以在這裡添加成功提示
      // 例如：showToast('資料已重新整理完成')
    } catch (error) {
      console.error('❌ 重整失敗:', error);
      // 這裡可以添加錯誤提示
      // 例如：showToast('重整失敗，請稍後再試', 'error')
    }
  };

  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8', className)}>
      {/* 頁面標題 */}
      {showHeader && (
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            車牌查詢系統
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            快速查詢車輛資訊，支援<strong>子序列模糊搜尋</strong>：輸入 "BC" 即可找到 "ABC-4567" 等記錄
          </p>
        </div>
      )}

      {/* 搜尋區域 */}
      <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
        {/* 搜尋框 */}
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <SearchBox
              value={query}
              onChange={setQuery}
              onSearch={search}
              placeholder="輸入車牌號碼或申請人姓名..."
              isLoading={isLoading}
              autoFocus
              size="lg"
            />
            {/* 搜尋提示和狀態 */}
            <div className="mt-2 text-xs md:text-sm text-gray-500">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0">
                <div>
                  💡 <strong>智能搜尋：</strong>
                  支援車牌、姓名、電話、車型等多欄位查詢
                </div>
                {query && (
                  <div className="text-blue-600 font-medium">
                    {isLoading && '🔍 搜尋中...'}
                    {!isLoading && results.length > 0 && `✅ 找到 ${results.length} 筆匹配記錄`}
                    {!isLoading && results.length === 0 && '❌ 沒有找到匹配記錄'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          {showActions && (
            <div className="flex flex-wrap gap-2 md:flex-nowrap md:space-x-2">
              <Link
                href="/add"
                className={cn(
                  'flex-1 md:flex-none px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg',
                  'hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors text-sm'
                )}
                title="新增車牌"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span>新增車牌</span>
              </Link>

              <Link
                href="/manage"
                className={cn(
                  'flex-1 md:flex-none px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg',
                  'hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors text-sm'
                )}
                title="車輛管理"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                <span>管理</span>
              </Link>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={cn(
                  'flex-1 md:flex-none px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg',
                  'hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center space-x-2 transition-colors text-sm'
                )}
                title="重新整理資料"
              >
                <RefreshCw className={cn('w-4 h-4 md:w-5 md:h-5', isLoading && 'animate-spin')} />
                <span className="md:inline">重整</span>
              </button>

              <button
                onClick={handleExport}
                disabled={isLoading || (query ? results.length === 0 : totalRecords === 0)}
                className={cn(
                  'flex-1 md:flex-none px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg',
                  'hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center space-x-2 transition-colors text-sm'
                )}
                title="匯出資料"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                <span className="md:inline">匯出</span>
              </button>

              <button
                onClick={() => setShowCacheInfo(!showCacheInfo)}
                className={cn(
                  'w-full md:w-auto px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg',
                  'hover:bg-gray-700 flex items-center justify-center space-x-2 transition-colors text-sm'
                )}
                title="系統資訊"
              >
                <Info className="w-4 h-4 md:w-5 md:h-5" />
                <span>系統資訊</span>
              </button>
            </div>
          )}
        </div>

        {/* 搜尋統計 */}
        {showStats && (
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <SearchStats
              totalResults={query ? results.length : totalRecords}
              searchTime={searchTime}
              query={query}
            />

            {/* 系統狀態 */}
            <div className="flex flex-wrap items-center gap-2 md:space-x-4 text-xs md:text-sm text-gray-500">
              <span>
                總計 {totalRecords} 筆記錄
              </span>
              {isCacheEnabled && (
                <span className="flex items-center space-x-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isDataLoaded ? 'bg-green-500' : 'bg-yellow-500'
                  )} />
                  <span>{isDataLoaded ? '已載入' : '載入中'}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* 快取資訊面板 */}
        {showCacheInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">系統資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>快取狀態：</strong>
                    <div className="text-blue-700">
                      {cacheStats.size} / {cacheStats.maxSize} 項目
                    </div>
                  </div>
                  <div>
                    <strong>快取時效：</strong>
                    <div className="text-blue-700">
                      {Math.round(cacheStats.maxAge / (1000 * 60 * 60))} 小時
                    </div>
                  </div>
                  <div>
                    <strong>離線支援：</strong>
                    <div className="text-blue-700">
                      {typeof window !== 'undefined' && 'indexedDB' in window ? '已啟用' : '不支援'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 錯誤訊息 */}
      {isError && error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">載入失敗</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                重試
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 搜尋結果 */}
      <VehicleGrid
        vehicles={query ? results : allVehicles}
        onVehicleClick={handleVehicleSelect}
        isLoading={isLoading && !isDataLoaded}
        emptyMessage={
          query 
            ? `沒有找到包含「${query}」的車輛記錄`
            : '暫無車輛記錄'
        }
        highlight={query}
        className="mb-8"
      />

      {/* 載入更多（如果需要分頁） */}
      {query && results.length >= 50 && (
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            顯示前 50 筆結果，請使用更具體的搜尋條件以獲得更精確的結果
          </p>
        </div>
      )}
    </div>
  );
}
