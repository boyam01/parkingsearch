'use client';

import { useEffect } from 'react';
import { VehicleAPI } from '@/lib/api';

// 快取預熱組件
export function CachePreloader() {
  useEffect(() => {
    // 在頁面載入後 2 秒預熱快取
    const preloadCache = async () => {
      try {
        console.log('🚀 開始快取預熱...');
        const startTime = performance.now();
        
        // 在背景預先載入資料
        await VehicleAPI.getAllVehicles();
        
        const endTime = performance.now();
        console.log(`✅ 快取預熱完成，耗時: ${(endTime - startTime).toFixed(0)}ms`);
      } catch (error) {
        console.warn('快取預熱失敗:', error);
      }
    };

    const timer = setTimeout(preloadCache, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null; // 這個組件不渲染任何內容
}

// 智能重新整理Hook
export function useSmartRefresh() {
  useEffect(() => {
    // 監聽頁面可見性變化，當頁面重新可見時自動重新整理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 頁面重新可見時檢查是否需要重新整理資料
        const lastRefresh = localStorage.getItem('last_data_refresh');
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (!lastRefresh || (now - parseInt(lastRefresh)) > fiveMinutes) {
          console.log('📱 頁面重新可見，執行智能重新整理');
          // 觸發自定義事件通知需要重新整理
          window.dispatchEvent(new CustomEvent('smart-refresh'));
          localStorage.setItem('last_data_refresh', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return null;
}
