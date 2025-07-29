'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Car, User, Phone, Mail, Calendar, Clock, 
  AlertCircle, CheckCircle, Send, ArrowLeft,
  Shield, Users, Building2, FileText
} from 'lucide-react';
import { 
  ApplicationFormData, 
  ApplicationResponse,
  ValidationResult,
  VEHICLE_TYPES, 
  IDENTITY_TYPES 
} from '@/types/vehicle';
import { 
  validateApplicationForm, 
  validateField, 
  formatApplicationData
} from '@/lib/validation';
import { cn } from '@/lib/utils';

interface SelfApplicationFormProps {
  className?: string;
  onSuccess?: (applicationId: string) => void;
  onCancel?: () => void;
}

const VISIT_PURPOSES = [
  '商務洽談',
  '會議參與',
  '客戶拜訪',
  '維修服務',
  '送件/取件',
  '面試',
  '教育訓練',
  '其他'
];

const EXPECTED_DURATIONS = [
  { value: '1hour', label: '1 小時以內' },
  { value: '2hours', label: '2 小時以內' },
  { value: 'halfday', label: '半天（4 小時）' },
  { value: 'fullday', label: '全天（8 小時）' },
  { value: '2days', label: '2 天' },
  { value: '1week', label: '1 週' },
  { value: 'longterm', label: '長期（1 個月以上）' }
];

