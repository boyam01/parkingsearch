'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, User, Phone, Mail, Calendar, CreditCard,
  AlertCircle, CheckCircle, Send, ArrowLeft, Plus, Trash2,
  Shield, Users, Building2, FileText, Clock
} from 'lucide-react';
import { 
  MemberApplicationForm, 
  MEMBERSHIP_TYPES, 
  PAYMENT_METHODS 
} from '@/types/membership';
import { cn } from '@/lib/utils';

interface MembershipApplicationProps {
  className?: string;
  onSuccess?: (memberId: string) => void;
  onCancel?: () => void;
}

const VEHICLE_TYPES = [
  { value: 'car', label: '汽車' },
  { value: 'motorcycle', label: '機車' },
  { value: 'truck', label: '卡車' }
];

export default function MembershipApplication({ 
  className, 
  onSuccess, 
  onCancel 
}: MembershipApplicationProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MemberApplicationForm>({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    department: '',
    position: '',
    membershipType: 'monthly',
    vehicleQuota: 1,
    vehicles: [{
      plate: '',
      vehicleType: 'car',
      brand: '',
      color: '',
      model: ''
    }],
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: '',
    monthlyFee: 1500,
    paymentMethod: 'transfer',
    notes: ''
  });

  // 計算合約結束日期
  useEffect(() => {
    if (formData.contractStartDate && formData.membershipType) {
      const startDate = new Date(formData.contractStartDate);
      const endDate = new Date(startDate);
      
      switch (formData.membershipType) {
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'yearly':
          endDate.setFullYear(startDate.getFullYear() + 1);
          break;
        case 'permanent':
          endDate.setFullYear(startDate.getFullYear() + 99);
          break;
      }
      
      setFormData(prev => ({
        ...prev,
        contractEndDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.contractStartDate, formData.membershipType]);

  // 計算月租費用
  useEffect(() => {
    let baseFee = 1500; // 基本費用
    
    switch (formData.membershipType) {
      case 'monthly':
        baseFee = 1500;
        break;
      case 'yearly':
        baseFee = 1200; // 年租有折扣
        break;
      case 'permanent':
        baseFee = 1000; // 永久會員有更多折扣
        break;
    }
    
    // 根據車輛配額調整費用
    const totalFee = baseFee * formData.vehicleQuota;
    
    setFormData(prev => ({
      ...prev,
      monthlyFee: totalFee
    }));
  }, [formData.membershipType, formData.vehicleQuota]);

  // 更新表單欄位
  const updateField = (fieldName: keyof MemberApplicationForm, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // 清除對應的錯誤
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // 新增車輛
  const addVehicle = () => {
    if (formData.vehicles.length < formData.vehicleQuota) {
      setFormData(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, {
          plate: '',
          vehicleType: 'car',
          brand: '',
          color: '',
          model: ''
        }]
      }));
    }
  };

  // 移除車輛
  const removeVehicle = (index: number) => {
    if (formData.vehicles.length > 1) {
      setFormData(prev => ({
        ...prev,
        vehicles: prev.vehicles.filter((_, i) => i !== index)
      }));
    }
  };

  // 更新車輛資訊
  const updateVehicle = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, i) => 
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    }));
  };

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 基本資訊驗證
    if (!formData.name.trim()) newErrors.name = '請輸入姓名';
    if (!formData.email.trim()) newErrors.email = '請輸入電子郵件';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件格式';
    }
    if (!formData.phone.trim()) newErrors.phone = '請輸入聯絡電話';
    if (!formData.idNumber.trim()) newErrors.idNumber = '請輸入身份證字號或員工編號';

    // 車輛資訊驗證
    formData.vehicles.forEach((vehicle, index) => {
      if (!vehicle.plate.trim()) {
        newErrors[`vehicle_${index}_plate`] = '請輸入車牌號碼';
      }
    });

    // 合約資訊驗證
    if (!formData.contractStartDate) newErrors.contractStartDate = '請選擇合約開始日期';
    if (formData.monthlyFee <= 0) newErrors.monthlyFee = '月租費用必須大於 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表單
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentStep(4); // 成功頁面
        if (onSuccess && result.data.id) {
          onSuccess(result.data.id);
        }
      } else {
        setErrors({ submit: result.error || '申請失敗，請稍後再試' });
      }
    } catch (error) {
      console.error('提交申請失敗:', error);
      setErrors({ submit: '網路錯誤，請稍後再試' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 步驟導航
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // 渲染步驟 1: 基本資訊
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            姓名 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.name ? "border-red-500" : "border-gray-300"
            )}
            placeholder="請輸入您的姓名"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            電子郵件 *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.email ? "border-red-500" : "border-gray-300"
            )}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            聯絡電話 *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.phone ? "border-red-500" : "border-gray-300"
            )}
            placeholder="0912-345-678"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            身份證字號/員工編號 *
          </label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => updateField('idNumber', e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.idNumber ? "border-red-500" : "border-gray-300"
            )}
            placeholder="A123456789 或 EMP001"
          />
          {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            部門
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => updateField('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="請輸入部門名稱"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            職位
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => updateField('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="請輸入職位"
          />
        </div>
      </div>
    </div>
  );

  // 渲染步驟 2: 會員資訊
  const renderMembershipInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            會員類型 *
          </label>
          <select
            value={formData.membershipType}
            onChange={(e) => updateField('membershipType', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(MEMBERSHIP_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            車輛配額 *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={formData.vehicleQuota}
            onChange={(e) => updateField('vehicleQuota', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">最多可申請 5 個車位</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            合約開始日期 *
          </label>
          <input
            type="date"
            value={formData.contractStartDate}
            onChange={(e) => updateField('contractStartDate', e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.contractStartDate ? "border-red-500" : "border-gray-300"
            )}
          />
          {errors.contractStartDate && <p className="text-red-500 text-sm mt-1">{errors.contractStartDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            合約結束日期
          </label>
          <input
            type="date"
            value={formData.contractEndDate}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">根據會員類型自動計算</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-1" />
            付款方式 *
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => updateField('paymentMethod', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            月租費用
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">NT$</span>
            <input
              type="number"
              value={formData.monthlyFee}
              readOnly
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">根據會員類型和車輛配額自動計算</p>
        </div>
      </div>
    </div>
  );

  // 渲染步驟 3: 車輛資訊
  const renderVehicleInfo = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">車輛資訊</h3>
        {formData.vehicles.length < formData.vehicleQuota && (
          <button
            type="button"
            onClick={addVehicle}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>新增車輛</span>
          </button>
        )}
      </div>

      {formData.vehicles.map((vehicle, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">車輛 {index + 1}</h4>
            {formData.vehicles.length > 1 && (
              <button
                type="button"
                onClick={() => removeVehicle(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4 inline mr-1" />
                車牌號碼 *
              </label>
              <input
                type="text"
                value={vehicle.plate}
                onChange={(e) => updateVehicle(index, 'plate', e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  errors[`vehicle_${index}_plate`] ? "border-red-500" : "border-gray-300"
                )}
                placeholder="ABC-1234"
              />
              {errors[`vehicle_${index}_plate`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`vehicle_${index}_plate`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                車輛類型 *
              </label>
              <select
                value={vehicle.vehicleType}
                onChange={(e) => updateVehicle(index, 'vehicleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {VEHICLE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                車輛品牌
              </label>
              <input
                type="text"
                value={vehicle.brand}
                onChange={(e) => updateVehicle(index, 'brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Toyota, Honda, BMW..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                車輛顏色
              </label>
              <input
                type="text"
                value={vehicle.color}
                onChange={(e) => updateVehicle(index, 'color', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="白色, 黑色, 銀色..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                車型
              </label>
              <input
                type="text"
                value={vehicle.model}
                onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Camry, Civic, X3..."
              />
            </div>
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          備註
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="其他特殊需求或說明..."
        />
      </div>
    </div>
  );

  // 渲染成功頁面
  const renderSuccess = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 mb-2">申請成功！</h3>
      <p className="text-gray-600 mb-6">
        您的會員申請已成功提交，我們將在 1-2 個工作天內審核並聯繫您。
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">申請摘要</h4>
        <div className="text-left space-y-1 text-sm text-gray-600">
          <p><strong>姓名：</strong>{formData.name}</p>
          <p><strong>會員類型：</strong>{MEMBERSHIP_TYPES[formData.membershipType]}</p>
          <p><strong>車輛配額：</strong>{formData.vehicleQuota} 個車位</p>
          <p><strong>月租費用：</strong>NT$ {formData.monthlyFee}</p>
          <p><strong>合約期間：</strong>{formData.contractStartDate} ~ {formData.contractEndDate}</p>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push('/membership')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          查看會員資料
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          返回首頁
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* 步驟指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= step 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-500"
              )}>
                {step}
              </div>
              {step < 4 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  currentStep > step ? "bg-blue-600" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-600">
            {currentStep === 1 && "基本資訊"}
            {currentStep === 2 && "會員資訊"}
            {currentStep === 3 && "車輛資訊"}
            {currentStep === 4 && "申請完成"}
          </span>
        </div>
      </div>

      {/* 表單內容 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {currentStep === 1 && renderBasicInfo()}
        {currentStep === 2 && renderMembershipInfo()}
        {currentStep === 3 && renderVehicleInfo()}
        {currentStep === 4 && renderSuccess()}

        {/* 錯誤訊息 */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* 按鈕 */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={currentStep === 1 ? (onCancel || (() => router.back())) : prevStep}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? '取消' : '上一步'}</span>
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>下一步</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>提交申請</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
