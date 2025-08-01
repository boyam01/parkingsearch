'use client';

import { useState, useEffect } from 'react';
import { RagicAPI } from '@/lib/api';
import { VehicleRecord } from '@/types/vehicle';

export default function RagicTestPage() {
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'failed'>('testing');

  // 只在非生產環境顯示測試頁面
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">測試頁面不可用</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">此測試頁面在生產環境中不可用。</p>
          </div>
        </div>
      </div>
    );
  }

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setConnectionStatus('testing');

    try {
      console.log('測試 Ragic 連接...');
      const data = await RagicAPI.getRecords();
      console.log('Ragic 回應資料:', data);
      
      setRecords(data);
      setConnectionStatus('success');
    } catch (err) {
      console.error('Ragic 連接失敗:', err);
      setError(err instanceof Error ? err.message : '未知錯誤');
      setConnectionStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const testCreateRecord = async () => {
    setLoading(true);
    setError(null);

    try {
      const testRecord = {
        plate: 'TEST-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        vehicleType: '轎車',
        applicantName: '測試用戶',
        contactPhone: '0912-345-678',
        identityType: '訪客',
        applicationDate: new Date().toISOString().split('T')[0],
        visitTime: '09:00',
        brand: '測試品牌',
        color: '白色',
        department: '測試部門',
        approvalStatus: 'pending' as const,
        notes: '這是一筆測試記錄，可以刪除',
        submittedBy: 'self' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('建立測試記錄:', testRecord);
      const newRecord = await RagicAPI.createRecord(testRecord);
      console.log('新記錄建立成功:', newRecord);
      
      // 重新載入所有記錄
      await testConnection();
    } catch (err) {
      console.error('建立記錄失敗:', err);
      setError(err instanceof Error ? err.message : '建立記錄失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ragic 資料庫連接測試</h1>
        
        {/* 連接狀態 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">連接狀態</h2>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              connectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-800' :
              connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {connectionStatus === 'testing' ? '測試中...' :
               connectionStatus === 'success' ? '✅ 連接成功' :
               '❌ 連接失敗'}
            </div>
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '測試中...' : '重新測試'}
            </button>
            <button
              onClick={testCreateRecord}
              disabled={loading || connectionStatus !== 'success'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              建立測試記錄
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* 資料顯示 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">資料庫記錄 ({records.length} 筆)</h2>
          
          {records.length === 0 ? (
            <p className="text-gray-500">目前沒有記錄</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">車牌號碼</th>
                    <th className="px-4 py-2 text-left">申請人</th>
                    <th className="px-4 py-2 text-left">車輛類型</th>
                    <th className="px-4 py-2 text-left">身份類別</th>
                    <th className="px-4 py-2 text-left">審核狀態</th>
                    <th className="px-4 py-2 text-left">建立時間</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id || index} className="border-t">
                      <td className="px-4 py-2 font-mono">{record.plate}</td>
                      <td className="px-4 py-2">{record.applicantName}</td>
                      <td className="px-4 py-2">{record.vehicleType}</td>
                      <td className="px-4 py-2">{record.identityType}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          record.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(record.createdAt).toLocaleString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 配置資訊 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">當前配置</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Base URL:</span> {process.env.NEXT_PUBLIC_RAGIC_BASE_URL}</p>
            <p><span className="font-medium">Account:</span> {process.env.NEXT_PUBLIC_RAGIC_ACCOUNT}</p>
            <p><span className="font-medium">Form ID:</span> {process.env.NEXT_PUBLIC_RAGIC_FORM_ID}</p>
            <p><span className="font-medium">Subtable ID:</span> {process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID}</p>
            <p><span className="font-medium">API Key:</span> {process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '已設定 ✅' : '未設定 ❌'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
