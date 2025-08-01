'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, AlertTriangle, CheckCircle, XCircle, 
  Settings, RefreshCw, TrendingUp, Car, Users
} from 'lucide-react';
import { QuotaStatus, VehicleQuotaConfig } from '@/types/vehicle';
import { cn } from '@/lib/utils';

interface QuotaDisplayProps {
  className?: string;
  showConfig?: boolean;
}

export default function QuotaDisplay({ className, showConfig = false }: QuotaDisplayProps) {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [quotaConfig, setQuotaConfig] = useState<VehicleQuotaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // 載入配額資料
  const loadQuotaData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statusResponse, configResponse] = await Promise.all([
        fetch('/api/quota?action=status'),
        fetch('/api/quota?action=config')
      ]);

      if (!statusResponse.ok || !configResponse.ok) {
        throw new Error('無法載入配額資料');
      }

      const statusData = await statusResponse.json();
      const configData = await configResponse.json();

      if (statusData.success) {
        setQuotaStatus(statusData.data);
      }

      if (configData.success) {
        setQuotaConfig(configData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '載入配額資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotaData();
  }, []);

  // 取得使用率顏色
  const getUsageColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-100';
    if (rate >= 80) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  // 取得狀態圖示
  const getStatusIcon = (rate: number) => {
    if (rate >= 90) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (rate >= 80) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-lg shadow p-6", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("bg-white rounded-lg shadow p-6", className)}>
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadQuotaData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  if (!quotaStatus || !quotaConfig) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 總覽卡片 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            配額總覽
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={loadQuotaData}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="重新整理"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {showConfig && (
              <button
                onClick={() => setShowConfigModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="配額設定"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 總配額狀態 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {quotaStatus.totalUsed} / {quotaConfig.totalQuota}
            </div>
            <div className="text-sm text-gray-600">總使用量</div>
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
              getUsageColor(quotaStatus.usageRate)
            )}>
              {quotaStatus.usageRate.toFixed(1)}%
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {quotaStatus.totalAvailable}
            </div>
            <div className="text-sm text-gray-600">可用配額</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {quotaStatus.dailyApplications}
            </div>
            <div className="text-sm text-gray-600">今日申請</div>
            <div className="text-xs text-gray-500">
              (限制: {quotaConfig.dailyApplicationLimit})
            </div>
          </div>
        </div>

        {/* 進度條 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>總使用率</span>
            <span>{quotaStatus.usageRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                quotaStatus.usageRate >= 90 ? "bg-red-500" :
                quotaStatus.usageRate >= 80 ? "bg-yellow-500" :
                quotaStatus.usageRate >= 60 ? "bg-blue-500" : "bg-green-500"
              )}
              style={{ width: `${Math.min(quotaStatus.usageRate, 100)}%` }}
            />
          </div>
        </div>

        {/* 警告訊息 */}
        {quotaStatus.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">配額警告</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {quotaStatus.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 車輛類型配額 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          車輛類型配額
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(quotaStatus.byType).map(([type, data]) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {type === 'car' ? '汽車' : 
                   type === 'motorcycle' ? '機車' : '卡車'}
                </span>
                {getStatusIcon(data.rate)}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {data.used} / {quotaConfig.quotaByType[type as keyof typeof quotaConfig.quotaByType]} 使用中
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    data.rate >= 90 ? "bg-red-500" :
                    data.rate >= 80 ? "bg-yellow-500" :
                    data.rate >= 60 ? "bg-blue-500" : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(data.rate, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                使用率: {data.rate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 身份類型配額 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          身份類型配額
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(quotaStatus.byIdentity).map(([identity, data]) => (
            <div key={identity} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 text-sm">
                  {identity === 'staff' ? '員工' :
                   identity === 'visitor' ? '訪客' :
                   identity === 'contractor' ? '承包商' :
                   identity === 'guest' ? '賓客' : 'VIP'}
                </span>
                {getStatusIcon(data.rate)}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {data.used} / {quotaConfig.quotaByIdentity[identity as keyof typeof quotaConfig.quotaByIdentity]}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    data.rate >= 90 ? "bg-red-500" :
                    data.rate >= 80 ? "bg-yellow-500" :
                    data.rate >= 60 ? "bg-blue-500" : "bg-green-500"
                  )}
                  style={{ width: `${Math.min(data.rate, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {data.rate.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 配額已滿狀態 */}
      {quotaStatus.isOverLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-red-800">配額已達上限</h4>
              <p className="text-red-700 text-sm mt-1">
                目前無法接受新的車輛申請，請等待配額釋出或聯繫管理員調整配額設定。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 配額設定模態框 */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                配額設定
              </h3>
              
              {/* 這裡可以加入配額設定表單 */}
              <div className="space-y-4">
                <p className="text-gray-600">
                  配額設定功能正在開發中...
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
