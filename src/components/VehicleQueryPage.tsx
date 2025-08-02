'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Printer, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { VehicleCard } from '@/components/VehicleCard';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import { VehicleRecord } from '@/types/vehicle';
import { cn, formatPlate } from '@/lib/utils';

export interface VehicleQueryPageProps {
  plate: string;
  initialVehicle?: VehicleRecord | null;
  className?: string;
}

export function VehicleQueryPage({
  plate,
  initialVehicle,
  className
}: VehicleQueryPageProps) {
  const router = useRouter();
  const { allVehicles, isLoading, isError, error, refreshData } = useVehicleSearch();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // 從所有車輛中找到對應車牌的車輛
  const vehicle = allVehicles.find(v => v.plate === plate) || initialVehicle;
  const currentVehicle = vehicle;
  const formattedPlate = formatPlate(plate);

  // 設定頁面標題
  useEffect(() => {
    if (currentVehicle) {
      document.title = `${formattedPlate} - ${currentVehicle.applicantName} | 車牌查詢系統`;
    } else {
      document.title = `${formattedPlate} | 車牌查詢系統`;
    }
  }, [currentVehicle, formattedPlate]);

  // 分享功能
  const handleShare = async () => {
    const url = window.location.href;
    const title = `車牌 ${formattedPlate} 查詢結果`;
    const text = currentVehicle 
      ? `申請人：${currentVehicle.applicantName}，車型：${currentVehicle.vehicleType}`
      : `查詢車牌 ${formattedPlate}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.log('分享取消:', err);
      }
    } else {
      // 備案：複製到剪貼簿
      try {
        await navigator.clipboard.writeText(url);
        alert('網址已複製到剪貼簿');
      } catch (err) {
        console.error('複製失敗:', err);
      }
    }
    setShowShareMenu(false);
  };

  // 列印功能
  const handlePrint = () => {
    window.print();
  };

  // 返回搜尋頁面
  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (isLoading && !currentVehicle) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto', className)}>
        <VehicleQueryPageSkeleton />
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* 導航列 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回搜尋</span>
        </button>

        <div className="flex space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              title="分享"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* 分享選單 */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleShare}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg"
                >
                  分享連結
                </button>
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    handlePrint();
                  }}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-lg"
                >
                  列印頁面
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            title="列印"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 點擊其他地方關閉分享選單 */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowShareMenu(false)}
        />
      )}

      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          車牌查詢結果
        </h1>
        <p className="text-xl text-gray-600">
          搜尋車牌：<span className="font-mono font-bold">{formattedPlate}</span>
        </p>
      </div>

      {/* 錯誤狀態 */}
      {isError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">查詢失敗</h3>
              <p className="text-red-700 mb-4">
                {error || '無法載入車輛資訊，請稍後再試。'}
              </p>
              <button
                onClick={refreshData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                重新查詢
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查詢結果 */}
      {currentVehicle ? (
        <div className="space-y-6">
          {/* 成功提示 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">找到車輛記錄</span>
            </div>
          </div>

          {/* 車輛詳細資訊 */}
          <VehicleCard
            vehicle={currentVehicle}
            showDetails={true}
            className="border-2 border-blue-200 shadow-lg"
          />

          {/* 操作建議 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">相關操作</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• 如需更新車輛資訊，請聯絡管理員</p>
              <p>• 如有疑問，可致電申請人確認</p>
              <p>• 此查詢結果僅供內部使用</p>
            </div>
          </div>
        </div>
      ) : !isLoading && !isError && (
        /* 未找到結果 */
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <X className="w-full h-full" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            未找到車輛記錄
          </h2>
          <p className="text-gray-600 mb-6">
            車牌 <span className="font-mono font-bold">{formattedPlate}</span> 
            的記錄不存在或已被刪除
          </p>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-yellow-900 mb-2">可能的原因：</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• 車牌號碼輸入錯誤</li>
                <li>• 該車輛尚未申請登記</li>
                <li>• 記錄已被管理員刪除</li>
                <li>• 系統資料尚未同步</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                重新搜尋
              </Link>
              <button
                onClick={refreshData}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                重新查詢
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 載入中且有快取資料時的提示 */}
      {isLoading && currentVehicle && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4 animate-spin" />
          <span>正在更新資料...</span>
        </div>
      )}
    </div>
  );
}

// 骨架載入元件
function VehicleQueryPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* 導航列 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="flex space-x-2">
          <div className="w-9 h-9 bg-gray-300 rounded-lg"></div>
          <div className="w-9 h-9 bg-gray-300 rounded-lg"></div>
        </div>
      </div>

      {/* 標題 */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-64"></div>
      </div>

      {/* 車輛卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div>
              <div className="h-6 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
