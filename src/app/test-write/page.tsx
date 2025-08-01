'use client';

import { useState } from 'react';
import { VehicleRecord } from '@/types/vehicle';

export default function TestWritePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    plate: '',
    vehicleType: 'car',
    applicantName: '',
    contactPhone: '',
    identityType: 'visitor',
    applicationDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    brand: '',
    color: '',
    department: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testWrite = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🚀 開始測試寫入功能...');
      console.log('📝 表單資料:', formData);

      // 驗證必要欄位
      if (!formData.plate || !formData.applicantName || !formData.contactPhone) {
        throw new Error('請填寫必要欄位：車牌號碼、申請人姓名、聯絡電話');
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('📊 API 回應:', data);

      if (data.success) {
        setResult(data);
        // 清空表單
        setFormData({
          plate: '',
          vehicleType: 'car',
          applicantName: '',
          contactPhone: '',
          identityType: 'visitor',
          applicationDate: new Date().toISOString().split('T')[0],
          visitTime: '',
          brand: '',
          color: '',
          department: '',
          notes: ''
        });
      } else {
        throw new Error(data.error || '寫入失敗');
      }
    } catch (err) {
      console.error('❌ 測試寫入失敗:', err);
      setError(err instanceof Error ? err.message : '未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  const generateTestData = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    setFormData({
      plate: `TEST${randomNum}`,
      vehicleType: 'car',
      applicantName: `測試用戶${randomNum}`,
      contactPhone: `0912${randomNum.toString().padStart(6, '0')}`,
      identityType: 'visitor',
      applicationDate: new Date().toISOString().split('T')[0],
      visitTime: '09:00',
      brand: 'Toyota',
      color: '白色',
      department: '資訊部',
      notes: '測試記錄'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">寫入功能測試</h1>
          
          {/* 環境變數狀態 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">環境變數狀態</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">RAGIC_API_KEY:</span> 
                <span className={process.env.NEXT_PUBLIC_RAGIC_API_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '已設定' : '未設定'}
                </span>
              </div>
              <div>
                <span className="font-medium">RAGIC_ACCOUNT:</span> 
                <span className="text-blue-600">{process.env.NEXT_PUBLIC_RAGIC_ACCOUNT || '未設定'}</span>
              </div>
              <div>
                <span className="font-medium">FORM_ID:</span> 
                <span className="text-blue-600">{process.env.NEXT_PUBLIC_RAGIC_FORM_ID || '未設定'}</span>
              </div>
              <div>
                <span className="font-medium">SUBTABLE_ID:</span> 
                <span className="text-blue-600">{process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID || '未設定'}</span>
              </div>
            </div>
          </div>

          {/* 表單 */}
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={generateTestData}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                產生測試資料
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車牌號碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="plate"
                  value={formData.plate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入車牌號碼"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">車輛類型</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="car">轎車</option>
                  <option value="motorcycle">機車</option>
                  <option value="truck">貨車</option>
                  <option value="bus">巴士</option>
                  <option value="vip">貴賓用車</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  申請人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入申請人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入聯絡電話"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身分類別</label>
                <select
                  name="identityType"
                  value={formData.identityType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="visitor">訪客</option>
                  <option value="staff">同仁</option>
                  <option value="executive">長官</option>
                  <option value="partner">關係企業</option>
                  <option value="contractor">承包商</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">申請日期</label>
                <input
                  type="date"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">到訪時間</label>
                <input
                  type="time"
                  name="visitTime"
                  value={formData.visitTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">車輛品牌</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入車輛品牌"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">車輛顏色</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入車輛顏色"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="請輸入部門"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入備註"
              />
            </div>

            <button
              onClick={testWrite}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {loading ? '寫入中...' : '測試寫入'}
            </button>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-lg font-medium text-red-800 mb-2">錯誤</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 成功結果 */}
          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-lg font-medium text-green-800 mb-2">成功</h3>
              <p className="text-green-700 mb-2">{result.message}</p>
              <pre className="bg-white p-3 rounded border text-sm overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
