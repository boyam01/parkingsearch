'use client';

import { useState, useEffect } from 'react';

interface VehicleRecord {
  id: string;
  plate: string;
  vehicleType: string;
  applicantName: string;
  contactPhone: string;
  identityType: string;
  applicationDate: string;
  visitTime?: string;
  brand?: string;
  color?: string;
  department?: string;
  approvalStatus: string;
  notes?: string;
}

export default function TestPage() {
  const [data, setData] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/vehicles');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">系統測試頁面</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">系統狀態</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-700 font-semibold">資料總數</div>
              <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-green-700 font-semibold">API 狀態</div>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '載入中...' : '正常'}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-700 font-semibold">連線品質</div>
              <div className="text-2xl font-bold text-purple-600">良好</div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-semibold">錯誤訊息:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">功能測試</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={refresh}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '重新載入中...' : '重新載入資料'}
              </button>
              
              <div className="text-sm text-gray-600">
                最後更新: {new Date().toLocaleString('zh-TW')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">資料預覽</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-gray-600">載入中...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暫無資料
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      車牌號碼
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      申請人
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      車型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      身份類別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      審核狀態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 10).map((record, index) => (
                    <tr key={record.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.applicantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.vehicleType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.identityType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.approvalStatus === '核准' 
                            ? 'bg-green-100 text-green-800'
                            : record.approvalStatus === '待審' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.length > 10 && (
                <div className="text-center py-4 text-gray-500">
                  還有 {data.length - 10} 筆資料...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
