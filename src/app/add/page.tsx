'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, PageHeader } from '@/components/Navigation';
import { VehicleForm } from '@/components/VehicleForm';

export default function AddVehiclePage() {
  const router = useRouter();
  
  const handleSubmit = async (vehicle: Record<string, any>) => {
    try {
      console.log('📝 新增車輛:', vehicle);
      
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 新增成功:', result.data);
        // 可以顯示成功訊息或導向其他頁面
        alert('車輛記錄新增成功！');
        router.push('/'); // 返回首頁
      } else {
        console.error('❌ 新增失敗:', result.error);
        alert(result.error || '新增失敗，請稍後再試');
      }
    } catch (error) {
      console.error('💥 新增異常:', error);
      alert('網路錯誤，請稍後再試');
    }
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