export function SelfApplicationForm({ 
  className, 
  onSuccess, 
  onCancel 
}: SelfApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ApplicationResponse | null>(null);

  // 表單資料
  const [formData, setFormData] = useState<ApplicationFormData>({
    // 車輛資訊
    plate: '',
    vehicleType: '',
    brand: '',
    color: '',
    
    // 申請人資訊
    applicantName: '',
    applicantEmail: '',
    applicantId: '',
    contactPhone: '',
    identityType: '',
    department: '',
    
    // 來訪資訊
    visitPurpose: '',
    applicationDate: new Date().toISOString().split('T')[0],
    visitTime: '',
    expectedDuration: '',
    
    // 緊急聯絡人
    emergencyContact: '',
    emergencyPhone: '',
    
    // 其他
    notes: ''
  });

  // 驗證錯誤
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 步驟驗證狀態
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({
    1: false, // 車輛資訊
    2: false, // 申請人資訊
    3: false, // 來訪資訊
    4: false  // 緊急聯絡人
  });

  // 更新表單欄位
  const updateField = (fieldName: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // 即時驗證
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  };

  // 驗證當前步驟
  const validateCurrentStep = (step: number): boolean => {
    const stepFields: Record<number, (keyof ApplicationFormData)[]> = {
      1: ['plate', 'vehicleType'],
      2: ['applicantName', 'applicantEmail', 'applicantId', 'contactPhone', 'identityType'],
      3: ['visitPurpose', 'applicationDate', 'expectedDuration'],
      4: ['emergencyContact', 'emergencyPhone']
    };

    const fieldsToValidate = stepFields[step] || [];
    let isValid = true;
    const newErrors: Record<string, string> = {};

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field] as string);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // 下一步
  const nextStep = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  // 上一步
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // 提交表單
  const handleSubmit = async () => {
    // 完整表單驗證
    const validation = validateApplicationForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      // 跳轉到第一個有錯誤的步驟
      const errorFields = Object.keys(validation.errors);
      if (errorFields.includes('plate') || errorFields.includes('vehicleType')) {
        setCurrentStep(1);
      } else if (errorFields.some(f => ['applicantName', 'applicantEmail', 'applicantId', 'contactPhone', 'identityType'].includes(f))) {
        setCurrentStep(2);
      } else if (errorFields.some(f => ['visitPurpose', 'applicationDate', 'expectedDuration'].includes(f))) {
        setCurrentStep(3);
      } else if (errorFields.some(f => ['emergencyContact', 'emergencyPhone'].includes(f))) {
        setCurrentStep(4);
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 格式化申請資料
      const applicationData = formatApplicationData(formData);
      
      // 提交到 API
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const result: ApplicationResponse = await response.json();
      
      if (result.success) {
        setSubmitResult(result);
        setCurrentStep(5); // 成功頁面
        
        if (onSuccess && result.applicationId) {
          onSuccess(result.applicationId);
        }
      } else {
        setSubmitResult(result);
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('提交申請失敗:', error);
      setSubmitResult({
        success: false,
        message: '系統錯誤，請稍後再試或聯繫管理員'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 步驟指示器
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            currentStep >= step 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          )}>
            {step}
          </div>
          {step < 4 && (
            <div className={cn(
              'w-16 h-1 mx-2',
              currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // 步驟標題
  const stepTitles = {
    1: '車輛資訊',
    2: '申請人資訊',
    3: '來訪資訊',
    4: '緊急聯絡人',
    5: '申請完成'
  };

  // 渲染步驟 1：車輛資訊
  const renderVehicleInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Car className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">車輛資訊</h2>
        <p className="text-gray-600">請填寫您的車輛相關資訊</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            車牌號碼 *
          </label>
          <input
            type="text"
            value={formData.plate}
            onChange={(e) => updateField('plate', e.target.value.toUpperCase())}
            placeholder="例：ABC-1234"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.plate ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.plate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.plate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            車輛類型 *
          </label>
          <select
            value={formData.vehicleType}
            onChange={(e) => updateField('vehicleType', e.target.value)}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.vehicleType ? 'border-red-500' : 'border-gray-300'
            )}
          >
            <option value="">請選擇車輛類型</option>
            {Object.entries(VEHICLE_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {errors.vehicleType && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.vehicleType}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            車輛品牌
          </label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => updateField('brand', e.target.value)}
            placeholder="例：Toyota、Honda"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            車輛顏色
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => updateField('color', e.target.value)}
            placeholder="例：白色、黑色"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  // 渲染步驟 2：申請人資訊
  const renderApplicantInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">申請人資訊</h2>
        <p className="text-gray-600">請填寫您的個人資訊</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            姓名 *
          </label>
          <input
            type="text"
            value={formData.applicantName}
            onChange={(e) => updateField('applicantName', e.target.value)}
            placeholder="請輸入真實姓名"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.applicantName ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.applicantName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.applicantName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            身份證字號 *
          </label>
          <input
            type="text"
            value={formData.applicantId}
            onChange={(e) => updateField('applicantId', e.target.value.toUpperCase())}
            placeholder="例：A123456789"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.applicantId ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.applicantId && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.applicantId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電子郵件 *
          </label>
          <input
            type="email"
            value={formData.applicantEmail}
            onChange={(e) => updateField('applicantEmail', e.target.value)}
            placeholder="example@email.com"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.applicantEmail ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.applicantEmail && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.applicantEmail}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            聯絡電話 *
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => updateField('contactPhone', e.target.value)}
            placeholder="例：0912-345-678"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.contactPhone ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.contactPhone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            身份類別 *
          </label>
          <select
            value={formData.identityType}
            onChange={(e) => updateField('identityType', e.target.value)}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.identityType ? 'border-red-500' : 'border-gray-300'
            )}
          >
            <option value="">請選擇身份類別</option>
            {Object.entries(IDENTITY_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {errors.identityType && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.identityType}
            </p>
          )}
        </div>

        {formData.identityType === 'staff' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              部門 *
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="請輸入您的部門"
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.department ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.department}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // 渲染步驟 3：來訪資訊
  const renderVisitInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">來訪資訊</h2>
        <p className="text-gray-600">請填寫您的來訪相關資訊</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            來訪目的 *
          </label>
          <select
            value={formData.visitPurpose}
            onChange={(e) => updateField('visitPurpose', e.target.value)}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.visitPurpose ? 'border-red-500' : 'border-gray-300'
            )}
          >
            <option value="">請選擇來訪目的</option>
            {VISIT_PURPOSES.map((purpose) => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>
          {formData.visitPurpose === '其他' && (
            <input
              type="text"
              placeholder="請說明其他來訪目的"
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => updateField('visitPurpose', e.target.value)}
            />
          )}
          {errors.visitPurpose && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.visitPurpose}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            申請日期 *
          </label>
          <input
            type="date"
            value={formData.applicationDate}
            onChange={(e) => updateField('applicationDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.applicationDate ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.applicationDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.applicationDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            預計到訪時間
          </label>
          <input
            type="time"
            value={formData.visitTime}
            onChange={(e) => updateField('visitTime', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            預期停留時間 *
          </label>
          <select
            value={formData.expectedDuration}
            onChange={(e) => updateField('expectedDuration', e.target.value)}
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.expectedDuration ? 'border-red-500' : 'border-gray-300'
            )}
          >
            <option value="">請選擇預期停留時間</option>
            {EXPECTED_DURATIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.expectedDuration && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.expectedDuration}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // 渲染步驟 4：緊急聯絡人
  const renderEmergencyContactStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">緊急聯絡人</h2>
        <p className="text-gray-600">請提供緊急狀況的聯絡人資訊</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">重要提醒</p>
            <p>緊急聯絡人不能與申請人為同一人，且聯絡電話也必須不同。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            緊急聯絡人姓名 *
          </label>
          <input
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => updateField('emergencyContact', e.target.value)}
            placeholder="請輸入緊急聯絡人姓名"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.emergencyContact && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.emergencyContact}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            緊急聯絡電話 *
          </label>
          <input
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => updateField('emergencyPhone', e.target.value)}
            placeholder="例：0912-345-678"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.emergencyPhone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.emergencyPhone}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備註
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="其他需要說明的事項（選填）"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.notes}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            剩餘字數：{500 - (formData.notes?.length || 0)}
          </p>
        </div>
      </div>

      {/* 申請摘要 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">申請摘要</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">車牌號碼：</span>
            <span className="text-gray-900">{formData.plate || '未填寫'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">申請人：</span>
            <span className="text-gray-900">{formData.applicantName || '未填寫'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">身份類別：</span>
            <span className="text-gray-900">
              {formData.identityType ? IDENTITY_TYPES[formData.identityType as keyof typeof IDENTITY_TYPES]?.label : '未選擇'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">申請日期：</span>
            <span className="text-gray-900">{formData.applicationDate || '未選擇'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染成功頁面
  const renderSuccessStep = () => (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">申請提交成功！</h2>
      
      {submitResult && submitResult.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            申請資訊
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <div>
              <span className="font-medium">申請編號：</span>
              <span className="bg-green-100 px-2 py-1 rounded font-mono">
                {submitResult.applicationId}
              </span>
            </div>
            <div>
              <span className="font-medium">提交時間：</span>
              <span>{submitResult.submissionTime || new Date().toLocaleString('zh-TW')}</span>
            </div>
            <div>
              <span className="font-medium">申請狀態：</span>
              <span className="text-yellow-700 font-medium">待審核</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📧 後續流程
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✅ 確認郵件已發送至您的信箱</li>
          <li>⏳ 管理員將在 1-2 個工作天內審核</li>
          <li>📩 審核結果將透過電子郵件通知</li>
          <li>🚗 申請核准後即可使用停車權限</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首頁
        </button>
        <button
          onClick={() => {
            setCurrentStep(1);
            setFormData({
              plate: '', vehicleType: '', brand: '', color: '',
              applicantName: '', applicantEmail: '', applicantId: '', contactPhone: '', identityType: '', department: '',
              visitPurpose: '', applicationDate: new Date().toISOString().split('T')[0], visitTime: '', expectedDuration: '',
              emergencyContact: '', emergencyPhone: '', notes: ''
            });
            setErrors({});
            setSubmitResult(null);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          再次申請
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn('max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg', className)}>
      {currentStep < 5 && <StepIndicator />}
      
      {/* 步驟標題 */}
      {currentStep < 5 && (
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">
            步驟 {currentStep} / 4
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {stepTitles[currentStep as keyof typeof stepTitles]}
          </h1>
        </div>
      )}

      {/* 表單內容 */}
      <div className="mb-8">
        {currentStep === 1 && renderVehicleInfoStep()}
        {currentStep === 2 && renderApplicantInfoStep()}
        {currentStep === 3 && renderVisitInfoStep()}
        {currentStep === 4 && renderEmergencyContactStep()}
        {currentStep === 5 && renderSuccessStep()}
      </div>

      {/* 錯誤訊息 */}
      {!submitResult?.success && submitResult?.message && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">提交失敗</p>
              <p className="text-sm text-red-700">{submitResult.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 操作按鈕 */}
      {currentStep < 5 && (
        <div className="flex justify-between items-center">
          <button
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="flex items-center space-x-2 px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? '取消' : '上一步'}</span>
          </button>

          <div className="flex space-x-4">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        </div>
      )}
    </div>
  );
}
