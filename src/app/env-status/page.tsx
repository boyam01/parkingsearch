'use client';

import { useState, useEffect } from 'react';

export default function EnvStatus() {
  const [envStatus, setEnvStatus] = useState<any>({});
  const [apiTest, setApiTest] = useState<string>('');

  useEffect(() => {
    // 檢查環境變數
    const status = {
      RAGIC_BASE_URL: process.env.NEXT_PUBLIC_RAGIC_BASE_URL || '未設定',
      RAGIC_API_KEY: process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '已設定 ✅' : '❌ 未設定',
      RAGIC_ACCOUNT: process.env.NEXT_PUBLIC_RAGIC_ACCOUNT || '未設定',
      RAGIC_FORM_ID: process.env.NEXT_PUBLIC_RAGIC_FORM_ID || '未設定',
      RAGIC_SUBTABLE_ID: process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID || '未設定',
      NODE_ENV: process.env.NODE_ENV || '未設定',
      VERCEL: process.env.VERCEL ? '在 Vercel 環境 ✅' : '不在 Vercel 環境',
      VERCEL_URL: process.env.VERCEL_URL || '未設定'
    };
    setEnvStatus(status);

    // 測試 API 連接
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      if (data.success) {
        setApiTest(`✅ API 正常，找到 ${data.data.length} 筆記錄`);
      } else {
        setApiTest(`❌ API 錯誤: ${data.error}`);
      }
    } catch (error) {
      setApiTest(`❌ API 連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">環境變數狀態檢查</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">環境變數狀態</h2>
          <div className="space-y-3">
            {Object.entries(envStatus).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-mono text-sm text-gray-600">{key}</span>
                <span className={`font-mono text-sm ${
                  String(value).includes('✅') ? 'text-green-600' : 
                  String(value).includes('❌') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API 連接測試</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-mono text-sm">{apiTest || '測試中...'}</p>
          </div>
          <button 
            onClick={testAPI}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            重新測試 API
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">設定步驟</h2>
          <div className="text-yellow-700 space-y-2">
            <p><strong>1. 前往 Vercel 控制台：</strong></p>
            <p className="ml-4">→ <a href="https://vercel.com/dashboard" target="_blank" className="text-blue-600 underline">https://vercel.com/dashboard</a></p>
            
            <p><strong>2. 選擇您的專案：</strong></p>
            <p className="ml-4">→ 點擊 "parkingsearch" 專案</p>
            
            <p><strong>3. 前往設定：</strong></p>
            <p className="ml-4">→ Settings → Environment Variables</p>
            
            <p><strong>4. 新增以下環境變數：</strong></p>
            <div className="ml-4 bg-gray-100 p-3 rounded font-mono text-sm">
              <p>NEXT_PUBLIC_RAGIC_API_KEY = 您的 Ragic API Key</p>
              <p>NEXT_PUBLIC_RAGIC_BASE_URL = https://ap7.ragic.com</p>
              <p>NEXT_PUBLIC_RAGIC_ACCOUNT = xinsheng</p>
              <p>NEXT_PUBLIC_RAGIC_FORM_ID = 31</p>
              <p>NEXT_PUBLIC_RAGIC_SUBTABLE_ID = 6</p>
            </div>
            
            <p><strong>5. 重新部署：</strong></p>
            <p className="ml-4">→ Deployments → 點擊最新部署的 "..." → Redeploy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
