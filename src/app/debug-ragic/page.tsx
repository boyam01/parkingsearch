'use client';

import { useState } from 'react';
import { RagicAPI } from '@/lib/api';

export default function DebugRagicPage() {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    plate: 'TEST-001',
    applicantName: '測試申請人',
    vehicleType: 'car' as const,
    contactPhone: '0912345678',
    identityType: 'visitor' as const,
    applicationDate: new Date().toISOString().split('T')[0]
  });

  const handleDebugConnection = async () => {
    setLoading(true);
    try {
      const result = await RagicAPI.debugRagicConnection();
      setDebugResult(result);
      console.log('🔍 除錯結果:', result);
    } catch (error) {
      console.error('除錯失敗:', error);
      setDebugResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestRead = async () => {
    setLoading(true);
    try {
      const records = await RagicAPI.getRecords();
      setDebugResult({
        success: true,
        action: 'read',
        recordCount: records.length,
        records: records.slice(0, 3), // 只顯示前3筆
        allRecords: records
      });
    } catch (error) {
      setDebugResult({
        success: false,
        action: 'read',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWrite = async () => {
    setLoading(true);
    try {
      console.log('🚀 開始測試寫入，測試資料:', testData);
      const result = await RagicAPI.createRecord(testData);
      console.log('✅ 寫入測試完成，結果:', result);
      
      // 立即重新讀取來驗證
      console.log('🔍 立即重新讀取來驗證...');
      const records = await RagicAPI.getRecords();
      const foundRecord = records.find(r => r.plate === testData.plate);
      
      setDebugResult({
        success: true,
        action: 'write',
        createdRecord: result,
        verification: {
          found: !!foundRecord,
          record: foundRecord || null,
          totalRecords: records.length,
          allPlates: records.map(r => r.plate)
        }
      });
    } catch (error) {
      console.error('❌ 寫入測試失敗:', error);
      setDebugResult({
        success: false,
        action: 'write',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">🔍 Ragic API 除錯工具</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleDebugConnection}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '⏳ 測試中...' : '🔍 檢查連接'}
        </button>
        
        <button
          onClick={handleTestRead}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '⏳ 讀取中...' : '📖 測試讀取'}
        </button>
        
        <button
          onClick={handleTestWrite}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '⏳ 寫入中...' : '✏️ 測試寫入'}
        </button>
      </div>

      {/* 測試資料設定 */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">📝 測試資料設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">車牌號碼</label>
            <input
              type="text"
              value={testData.plate}
              onChange={(e) => setTestData({...testData, plate: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">申請人姓名</label>
            <input
              type="text"
              value={testData.applicantName}
              onChange={(e) => setTestData({...testData, applicantName: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">聯絡電話</label>
            <input
              type="text"
              value={testData.contactPhone}
              onChange={(e) => setTestData({...testData, contactPhone: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">車輛類型</label>
            <select
              value={testData.vehicleType}
              onChange={(e) => setTestData({...testData, vehicleType: e.target.value as any})}
              className="w-full p-2 border rounded"
            >
              <option value="car">轎車</option>
              <option value="motorcycle">機車</option>
              <option value="truck">貨車</option>
            </select>
          </div>
        </div>
      </div>

      {/* 結果顯示 */}
      {debugResult && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {debugResult.success ? '✅ 測試結果' : '❌ 測試失敗'}
          </h2>
          
          {debugResult.success ? (
            <div className="space-y-4">
              {debugResult.configuration && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">📋 配置資訊</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(debugResult.configuration, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugResult.fieldStructure && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">🔑 欄位結構</h3>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-2">可用欄位 ({debugResult.fieldStructure.length} 個):</p>
                    <div className="flex flex-wrap gap-2">
                      {debugResult.fieldStructure.map((field: string, index: number) => (
                        <span key={index} className="bg-blue-200 px-2 py-1 rounded text-xs">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {debugResult.sampleRecord && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">📄 範例記錄</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-64">
                    {JSON.stringify(debugResult.sampleRecord, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugResult.records && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">📊 讀取記錄 ({debugResult.recordCount} 筆)</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-64">
                    {JSON.stringify(debugResult.records, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugResult.createdRecord && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">✅ 寫入成功</h3>
                  <pre className="bg-green-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(debugResult.createdRecord, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded">
              <p className="text-red-700 font-medium">錯誤訊息:</p>
              <p className="text-red-600 mt-2">{debugResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
