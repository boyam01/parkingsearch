/**
 * 車輛管理面板 - 支援完整的讀寫操作
 */
'use client';

import { useState, useRef } from 'react';
import { useVehicleData } from '@/hooks/useVehicleData';
import { VehicleRecord } from '@/types/vehicle';

interface VehicleFormData {
  plate: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  applicantName: string;
  contactPhone: string;
  identityType: 'staff' | 'visitor' | 'contractor' | 'guest' | 'vip';
  applicationDate: string;
  visitTime?: string;
  brand?: string;
  color?: string;
  department?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'deleted';
  notes?: string;
}

export default function VehicleManagement() {
  const {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    addRecord,
    updateRecord,
    deleteRecord,
    statistics
  } = useVehicleData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState<VehicleFormData>({
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

  const formRef = useRef<HTMLFormElement>(null);

  // 過濾資料
  const filteredData = data.filter(record => {
    const matchesSearch = !searchQuery || 
      record.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.contactPhone.includes(searchQuery);
    
    const matchesFilter = filterType === 'all' || record.vehicleType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // 重置表單
  const resetForm = () => {
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
    setEditingRecord(null);
  };

  // 開始編輯
  const startEdit = (record: VehicleRecord) => {
    setFormData({
      plate: record.plate,
      vehicleType: record.vehicleType as 'car' | 'motorcycle' | 'truck',
      applicantName: record.applicantName,
      contactPhone: record.contactPhone,
      identityType: record.identityType as 'staff' | 'visitor' | 'contractor' | 'guest' | 'vip',
      applicationDate: record.applicationDate,
      visitTime: record.visitTime || '',
      brand: record.brand || '',
      color: record.color || '',
      department: record.department || '',
      approvalStatus: record.approvalStatus,
      notes: record.notes || ''
    });
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, formData);
      } else {
        await addRecord(formData);
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('操作失敗:', error);
    }
  };

  // 刪除記錄
  const handleDelete = async (id: string, plate: string) => {
    if (confirm(`確定要刪除車牌 ${plate} 的記錄嗎？`)) {
      try {
        await deleteRecord(id);
      } catch (error) {
        console.error('刪除失敗:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 統計面板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">總記錄數</h3>
          <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">本週新增</h3>
          <p className="text-2xl font-bold text-green-900">{statistics.recent}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600">待審核</h3>
          <p className="text-2xl font-bold text-yellow-900">{statistics.byStatus.pending || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600">已核准</h3>
          <p className="text-2xl font-bold text-purple-900">{statistics.byStatus.approved || 0}</p>
        </div>
      </div>

      {/* 操作工具列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ 新增車輛
          </button>
          
          <button
            onClick={refresh}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? '🔄 同步中...' : '🔄 手動同步'}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">所有車型</option>
            <option value="car">轎車</option>
            <option value="motorcycle">機車</option>
            <option value="truck">貨車</option>
          </select>

          <input
            type="text"
            placeholder="搜尋車牌、車主或電話..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 w-64"
          />
        </div>
      </div>

      {/* 狀態顯示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {lastUpdate && (
        <div className="text-sm text-gray-500">
          📅 最後更新: {lastUpdate.toLocaleString()}
        </div>
      )}

      {/* 資料表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  車牌號碼
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  車主姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  車型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  身份
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申請日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.plate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.applicantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.vehicleType === 'car' ? '轎車' : 
                     record.vehicleType === 'motorcycle' ? '機車' : '其他'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.identityType === 'staff' ? '員工' :
                     record.identityType === 'visitor' ? '訪客' : '其他'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      record.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.approvalStatus === 'approved' ? '已核准' :
                       record.approvalStatus === 'pending' ? '待審核' : '已拒絕'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.applicationDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => startEdit(record)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ✏️ 編輯
                    </button>
                    <button
                      onClick={() => handleDelete(record.id, record.plate)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ 刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {loading ? '載入中...' : '沒有找到相符的記錄'}
          </div>
        )}
      </div>

      {/* 新增/編輯模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingRecord ? '編輯車輛記錄' : '新增車輛記錄'}
            </h2>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車牌號碼 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="例：ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  申請人姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話 *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    車輛類型
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as 'car' | 'motorcycle' | 'truck' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="car">轎車</option>
                    <option value="motorcycle">機車</option>
                    <option value="truck">貨車</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    身份類別
                  </label>
                  <select
                    value={formData.identityType}
                    onChange={(e) => setFormData({ ...formData, identityType: e.target.value as 'staff' | 'visitor' | 'contractor' | 'guest' | 'vip' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="staff">員工</option>
                    <option value="visitor">訪客</option>
                    <option value="contractor">承包商</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    申請日期
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    審核狀態
                  </label>
                  <select
                    value={formData.approvalStatus}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as 'pending' | 'approved' | 'rejected' | 'deleted' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="pending">待審核</option>
                    <option value="approved">已核准</option>
                    <option value="rejected">已拒絕</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRecord ? '更新' : '新增'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
