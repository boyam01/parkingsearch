'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, PageHeader } from '@/components/Navigation';
import { SelfApplicationForm } from '@/components/SelfApplicationForm';

export default function SelfApplicationPage() {
  const router = useRouter();
  
  const handleSuccess = (applicationId: string) => {
    console.log('申請成功，申請編號:', applicationId);
    // 可以導向成功頁面或顯示成功訊息
    router.push(`/apply/success?id=${applicationId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <PageHeader
          title="車輛申請"
          description="填寫車輛資訊並提交申請，我們將在 1-2 個工作天內審核"
          breadcrumbs={[
            { href: '/', label: '首頁' },
            { label: '車輛申請' }
          ]}
        />
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            📋 申請須知
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 請確實填寫所有必要資訊，資料不正確可能導致申請被拒絕</li>
            <li>• 申請提交後將無法修改，如需變更請重新提交申請</li>
            <li>• 管理員將在 1-2 個工作天內審核您的申請</li>
            <li>• 申請結果將透過電子郵件通知，請確保信箱地址正確</li>
            <li>• 申請核准前請勿進入停車區域</li>
          </ul>
        </div>

        <SelfApplicationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
