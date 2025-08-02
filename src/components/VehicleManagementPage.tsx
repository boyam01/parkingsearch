'use client';

import React, { useState, useEffect } from 'react';
import { VehicleForm } from '@/components/VehicleForm';
import { VehicleSearchPage } from '@/components/VehicleSearchPage';
import { VehicleRecord } from '@/types/vehicle';
import { VehicleAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Car,
  Users,
  Calendar,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface VehicleManagementPageProps {
  className?: string;
}

type ViewMode = 'search' | 'add' | 'edit' | 'dashboard';

// 統計卡片組件
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend,
  className 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  trend?: string;
  className?: string;
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border-2 p-4 md:p-6 transition-all duration-200 hover:shadow-md',
      colorStyles[color],
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className="ml-4">
          <Icon className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
        </div>
      </div>
    </div>
  );
}

export function VehicleManagementPage({ className }: VehicleManagementPageProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // 統計資料
  const [stats, setStats] = useState({
    totalVehicles: 0,
    todayApplications: 0,
    pendingApprovals: 0,
    activeVisitors: 0
  });
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // 載入統計資料
  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const vehicles = await VehicleAPI.getAllVehicles();
      
      const today = new Date().toISOString().split('T')[0];
      const todayVehicles = vehicles.filter(v => 
        v.applicationDate === today || v.applicationDate === today.replace(/-/g, '/')
      );
      
      const pendingVehicles = vehicles.filter(v => 
        v.approvalStatus === 'pending' || !v.approvalStatus
      );
      
      const activeVehicles = vehicles.filter(v => 
        v.identityType === 'visitor' || v.identityType === '訪客'
      );

      setStats({
        totalVehicles: vehicles.length,
        todayApplications: todayVehicles.length,
        pendingApprovals: pendingVehicles.length,
        activeVisitors: activeVehicles.length
      });
    } catch (error) {
      console.error('載入統計資料失敗:', error);
      showNotification('error', '載入統計資料失敗');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // 顯示通知
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // 處理表單提交成功
  const handleFormSuccess = (vehicle: VehicleRecord) => {
    const isEdit = currentView === 'edit';
    showNotification('success', 
      isEdit ? `車輛 ${vehicle.plate} 資料更新成功！` 
             : `車輛 ${vehicle.plate} 新增成功！`
    );
    
    // 重新載入統計資料
    loadStats();
    
    // 切換到搜尋頁面
    setCurrentView('search');
    setSelectedVehicle(null);
  };

  // 處理車輛選擇（用於編輯）
  const handleVehicleSelect = (vehicle: VehicleRecord) => {
    setSelectedVehicle(vehicle);
    setCurrentView('edit');
  };

  // 初始化載入
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6', className)}>
      {/* 通知區域 */}
      {notification && (
        <div className={cn(
          'mb-6 p-4 rounded-lg border-l-4 transition-all duration-500',
          notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
          notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
          'bg-blue-50 border-blue-400 text-blue-700'
        )}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <FileText className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* 統計儀表板 */}
      {currentView === 'search' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">系統統計</h2>
            <button
              onClick={loadStats}
              disabled={isLoadingStats}
              className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                         border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", isLoadingStats && "animate-spin")} />
              重新整理
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="總車輛數"
              value={stats.totalVehicles}
              icon={Car}
              color="blue"
            />
            <StatCard
              title="今日申請"
              value={stats.todayApplications}
              icon={Calendar}
              color="green"
            />
            <StatCard
              title="待審核"
              value={stats.pendingApprovals}
              icon={FileText}
              color="yellow"
            />
            <StatCard
              title="訪客車輛"
              value={stats.activeVisitors}
              icon={Users}
              color="red"
            />
          </div>
        </div>
      )}

      {/* 導航標籤 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView('search')}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                currentView === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Search className="w-4 h-4 inline mr-2" />
              查詢車輛
            </button>
            <button
              onClick={() => {
                setCurrentView('add');
                setSelectedVehicle(null);
              }}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                currentView === 'add'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              新增車輛
            </button>
            {currentView === 'edit' && selectedVehicle && (
              <button
                onClick={() => setCurrentView('edit')}
                className="py-2 px-1 border-b-2 border-orange-500 text-orange-600 font-medium text-sm"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                編輯 {selectedVehicle.plate}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {currentView === 'search' && (
          <div className="p-6">
            <VehicleSearchPage
              showHeader={false}
              onVehicleSelect={handleVehicleSelect}
            />
          </div>
        )}

        {currentView === 'add' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">新增車輛記錄</h3>
              <p className="text-sm text-gray-600">請填寫完整的車輛申請資訊</p>
            </div>
            <VehicleForm
              onSubmit={handleFormSuccess}
              onCancel={() => setCurrentView('search')}
            />
          </div>
        )}

        {currentView === 'edit' && selectedVehicle && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                編輯車輛記錄 - {selectedVehicle.plate}
              </h3>
              <p className="text-sm text-gray-600">修改車輛申請資訊</p>
            </div>
            <VehicleForm
              initialData={selectedVehicle}
              isEdit={true}
              onSubmit={handleFormSuccess}
              onCancel={() => {
                setCurrentView('search');
                setSelectedVehicle(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
