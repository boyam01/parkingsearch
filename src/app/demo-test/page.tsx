'use client';

import { useState } from 'react';
import { RagicAPI } from '@/lib/api';

export default function RagicTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'pass' | 'fail', details: any) => {
    setTestResults(prev => [...prev, { 
      test, 
      status, 
      details, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testRagicConnection = async () => {
    try {
      addResult('測試 Ragic 連接', 'pass', '開始測試...');
      
      // 測試環境變數
      const envVars = {
        RAGIC_BASE_URL: process.env.NEXT_PUBLIC_RAGIC_BASE_URL,
        RAGIC_ACCOUNT: process.env.NEXT_PUBLIC_RAGIC_ACCOUNT,
        RAGIC_FORM_ID: process.env.NEXT_PUBLIC_RAGIC_FORM_ID,
        RAGIC_SUBTABLE_ID: process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID,
        RAGIC_API_KEY: process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '已設定' : '未設定'
      };
      
      addResult('環境變數檢查', 'pass', envVars);
      
      // 測試讀取資料
      const records = await RagicAPI.getRecords();
      addResult('讀取 Ragic 資料', 'pass', `成功讀取 ${records.length} 筆記錄`);
      
      return true;
    } catch (error) {
      addResult('測試 Ragic 連接', 'fail', error);
      return false;
    }
  };

  const testRagicWrite = async () => {
    try {
      const testVehicle = {
        plate: `TEST-${Date.now()}`,
        vehicleType: 'car',
        applicantName: '測試申請人',
        contactPhone: '0900123456',
        identityType: 'visitor',
        applicationDate: new Date().toISOString().split('T')[0],
        visitTime: '10:00',
        brand: '測試品牌',
        department: '測試部門'
      };
      
      addResult('準備寫入測試資料', 'pass', testVehicle);
      
      const result = await RagicAPI.createRecord(testVehicle);
      addResult('寫入 Ragic 測試', 'pass', `成功寫入，ID: ${result.id}`);
      
      return result;
    } catch (error) {
      addResult('寫入 Ragic 測試', 'fail', error);
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // 1. 測試連接
      const connectionOk = await testRagicConnection();
      
      if (connectionOk) {
        // 2. 測試寫入
        await testRagicWrite();
        
        // 3. 延遲後再次讀取驗證
        addResult('驗證寫入結果', 'pass', '等待 2 秒後重新讀取...');
        setTimeout(async () => {
          try {
            const updatedRecords = await RagicAPI.getRecords();
            addResult('驗證寫入結果', 'pass', `重新讀取到 ${updatedRecords.length} 筆記錄`);
          } catch (error) {
            addResult('驗證寫入結果', 'fail', error);
          }
        }, 2000);
      }
      
    } catch (error) {
      addResult('整體測試', 'fail', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Ragic API 整合測試
          </h1>
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">🚨 DEMO 前檢查清單</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• 確認 Ragic API Key 有效且有寫入權限</li>
              <li>• 確認表單 ID (31) 和子表 ID (6) 正確</li>
              <li>• 確認欄位 ID 對應正確</li>
              <li>• 測試完整的寫入→讀取流程</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? '🔄 測試執行中...' : '🚀 開始完整測試'}
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-md border-l-4 ${
                result.status === 'pass' 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    result.status === 'pass' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.status === 'pass' ? '✅' : '❌'} {result.test}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
                <div className={`mt-2 text-sm ${
                  result.status === 'pass' ? 'text-green-700' : 'text-red-700'
                }`}>
                  <pre className="whitespace-pre-wrap break-words">
                    {typeof result.details === 'string' 
                      ? result.details 
                      : JSON.stringify(result.details, null, 2)
                    }
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {testResults.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">📊 測試摘要</h3>
              <div className="text-blue-700">
                <p>總測試項目: {testResults.length}</p>
                <p>通過: {testResults.filter(r => r.status === 'pass').length}</p>
                <p>失敗: {testResults.filter(r => r.status === 'fail').length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
