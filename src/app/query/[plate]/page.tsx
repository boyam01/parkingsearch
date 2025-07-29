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

// 產生頁面中繼資料
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

// 靜態路徑產生（用於預渲染常用車牌）
export async function generateStaticPaths() {
  // 在生產環境中，可以預渲染一些常用的車牌
  // 這裡暫時返回空陣列，讓所有路徑都使用 ISR
  return {
    paths: [],
    fallback: 'blocking' // 使用 ISR (Incremental Static Regeneration)
  };
}

// 靜態屬性產生
export async function generateStaticProps({ params }: PageProps) {
  const plate = decodeURIComponent(params.plate);

  // 驗證車牌格式
  if (!validatePlate(plate)) {
    return {
      notFound: true,
    };
  }

  try {
    const vehicle = await VehicleAPI.getVehicleByPlate(plate);

    return {
      props: {
        vehicle,
        plate: formatPlate(plate),
      },
      revalidate: 300, // 5分鐘重新驗證
    };
  } catch (error) {
    console.error('取得車輛資料時發生錯誤:', error);
    
    return {
      props: {
        vehicle: null,
        plate: formatPlate(plate),
      },
      revalidate: 60, // 1分鐘重新驗證（錯誤情況下更頻繁）
    };
  }
}

export default function VehicleQueryPageRoute({ params }: PageProps) {
  const plate = decodeURIComponent(params.plate);

  // 驗證車牌格式
  if (!validatePlate(plate)) {
    notFound();
  }

  return <VehicleQueryPage plate={plate} />;
}
