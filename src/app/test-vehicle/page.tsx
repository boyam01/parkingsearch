'use client';

import { useState } from 'react';

export default function VehicleTestPage() {
  const [connectionResult, setConnectionResult] = useState<any>(null);
  const [writeResult, setWriteResult] = useState<any>(null);
  const [loading, setLoading] = useState({ connection: false, write: false });

  const testConnection = async () => {
    setLoading(prev => ({ ...prev, connection: true }));
    try {
      const response = await fetch('/api/vehicles/test', {
        method: 'GET'
      });
      const result = await response.json();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const testWrite = async () => {
    setLoading(prev => ({ ...prev, write: true }));
    try {
      const response = await fetch('/api/vehicles/test', {
        method: 'POST'
      });
      const result = await response.json();
      setWriteResult(result);
    } catch (error) {
      setWriteResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(prev => ({ ...prev, write: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🚗 Ragic API 測試工具
        </h1>

        <div className="space-y-6">
          {/* 連線測試 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔗 連線測試</h2>
            <button
              onClick={testConnection}
              disabled={loading.connection}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
            >
              {loading.connection ? '測試中...' : '測試連線'}
            </button>
            
            {connectionResult && (
              <div className="mt-4">
                <div className={`p-4 rounded-md ${
                  connectionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className={`text-lg ${connectionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {connectionResult.success ? '✅' : '❌'}
                    </span>
                    <span className={`ml-2 font-medium ${connectionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {connectionResult.message}
                    </span>
                  </div>
                  {connectionResult.error && (
                    <p className="text-red-600 mt-2 text-sm">
                      錯誤: {connectionResult.error}
                    </p>
                  )}
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    查看詳細結果
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(connectionResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* 寫入測試 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">✏️ 寫入測試</h2>
            <button
              onClick={testWrite}
              disabled={loading.write}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
            >
              {loading.write ? '測試中...' : '測試寫入'}
            </button>
            
            {writeResult && (
              <div className="mt-4">
                <div className={`p-4 rounded-md ${
                  writeResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className={`text-lg ${writeResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {writeResult.success ? '✅' : '❌'}
                    </span>
                    <span className={`ml-2 font-medium ${writeResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {writeResult.message}
                    </span>
                  </div>
                  {writeResult.error && (
                    <p className="text-red-600 mt-2 text-sm">
                      錯誤: {writeResult.error}
                    </p>
                  )}
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    查看詳細結果
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(writeResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* 使用說明 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">📋 測試說明</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• <strong>連線測試</strong>：驗證 Ragic API 基本連線功能</li>
              <li>• <strong>寫入測試</strong>：嘗試寫入一筆測試車輛資料</li>
              <li>• 測試結果會顯示成功/失敗狀態和詳細資訊</li>
              <li>• 可以展開「查看詳細結果」查看完整回應資料</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
