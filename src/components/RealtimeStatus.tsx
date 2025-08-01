/**
 * 即時資料狀態組件
 */
'use client';

import { useRealtimeData } from '@/hooks/useVehicleData';
import { useState, useEffect } from 'react';

export default function RealtimeStatus() {
  const { isOnline, lastSync, syncStatus } = useRealtimeData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatLastSync = (date: Date | null) => {
    if (!date) return '未同步';
    
    const now = currentTime;
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds} 秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`;
    return date.toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (syncStatus === 'syncing') return 'text-yellow-500';
    if (syncStatus === 'error') return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '🔴';
    if (syncStatus === 'syncing') return '🟡';
    if (syncStatus === 'error') return '🔴';
    return '🟢';
  };

  const getStatusText = () => {
    if (!isOnline) return '離線';
    if (syncStatus === 'syncing') return '同步中';
    if (syncStatus === 'error') return '同步錯誤';
    return '已連線';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">即時狀態</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs">{getStatusIcon()}</span>
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>最後同步:</span>
            <span className="font-mono">{formatLastSync(lastSync)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>現在時間:</span>
            <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 連線狀態指示器 */}
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs text-gray-600">
              {isOnline ? 'Ragic 資料庫已連線' : '網路連線中斷'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
