'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, FileText, Clock, Mail } from 'lucide-react';
import { Navigation, PageHeader } from '@/components/Navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationId = searchParams.get('id');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <PageHeader
          title="申請成功"
          description="您的車輛申請已成功提交"
          breadcrumbs={[
            { href: '/', label: '首頁' },
            { href: '/apply', label: '車輛申請' },
            { label: '申請成功' }
          ]}
        />
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              申請提交成功！
            </h2>
            
            <p className="text-gray-600 mb-6">
              您的車輛申請已經成功提交，我們會在 1-2 個工作天內完成審核。
            </p>
            
            {applicationId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>申請編號：</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {applicationId}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 後續步驟 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              後續步驟
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">等待審核</h4>
                  <p className="text-sm text-gray-600">
                    管理員將在 1-2 個工作天內審核您的申請
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">接收通知</h4>
                  <p className="text-sm text-gray-600">
                    審核結果將透過電子郵件通知您
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">開始使用</h4>
                  <p className="text-sm text-gray-600">
                    申請通過後即可使用停車位
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>回到首頁</span>
            </Link>
            
            <Link
              href="/apply"
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>再次申請</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-2 text-gray-600">載入中...</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
