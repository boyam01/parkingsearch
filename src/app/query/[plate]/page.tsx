import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VehicleQueryPage } from '@/components/VehicleQueryPage';
import { VehicleAPI } from '@/lib/api';
import { validatePlate, formatPlate } from '@/lib/utils';

interface PageProps {
  params: {
    plate: string;
  };
}

// App Router: 產生靜態參數（取代 generateStaticPaths）
export async function generateStaticParams() {
  // 返回空陣列，讓所有動態路由都使用 on-demand Server Rendering
  return [];
}

// App Router: 產生頁面中繼資料
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const plate = decodeURIComponent(params.plate);
  const formattedPlate = formatPlate(plate);

  // 嘗試取得車輛資訊來產生更好的中繼資料
  try {
    const vehicle = await VehicleAPI.getVehicleByPlate(plate);
    
    if (vehicle) {
      return {
        title: `${formattedPlate} - ${vehicle.applicantName} | 車牌查詢系統`,
        description: `查詢車牌 ${formattedPlate} 的詳細資訊：申請人 ${vehicle.applicantName}，${vehicle.vehicleType}，申請日期 ${vehicle.applicationDate}。`,
        openGraph: {
          title: `車牌 ${formattedPlate} 查詢結果`,
          description: `申請人：${vehicle.applicantName} | 車型：${vehicle.vehicleType} | 身份：${vehicle.identityType}`,
          type: 'website',
        },
        robots: {
          index: false, // 考量隱私，不讓搜尋引擎索引
          follow: false,
        }
      };
    }
  } catch (error) {
    console.error('生成中繼資料時發生錯誤:', error);
  }

  return {
    title: `${formattedPlate} | 車牌查詢系統`,
    description: `查詢車牌 ${formattedPlate} 的相關資訊`,
    robots: {
      index: false,
      follow: false,
    }
  };
}

// App Router: 頁面元件（Server Component）
export default async function VehicleQueryPageRoute({ params }: PageProps) {
  const plate = decodeURIComponent(params.plate);

  // 驗證車牌格式
  if (!validatePlate(plate)) {
    notFound();
  }

  // 在伺服器端取得資料
  let vehicle = null;
  try {
    vehicle = await VehicleAPI.getVehicleByPlate(plate);
  } catch (error) {
    console.error('取得車輛資料時發生錯誤:', error);
    // 不拋出錯誤，讓元件處理空資料狀態
  }

  // 傳遞資料給客戶端元件
  return <VehicleQueryPage plate={plate} initialVehicle={vehicle} />;
}
