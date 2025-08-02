'use client';

import React, { useState } from 'react';
import { Car, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function SimpleAddPage() {
  const [formData, setFormData] = useState({
    plate: '',
    vehicleType: '轎車',
    applicantName: '',
    contactPhone: '',
    identityType: '訪客',
    applicationDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    brand: '',
    department: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plate || !formData.applicantName || !formData.contactPhone) {
      setResult({ success: false, message: '請填寫必要欄位：車牌號碼、申請人姓名、聯絡電話' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      console.log('📝 準備提交資料:', formData);
      
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('📡 API 回應:', responseData);

      if (responseData.success) {
        setResult({ success: true, message: '車輛記錄新增成功！' });
        // 清空表單
        setFormData({
          plate: '',
          vehicleType: '轎車',
          applicantName: '',
          contactPhone: '',
          identityType: '訪客',
          applicationDate: new Date().toISOString().split('T')[0],
          visitTime: '',
          brand: '',
          department: ''
        });
      } else {
        setResult({ success: false, message: responseData.error || '新增失敗' });
      }
    } catch (error) {
      console.error('❌ 提交錯誤:', error);
      setResult({ success: false, message: '網路錯誤，請稍後再試' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Car className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">簡易新增車輛</h1>
          </div>

          {/* 結果顯示 */}
          {result && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-2 ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 車牌號碼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車牌號碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: ABC-1234"
                required
              />
            </div>

            {/* 車輛類型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">車輛類型</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="轎車">轎車</option>
                <option value="機車">機車</option>
                <option value="貨車">貨車</option>
                <option value="巴士">巴士</option>
                <option value="貴賓用車">貴賓用車</option>
                <option value="其他">其他</option>
              </select>
            </div>

            {/* 申請人姓名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申請人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.applicantName}
                onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入完整姓名"
                required
              />
            </div>

            {/* 聯絡電話 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                聯絡電話 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 0912-345-678"
                required
              />
            </div>

            {/* 身份類別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身份類別</label>
              <select
                value={formData.identityType}
                onChange={(e) => setFormData({ ...formData, identityType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="同仁">同仁</option>
                <option value="長官">長官</option>
                <option value="關係企業">關係企業</option>
                <option value="一般訪客">一般訪客</option>
                <option value="承包商">承包商</option>
              </select>
            </div>

            {/* 申請日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">申請日期</label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 到訪時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">到訪時間</label>
              <input
                type="time"
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 車輛品牌 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">車輛品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: Toyota, Honda"
              />
            </div>

            {/* 部門 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 資訊部, 業務部"
              />
            </div>

            {/* 提交按鈕 */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>新增中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>新增車輛</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 除錯資訊 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <h3 className="font-medium text-gray-700 mb-2">除錯資訊</h3>
            <div className="space-y-1 text-gray-600">
              <div>API 端點: /api/vehicles</div>
              <div>欄位對應: 根據 RAGIC_FIELD_MAPPING.md</div>
              <div>必要欄位: 車牌號碼、申請人姓名、聯絡電話</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
