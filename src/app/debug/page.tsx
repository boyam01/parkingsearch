'use client';

import { useState, useEffect } from 'react';
import { VehicleAPI } from '@/lib/api';

export default function DebugPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 開始載入車輛資料...');
        const data = await VehicleAPI.getAllVehicles();
        console.log('📊 載入的資料:', data);
        console.log('📊 資料數量:', data.length);
        
        if (data.length > 0) {
          console.log('📊 第一筆資料:', data[0]);
          console.log('📊 第一筆資料的車牌:', data[0].plate);
        }
        
        setVehicles(data);
      } catch (err) {
        console.error('❌ 載入失敗:', err);
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">除錯頁面 - 車輛資料檢查</h1>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-red-800 font-semibold">錯誤</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">資料統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">總記錄數</h3>
                  <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">有車牌記錄</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {vehicles.filter(v => v.plate && v.plate.trim()).length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900">空車牌記錄</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {vehicles.filter(v => !v.plate || !v.plate.trim()).length}
                  </p>
                </div>
              </div>
            </div>

            {vehicles.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">前 3 筆記錄詳細資料</h2>
                <div className="space-y-4">
                  {vehicles.slice(0, 3).map((vehicle, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">記錄 #{index + 1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong>車牌:</strong> "{vehicle.plate}" (類型: {typeof vehicle.plate})
                        </div>
                        <div>
                          <strong>申請人:</strong> "{vehicle.applicantName}" (類型: {typeof vehicle.applicantName})
                        </div>
                        <div>
                          <strong>車輛類型:</strong> "{vehicle.vehicleType}" (類型: {typeof vehicle.vehicleType})
                        </div>
                        <div>
                          <strong>聯絡電話:</strong> "{vehicle.contactPhone}" (類型: {typeof vehicle.contactPhone})
                        </div>
                        <div>
                          <strong>身份類別:</strong> "{vehicle.identityType}" (類型: {typeof vehicle.identityType})
                        </div>
                        <div>
                          <strong>申請日期:</strong> "{vehicle.applicationDate}" (類型: {typeof vehicle.applicationDate})
                        </div>
                      </div>
                      <details className="mt-4">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          顯示完整 JSON
                        </summary>
                        <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-auto">
                          {JSON.stringify(vehicle, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vehicles.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">欄位統計</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(vehicles[0] || {}).map(field => {
                    const filledCount = vehicles.filter(v => v[field] && String(v[field]).trim()).length;
                    const percentage = vehicles.length > 0 ? Math.round((filledCount / vehicles.length) * 100) : 0;
                    
                    return (
                      <div key={field} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm">{field}</span>
                          <span className="text-xs text-gray-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {filledCount} / {vehicles.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
