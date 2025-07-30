'use client';

import React, { useState } from 'react';
import { Car, User, Phone, Calendar, Clock, Building, Palette, FileText, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { VehicleRecord, IDENTITY_TYPES, VEHICLE_TYPES, APPROVAL_STATUS } from '@/types/vehicle';
import { VehicleAPI } from '@/lib/api';
import { cn, validatePlate, validatePhone, formatPlate, formatPhone } from '@/lib/utils';

export interface VehicleFormProps {
  initialData?: Partial<VehicleRecord>;
  onSubmit?: (vehicle: VehicleRecord) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  className?: string;
}

export function VehicleForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  className
}: VehicleFormProps) {
  const [formData, setFormData] = useState({
    plate: initialData?.plate || '',
    vehicleType: initialData?.vehicleType || 'car',
    applicantName: initialData?.applicantName || '',
    contactPhone: initialData?.contactPhone || '',
    identityType: initialData?.identityType || 'visitor',
    applicationDate: initialData?.applicationDate || new Date().toISOString().split('T')[0],
    visitTime: initialData?.visitTime || '',
    brand: initialData?.brand || '',
    color: initialData?.color || '',
    department: initialData?.department || '',
    approvalStatus: initialData?.approvalStatus || 'pending',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // 處理輸入變更
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // 即時驗證
    if (field === 'plate' && value) {
      if (!validatePlate(value)) {
        setErrors(prev => ({ ...prev, plate: '車牌號碼格式不正確' }));
      }
    }

    if (field === 'contactPhone' && value) {
      if (!validatePhone(value)) {
        setErrors(prev => ({ ...prev, contactPhone: '電話號碼格式不正確' }));
      }
    }
  };

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必填欄位驗證
    if (!formData.plate.trim()) {
      newErrors.plate = '車牌號碼為必填欄位';
    } else if (!validatePlate(formData.plate)) {
      newErrors.plate = '車牌號碼格式不正確';
    }

    if (!formData.applicantName.trim()) {
      newErrors.applicantName = '申請人姓名為必填欄位';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = '聯絡電話為必填欄位';
    } else if (!validatePhone(formData.contactPhone)) {
      newErrors.contactPhone = '電話號碼格式不正確';
    }

    if (!formData.applicationDate) {
      newErrors.applicationDate = '申請日期為必填欄位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const vehicleData = {
        ...formData,
        plate: formatPlate(formData.plate),
        contactPhone: formatPhone(formData.contactPhone),
        applicantName: formData.applicantName.trim(),
        brand: formData.brand.trim(),
        color: formData.color.trim(),
        department: formData.department.trim(),
        notes: formData.notes.trim()
      };

      let result: VehicleRecord;

      if (isEdit && initialData?.id) {
        result = await VehicleAPI.updateVehicle(initialData.id, vehicleData);
      } else {
        result = await VehicleAPI.createVehicle(vehicleData);
      }

      setSubmitStatus('success');
      setSubmitMessage(isEdit ? '車輛記錄更新成功！' : '車輛記錄新增成功！');
      
      if (onSubmit) {
        onSubmit(result);
      }

      // 如果是新增，清空表單
      if (!isEdit) {
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
          approvalStatus: 'pending',
          notes: ''
        });
      }
    } catch (error) {
      console.error('提交表單錯誤:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : '提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* 表單標題 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isEdit ? '編輯車輛記錄' : '新增車輛記錄'}
        </h2>
        <p className="text-gray-600">
          請填寫完整的車輛申請資訊
        </p>
      </div>

      {/* 提交狀態提示 */}
      {submitStatus !== 'idle' && (
        <div className={cn(
          'mb-6 p-4 rounded-lg border',
          submitStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center space-x-2">
            {submitStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={cn(
              'font-medium',
              submitStatus === 'success' ? 'text-green-800' : 'text-red-800'
            )}>
              {submitMessage}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>基本資訊</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 車牌號碼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車牌號碼 *
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                placeholder="請輸入車牌號碼"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.plate ? 'border-red-300' : 'border-gray-300'
                )}
                maxLength={20}
              />
              {errors.plate && (
                <p className="mt-1 text-sm text-red-600">{errors.plate}</p>
              )}
            </div>

            {/* 車型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車型 *
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(VEHICLE_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* 車輛品牌 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車輛品牌
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="例：Toyota"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 車輛顏色 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                車輛顏色
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="例：白色"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 申請人資訊 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>申請人資訊</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 申請人姓名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申請人姓名 *
              </label>
              <input
                type="text"
                value={formData.applicantName}
                onChange={(e) => handleInputChange('applicantName', e.target.value)}
                placeholder="請輸入姓名"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.applicantName ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.applicantName && (
                <p className="mt-1 text-sm text-red-600">{errors.applicantName}</p>
              )}
            </div>

            {/* 聯絡電話 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                聯絡電話 *
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="例：0912-345-678"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.contactPhone ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
              )}
            </div>

            {/* 身份類別 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                身份類別 *
              </label>
              <select
                value={formData.identityType}
                onChange={(e) => handleInputChange('identityType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(IDENTITY_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* 部門/單位 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部門/單位
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="例：資訊部"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 申請資訊 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>申請資訊</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 申請日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                申請日期 *
              </label>
              <input
                type="date"
                value={formData.applicationDate}
                onChange={(e) => handleInputChange('applicationDate', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.applicationDate ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.applicationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.applicationDate}</p>
              )}
            </div>

            {/* 到訪時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到訪時間
              </label>
              <input
                type="time"
                value={formData.visitTime}
                onChange={(e) => handleInputChange('visitTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 審核狀態 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                審核狀態
              </label>
              <select
                value={formData.approvalStatus}
                onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(APPROVAL_STATUS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 備註 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>備註</span>
          </h3>

          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="請輸入其他相關資訊或特殊需求..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 inline mr-2" />
              取消
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center space-x-2'
            )}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? '處理中...' : (isEdit ? '更新' : '新增')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
