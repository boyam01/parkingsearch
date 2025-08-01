'use client';

import { useState } from 'react';
import { VehicleAPI } from '@/lib/api';

export default function QuickAdd() {
  const [formData, setFormData] = useState({
    plate: '',
    vehicleType: 'car',
    applicantName: '',
    contactPhone: '',
    identityType: 'visitor',
    applicationDate: new Date().toISOString().split('T')[0],
    visitTime: '09:00',
    brand: '',
    department: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      console.log('🚀 開始新增車輛記錄:', formData);
      
      const newVehicle = await VehicleAPI.createVehicle({
        ...formData,
        approvalStatus: 'pending',
        notes: `緊急測試新增 - ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedBy: 'admin',
        applicantEmail: '',
        applicantId: '',
        emergencyContact: '',
        emergencyPhone: '',
        visitPurpose: '測試用途',
        expectedDuration: '1小時',
        ipAddress: '',
        userAgent: navigator.userAgent,
        color: ''
      });

      console.log('✅ 新增成功:', newVehicle);
      setResult(`✅ 新增成功！\n車牌：${newVehicle.plate}\n申請人：${newVehicle.applicantName}\nID：${newVehicle.id}`);
      
      // 清空表單
      setFormData({
        plate: '',
        vehicleType: 'car',
        applicantName: '',
        contactPhone: '',
        identityType: 'visitor',
        applicationDate: new Date().toISOString().split('T')[0],
        visitTime: '09:00',
        brand: '',
        department: ''
      });
    } catch (error) {
      console.error('❌ 新增失敗:', error);
      setResult(`❌ 新增失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-800">🚀 快速新增測試</h1>
          <p className="text-blue-700">Demo 專用 - 快速新增車輛記錄</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車牌號碼 *
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({...formData, plate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="例：ABC-1234"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車輛類型 *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="car">轎車</option>
                <option value="motorcycle">機車</option>
                <option value="truck">貨車</option>
                <option value="vip">貴賓用車</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申請人姓名 *
              </label>
              <input
                type="text"
                value={formData.applicantName}
                onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="申請人姓名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                聯絡電話 *
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0912-345-678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                身份類別
              </label>
              <select
                value={formData.identityType}
                onChange={(e) => setFormData({...formData, identityType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="visitor">一般訪客</option>
                <option value="staff">同仁</option>
                <option value="executive">長官</option>
                <option value="partner">關係企業</option>
                <option value="contractor">承包商</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申請日期
              </label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => setFormData({...formData, applicationDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到訪時間
              </label>
              <input
                type="time"
                value={formData.visitTime}
                onChange={(e) => setFormData({...formData, visitTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車輛品牌
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota, Honda..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部門
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="資訊部, 業務部..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? '🔄 新增中...' : '🚀 立即新增'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-2">快速測試資料</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                plate: 'DEMO-001',
                applicantName: '張三',
                contactPhone: '0912-345-678',
                brand: 'Toyota'
              })}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
            >
              測試資料 1
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                plate: 'TEST-002',
                applicantName: '李四',
                contactPhone: '0923-456-789',
                brand: 'Honda'
              })}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
            >
              測試資料 2
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                plate: 'EMERGENCY-999',
                applicantName: '王五',
                contactPhone: '0934-567-890',
                brand: 'BMW'
              })}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
            >
              緊急測試
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
