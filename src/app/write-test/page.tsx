/**
 * 簡單測試寫入功能
 */
'use client';

import { useState } from 'react';

export default function WriteTestPage() {
  const [plate, setPlate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testWrite = async () => {
    if (!plate || !name || !phone) {
      alert('請填寫所有欄位');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plate: plate,
          vehicleType: 'car',
          applicantName: name,
          contactPhone: phone,
          identityType: 'visitor',
          applicationDate: new Date().toISOString().split('T')[0],
          approvalStatus: 'pending',
          notes: '測試寫入記錄'
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        alert('✅ 成功寫入 Ragic 資料庫！');
        setPlate('');
        setName('');
        setPhone('');
      } else {
        alert('❌ 寫入失敗: ' + data.error);
      }
    } catch (error) {
      console.error('寫入錯誤:', error);
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      setResult({ error: errorMessage });
      alert('❌ 網路錯誤: ' + errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🧪 測試寫入 Ragic
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              車牌號碼
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="例：TEST-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              申請人姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="輸入姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              聯絡電話
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="0912-345-678"
            />
          </div>

          <button
            onClick={testWrite}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '⏳ 寫入中...' : '💾 測試寫入'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">回應結果:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>測試說明:</strong></p>
          <ul className="list-disc ml-4 mt-2">
            <li>填寫表單並點擊「測試寫入」</li>
            <li>資料會直接寫入到 Ragic 資料庫</li>
            <li>檢查控制台日誌查看詳細資訊</li>
            <li>到管理頁面確認資料是否成功新增</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
