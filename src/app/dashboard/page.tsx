'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Car, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { Navigation, PageHeader } from '@/components/Navigation';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import { VehicleRecord, VEHICLE_TYPES, IDENTITY_TYPES, APPROVAL_STATUS } from '@/types/vehicle';
import { cn, formatDate, getStatusColor } from '@/lib/utils';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const { allVehicles, isLoading, refreshData } = useVehicleSearch();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // 計算統計數據
  const stats = React.useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        cutoffDate.setFullYear(2000);
        break;
    }

    const filteredVehicles = allVehicles.filter(vehicle => 
      new Date(vehicle.applicationDate) >= cutoffDate
    );

    const totalVehicles = filteredVehicles.length;
    const approvedCount = filteredVehicles.filter(v => v.approvalStatus === 'approved').length;
    const pendingCount = filteredVehicles.filter(v => v.approvalStatus === 'pending').length;
    const rejectedCount = filteredVehicles.filter(v => v.approvalStatus === 'rejected').length;

    // 車型統計
    const vehicleTypeStats = Object.entries(VEHICLE_TYPES).map(([key, { label }]) => ({
      label,
      value: filteredVehicles.filter(v => v.vehicleType === key).length,
      color: key === 'sedan' ? '#3B82F6' : key === 'suv' ? '#10B981' : key === 'motorcycle' ? '#F59E0B' : '#6B7280'
    }));

    // 身份類型統計
    const identityTypeStats = Object.entries(IDENTITY_TYPES).map(([key, { label }]) => ({
      label,
      value: filteredVehicles.filter(v => v.identityType === key).length,
      color: key === 'employee' ? '#3B82F6' : key === 'executive' ? '#8B5CF6' : key === 'affiliate' ? '#F59E0B' : '#6B7280'
    }));

    // 審核狀態統計
    const statusStats = Object.entries(APPROVAL_STATUS).map(([key, { label }]) => ({
      label,
      value: filteredVehicles.filter(v => v.approvalStatus === key).length,
      color: key === 'approved' ? '#10B981' : key === 'pending' ? '#F59E0B' : '#EF4444'
    }));

    // 每日申請統計（最近 7 天）
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = allVehicles.filter(v => v.applicationDate === dateStr).length;
      dailyStats.push({
        label: date.getDate().toString(),
        value: count,
        color: '#3B82F6'
      });
    }

    return {
      totalVehicles,
      approvedCount,
      pendingCount,
      rejectedCount,
      approvalRate: totalVehicles > 0 ? Math.round((approvedCount / totalVehicles) * 100) : 0,
      vehicleTypeStats,
      identityTypeStats,
      statusStats,
      dailyStats
    };
  }, [allVehicles, selectedPeriod]);

  const statCards: StatCard[] = [
    {
      title: '總車輛數',
      value: stats.totalVehicles,
      icon: Car,
      color: 'blue'
    },
    {
      title: '已核准',
      value: stats.approvedCount,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: '待審核',
      value: stats.pendingCount,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: '已拒絕',
      value: stats.rejectedCount,
      icon: XCircle,
      color: 'red'
    },
    {
      title: '核准率',
      value: `${stats.approvalRate}%`,
      icon: TrendingUp,
      color: stats.approvalRate >= 80 ? 'green' : stats.approvalRate >= 60 ? 'yellow' : 'red'
    },
    {
      title: '今日申請',
      value: allVehicles.filter(v => v.applicationDate === new Date().toISOString().split('T')[0]).length,
      icon: Calendar,
      color: 'blue'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* 頁面標題 */}
        <PageHeader
          title="車輛管理儀錶板"
          description="總覽車輛申請狀況與統計分析"
          breadcrumbs={[
            { href: '/', label: '首頁' },
            { label: '儀錶板' }
          ]}
          actions={
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="7d">最近 7 天</option>
                <option value="30d">最近 30 天</option>
                <option value="90d">最近 90 天</option>
                <option value="all">全部期間</option>
              </select>

              <button
                onClick={refreshData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
                <span>重新整理</span>
              </button>
            </div>
          }
        />

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statCards.map((card, index) => {
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-800',
              green: 'bg-green-50 border-green-200 text-green-800',
              yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
              red: 'bg-red-50 border-red-200 text-red-800',
              gray: 'bg-gray-50 border-gray-200 text-gray-800'
            };

            const iconColorClasses = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              yellow: 'text-yellow-600',
              red: 'text-red-600',
              gray: 'text-gray-600'
            };

            return (
              <div
                key={index}
                className={cn(
                  'bg-white border rounded-lg p-6',
                  colorClasses[card.color]
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {card.value}
                    </p>
                  </div>
                  <card.icon className={cn('w-8 h-8', iconColorClasses[card.color])} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 圖表區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 審核狀態圓餅圖 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              審核狀態分布
            </h3>
            <div className="space-y-3">
              {stats.statusStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.value}</span>
                    <span className="text-xs text-gray-500">
                      ({stats.totalVehicles > 0 ? Math.round((item.value / stats.totalVehicles) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 車型統計長條圖 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              車型分布
            </h3>
            <div className="space-y-3">
              {stats.vehicleTypeStats.map((item, index) => {
                const percentage = stats.totalVehicles > 0 ? (item.value / stats.totalVehicles) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.value} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 身份類型與最近申請趨勢 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 身份類型統計 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              身份類型分布
            </h3>
            <div className="space-y-3">
              {stats.identityTypeStats.map((item, index) => {
                const percentage = stats.totalVehicles > 0 ? (item.value / stats.totalVehicles) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 最近 7 天申請趨勢 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              最近 7 天申請趨勢
            </h3>
            <div className="flex items-end space-x-2 h-32">
              {stats.dailyStats.map((item, index) => {
                const maxValue = Math.max(...stats.dailyStats.map(d => d.value), 1);
                const height = (item.value / maxValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                    />
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      <div>{item.label}</div>
                      <div className="font-semibold">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            快速操作
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/add"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">新增車輛</div>
                <div className="text-sm text-gray-600">申請新的車輛記錄</div>
              </div>
            </Link>

            <Link
              href="/manage"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">車輛管理</div>
                <div className="text-sm text-gray-600">編輯、刪除車輛記錄</div>
              </div>
            </Link>

            <button
              onClick={() => {
                // 匯出所有資料
                console.log('匯出所有資料');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">匯出報表</div>
                <div className="text-sm text-gray-600">下載統計報表</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
