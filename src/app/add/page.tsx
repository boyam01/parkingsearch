'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, PageHeader } from '@/components/Navigation';
import { VehicleForm } from '@/components/VehicleForm';

export default function AddVehiclePage() {
  const router = useRouter();
  
  const handleSubmit = async (vehicle: Record<string, any>) => {
    // TODO: 實作車輛新增邏輯
    console.log('新增車輛:', vehicle);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <PageHeader
          title="新增車輛記錄"
          description="填寫車輛資訊申請停車權限"
          breadcrumbs={[
            { href: '/', label: '首頁' },
            { label: '新增車輛' }
          ]}
        />

        <div className="bg-white border border-gray-200 rounded-lg">
          <VehicleForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            className="p-6"
          />
        </div>
      </div>
    </div>
  );
}
