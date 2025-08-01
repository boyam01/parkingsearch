/**
 * 數據管理頁面 - 完整的 CRUD 功能
 * 管理：車輛記錄、會員資料、月租車、配額設定
 */
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { VehicleRecord } from '@/types/vehicle';
import { MemberRecord, MonthlyParkingRecord } from '@/types/membership';
import { Plus, Edit, Trash2, Search, RefreshCw, Save, X } from 'lucide-react';

type DataType = 'vehicles' | 'members' | 'monthly-parking' | 'quota';

interface EditFormData {
  [key: string]: any;
}

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState<DataType>('vehicles');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<EditFormData>({});

  // 數據類型配置
  const dataConfigs = {
    vehicles: {
      title: '車輛記錄',
      endpoint: '/api/vehicles',
      fields: [
        { key: 'plate', label: '車牌號碼', type: 'text', required: true },
        { key: 'applicantName', label: '申請人姓名', type: 'text', required: true },
        { key: 'contactPhone', label: '聯絡電話', type: 'text', required: true },
        { key: 'vehicleType', label: '車輛類型', type: 'select', options: ['car', 'motorcycle', 'vip'], required: true },
        { key: 'identityType', label: '身份類別', type: 'select', options: ['employee', 'official', 'partner', 'visitor'], required: true },
        { key: 'brand', label: '車輛品牌', type: 'text' },
        { key: 'color', label: '車輛顏色', type: 'text' },
        { key: 'department', label: '部門', type: 'text' },
        { key: 'visitPurpose', label: '來訪目的', type: 'text' },
        { key: 'applicationDate', label: '申請日期', type: 'date', required: true },
        { key: 'approvalStatus', label: '審核狀態', type: 'select', options: ['pending', 'approved', 'rejected'], required: true },
        { key: 'notes', label: '備註', type: 'textarea' }
      ],
      displayFields: ['plate', 'applicantName', 'vehicleType', 'identityType', 'approvalStatus']
    },
    members: {
      title: '會員資料',
      endpoint: '/api/members',
      fields: [
        { key: 'name', label: '姓名', type: 'text', required: true },
        { key: 'email', label: '電子郵件', type: 'email', required: true },
        { key: 'phone', label: '聯絡電話', type: 'text', required: true },
        { key: 'membershipType', label: '會員類型', type: 'select', options: ['regular', 'vip', 'corporate'], required: true },
        { key: 'company', label: '公司名稱', type: 'text' },
        { key: 'department', label: '部門', type: 'text' },
        { key: 'address', label: '地址', type: 'textarea' },
        { key: 'emergencyContact', label: '緊急聯絡人', type: 'text' },
        { key: 'emergencyPhone', label: '緊急聯絡電話', type: 'text' },
        { key: 'registrationDate', label: '註冊日期', type: 'date', required: true },
        { key: 'status', label: '狀態', type: 'select', options: ['active', 'inactive', 'suspended'], required: true },
        { key: 'notes', label: '備註', type: 'textarea' }
      ],
      displayFields: ['name', 'email', 'membershipType', 'company', 'status']
    },
    'monthly-parking': {
      title: '月租車管理',
      endpoint: '/api/monthly-parking',
      fields: [
        { key: 'memberName', label: '會員姓名', type: 'text', required: true },
        { key: 'vehiclePlate', label: '車牌號碼', type: 'text', required: true },
        { key: 'parkingSpaceNumber', label: '車位號碼', type: 'text', required: true },
        { key: 'contractStartDate', label: '合約開始日期', type: 'date', required: true },
        { key: 'contractEndDate', label: '合約結束日期', type: 'date', required: true },
        { key: 'monthlyFee', label: '月租費用', type: 'number', required: true },
        { key: 'paymentMethod', label: '付款方式', type: 'select', options: ['cash', 'transfer', 'credit_card'], required: true },
        { key: 'paymentStatus', label: '付款狀態', type: 'select', options: ['paid', 'pending', 'overdue'], required: true },
        { key: 'autoRenewal', label: '自動續約', type: 'checkbox' },
        { key: 'contactPhone', label: '聯絡電話', type: 'text', required: true },
        { key: 'notes', label: '備註', type: 'textarea' }
      ],
      displayFields: ['memberName', 'vehiclePlate', 'parkingSpaceNumber', 'contractEndDate', 'paymentStatus']
    },
    quota: {
      title: '配額設定',
      endpoint: '/api/quota',
      fields: [
        { key: 'vehicleType', label: '車輛類型', type: 'select', options: ['car', 'motorcycle', 'vip'], required: true },
        { key: 'identityType', label: '身份類別', type: 'select', options: ['employee', 'official', 'partner', 'visitor'], required: true },
        { key: 'maxLimit', label: '最大限制', type: 'number', required: true },
        { key: 'warningThreshold', label: '警告閾值', type: 'number', required: true },
        { key: 'enabled', label: '啟用', type: 'checkbox', required: true }
      ],
      displayFields: ['vehicleType', 'identityType', 'maxLimit', 'warningThreshold', 'enabled']
    }
  };

  // 載入數據
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = dataConfigs[activeTab];
      const response = await fetch(config.endpoint);
      if (!response.ok) {
        throw new Error(`載入失敗: ${response.statusText}`);
      }
      const result = await response.json();
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入數據失敗');
      setData([]);
    }
    setLoading(false);
  };

  // 搜尋過濾
  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    const config = dataConfigs[activeTab];
    return config.displayFields.some(field => 
      item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // 新增數據
  const handleAdd = async () => {
    setLoading(true);
    try {
      const config = dataConfigs[activeTab];
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`新增失敗: ${response.statusText}`);
      }

      await loadData();
      setShowAddForm(false);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增失敗');
    }
    setLoading(false);
  };

  // 更新數據
  const handleUpdate = async () => {
    if (!editingItem) return;
    
    setLoading(true);
    try {
      const config = dataConfigs[activeTab];
      const response = await fetch(`${config.endpoint}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`更新失敗: ${response.statusText}`);
      }

      await loadData();
      setEditingItem(null);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    }
    setLoading(false);
  };

  // 刪除數據
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆記錄嗎？')) return;
    
    setLoading(true);
    try {
      const config = dataConfigs[activeTab];
      const response = await fetch(`${config.endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`刪除失敗: ${response.statusText}`);
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    }
    setLoading(false);
  };

  // 表單處理
  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({});
    setShowAddForm(false);
    setEditingItem(null);
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
  };

  // 渲染表單字段
  const renderFormField = (field: any) => {
    const value = formData[field.key] || '';
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="">請選擇...</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option === 'car' ? '轎車' :
                 option === 'motorcycle' ? '機車' :
                 option === 'vip' ? '貴賓車' :
                 option === 'employee' ? '同仁' :
                 option === 'official' ? '長官' :
                 option === 'partner' ? '關係企業' :
                 option === 'visitor' ? '一般訪客' :
                 option === 'pending' ? '待審核' :
                 option === 'approved' ? '已核准' :
                 option === 'rejected' ? '已拒絕' :
                 option === 'regular' ? '一般會員' :
                 option === 'corporate' ? '企業會員' :
                 option === 'active' ? '啟用' :
                 option === 'inactive' ? '停用' :
                 option === 'suspended' ? '暫停' :
                 option === 'cash' ? '現金' :
                 option === 'transfer' ? '轉帳' :
                 option === 'credit_card' ? '信用卡' :
                 option === 'paid' ? '已付款' :
                 option === 'overdue' ? '逾期' : option}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            required={field.required}
          />
        );
        
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleFormChange(field.key, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
        
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        );
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const currentConfig = dataConfigs[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🛠️ 數據管理系統</h1>
            <p className="text-gray-600 mt-2">
              完整的增刪改查功能，管理所有系統數據
            </p>
          </div>

          {/* 分頁標籤 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {Object.entries(dataConfigs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as DataType)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {config.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* 工具列 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    新增{currentConfig.title}
                  </button>
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    刷新
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`搜尋${currentConfig.title}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 錯誤顯示 */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* 數據表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {currentConfig.displayFields.map(field => {
                      const fieldConfig = currentConfig.fields.find(f => f.key === field);
                      return (
                        <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {fieldConfig?.label || field}
                        </th>
                      );
                    })}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={currentConfig.displayFields.length + 1} className="px-6 py-12 text-center text-gray-500">
                        載入中...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={currentConfig.displayFields.length + 1} className="px-6 py-12 text-center text-gray-500">
                        {searchQuery ? '沒有找到符合條件的記錄' : '暫無數據'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        {currentConfig.displayFields.map(field => (
                          <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof item[field] === 'boolean' ? (item[field] ? '是' : '否') : (item[field] || '-')}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="編輯"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                              title="刪除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 新增/編輯表單模態框 */}
          {(showAddForm || editingItem) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingItem ? `編輯${currentConfig.title}` : `新增${currentConfig.title}`}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentConfig.fields.map(field => (
                      <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {renderFormField(field)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex gap-4 justify-end">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={editingItem ? handleUpdate : handleAdd}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? '處理中...' : (editingItem ? '更新' : '新增')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
