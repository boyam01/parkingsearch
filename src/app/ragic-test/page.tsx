'use client';

import { useState } from 'react';

export default function RagicTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const testRagicConnection = async () => {
    if (!apiKey.trim()) {
      setResult('請先輸入 API Key');
      return;
    }

    setLoading(true);
    setResult('測試中...');

    try {
      const baseURL = 'https://ap7.ragic.com';
      const accountName = 'xinsheng';
      const formId = '31';
      const subtableId = '6';
      
      const url = `${baseURL}/${accountName}/ragicforms${formId}/${subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
      
      console.log('測試 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('回應狀態:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        setResult(`❌ HTTP 錯誤 ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('取得的資料:', data);

      let resultText = '✅ 連接成功!\n\n';
      resultText += `資料類型: ${typeof data}\n`;
      resultText += `是否為陣列: ${Array.isArray(data)}\n`;

      if (typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data);
        resultText += `記錄數量: ${keys.length}\n\n`;
        
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstRecord = data[firstKey];
          resultText += `第一筆記錄的欄位:\n`;
          resultText += Object.keys(firstRecord).join(', ') + '\n\n';
          resultText += `第一筆記錄範例:\n`;
          resultText += JSON.stringify(firstRecord, null, 2);
        }
      }

      setResult(resultText);
    } catch (error) {
      console.error('連接錯誤:', error);
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      setResult(`❌ 連接錯誤: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ragic API 連接測試</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Key 設定</h2>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              請輸入 Ragic API Key:
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入您的 Ragic API Key"
            />
          </div>
          <button
            onClick={testRagicConnection}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '測試中...' : '測試連接'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">測試結果</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">測試說明</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 這個測試會嘗試連接到您的 Ragic 資料庫</li>
            <li>• 測試 URL: https://ap7.ragic.com/xinsheng/ragicforms31/6</li>
            <li>• 成功連接後會顯示資料結構和欄位名稱</li>
            <li>• 請確保您的 API Key 有正確的權限</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
