'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';

export default function ForceWritePage() {
  const [isWriting, setIsWriting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testData, setTestData] = useState({
    plate: `TEST-${Date.now().toString().slice(-4)}`,
    vehicleType: 'car',
    applicantName: '強制寫入測試',
    contactPhone: '0900-000-000',
    identityType: 'visitor',
    brand: 'TestBrand',
    color: '測試色',
    department: '測試部門',
    notes: '這是強制寫入測試'
  });

  const handleForceWrite = async () => {
    setIsWriting(true);
    setResult(null);

    try {
      const response = await fetch('/api/force-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: testData }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsWriting(false);
    }
  };

  const generateNewTestData = () => {
    setTestData({
      ...testData,
      plate: `TEST-${Date.now().toString().slice(-4)}`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔥 強制寫入測試
          </h1>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ 測試說明
              </h2>
              <p className="text-yellow-700">
                此功能用於測試強制寫入資料到 Ragic 資料庫。
                每次執行都會產生新的測試記錄。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車牌號碼
                </label>
                <input
                  type="text"
                  value={testData.plate}
                  onChange={(e) => setTestData({...testData, plate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  申請人姓名
                </label>
                <input
                  type="text"
                  value={testData.applicantName}
                  onChange={(e) => setTestData({...testData, applicantName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話
                </label>
                <input
                  type="text"
                  value={testData.contactPhone}
                  onChange={(e) => setTestData({...testData, contactPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車輛品牌
                </label>
                <input
                  type="text"
                  value={testData.brand}
                  onChange={(e) => setTestData({...testData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleForceWrite}
                disabled={isWriting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWriting ? '強制寫入中...' : '🔥 強制寫入'}
              </button>
              
              <button
                onClick={generateNewTestData}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 產生新測試資料
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-semibold ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ 強制寫入成功' : '❌ 強制寫入失敗'}
                </h3>
                
                <pre className="mt-2 text-sm bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
