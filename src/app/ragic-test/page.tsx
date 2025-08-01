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
      // 使用測試 API
      const response = await fetch('/api/test-ragic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          action: 'test-connection'
        })
      });

      const data = await response.json();
      console.log('API 回應:', data);

      let resultText = '';
      if (data.success) {
        resultText = `✅ API 連接成功!\n\n`;
        resultText += `${data.message}\n\n`;
        
        if (data.data.sampleRecords && data.data.sampleRecords.length > 0) {
          resultText += `記錄範例:\n`;
          data.data.sampleRecords.forEach((record: any, index: number) => {
            resultText += `\n第 ${index + 1} 筆記錄:\n`;
            resultText += `- 車牌: ${record.plate || '無'}\n`;
            resultText += `- 申請人: ${record.applicantName || '無'}\n`;
            resultText += `- 車輛類型: ${record.vehicleType || '無'}\n`;
            resultText += `- 聯絡電話: ${record.contactPhone || '無'}\n`;
            resultText += `- 申請日期: ${record.applicationDate || '無'}\n`;
          });
        }
      } else {
        resultText = `❌ API 錯誤: ${data.error}`;
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
