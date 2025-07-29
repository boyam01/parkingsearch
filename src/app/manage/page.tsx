'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, Download, Upload, Eye, MoreHorizontal, Filter } from 'lucide-react';
import { Navigation, PageHeader } from '@/components/Navigation';
import { VehicleGrid, VehicleCard } from '@/components/VehicleCard';
import { SearchBox } from '@/components/SearchBox';
import { VehicleForm } from '@/components/VehicleForm';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import { VehicleRecord, VEHICLE_TYPES, IDENTITY_TYPES, APPROVAL_STATUS } from '@/types/vehicle';
import { cn } from '@/lib/utils';

export default function ManageVehiclesPage() {
  const {
    query,
    setQuery,
    results,
    allVehicles,
    isLoading,
    isError,
    error,
    search,
    refreshData
  } = useVehicleSearch();

  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vehicleType: '',
    identityType: '',
    approvalStatus: '',
    department: ''
  });
  const [editingVehicle, setEditingVehicle] = useState<VehicleRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 過濾車輛資料
  const filteredVehicles = (query ? results : allVehicles).filter(vehicle => {
    return (
      (!filters.vehicleType || vehicle.vehicleType === filters.vehicleType) &&
      (!filters.identityType || vehicle.identityType === filters.identityType) &&
      (!filters.approvalStatus || vehicle.approvalStatus === filters.approvalStatus) &&
      (!filters.department || vehicle.department?.includes(filters.department))
    );
  });

  // 選擇車輛
  const handleSelectVehicle = (vehicleId: string, checked: boolean) => {
    const newSelected = new Set(selectedVehicles);
    if (checked) {
      newSelected.add(vehicleId);
    } else {
      newSelected.delete(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  // 全選/取消全選
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.id)));
    } else {
      setSelectedVehicles(new Set());
    }
  };

  // 批次刪除
  const handleBatchDelete = async () => {
    if (selectedVehicles.size === 0) return;
    
    if (confirm(`確定要刪除 ${selectedVehicles.size} 筆車輛記錄嗎？此操作無法復原。`)) {
      try {
        // 這裡應該呼叫批次刪除 API
        console.log('批次刪除:', Array.from(selectedVehicles));
        await refreshData();
        setSelectedVehicles(new Set());
      } catch (error) {
        console.error('批次刪除失敗:', error);
      }
    }
  };

  // 匯出選取的車輛
  const handleExportSelected = () => {
    const selectedData = filteredVehicles.filter(v => selectedVehicles.has(v.id));
    console.log('匯出資料:', selectedData);
    // 實作 CSV 匯出功能
  };

  // 編輯車輛
  const handleEditVehicle = (vehicle: VehicleRecord) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  // 表單提交成功
  const handleFormSubmit = async (vehicle: VehicleRecord) => {
    await refreshData();
    setShowForm(false);
    setEditingVehicle(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* 頁面標題 */}
        <PageHeader
          title="車輛管理系統"
          description="管理所有車輛記錄，支援新增、編輯、刪除及批次操作"
          breadcrumbs={[
            { href: '/', label: '首頁' },
            { label: '車輛管理' }
          ]}
        />

        {/* 操作列 */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* 搜尋框 */}
          <div className="flex-1">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="搜尋車牌、申請人姓名..."
              isLoading={isLoading}
              size="md"
            />
          </div>

          {/* 操作按鈕 */}
          <div className="flex space-x-2">
            <Link
              href="/add"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新增車牌</span>
            </Link>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors',
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              <Filter className="w-5 h-5" />
              <span>篩選</span>
            </button>

            <button
              onClick={handleExportSelected}
              disabled={selectedVehicles.size === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>匯出</span>
            </button>
          </div>
        </div>

        {/* 篩選器 */}
        {showFilters && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  車型
                </label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">全部</option>
                  {Object.entries(VEHICLE_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  身份類別
                </label>
                <select
                  value={filters.identityType}
                  onChange={(e) => setFilters(prev => ({ ...prev, identityType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">全部</option>
                  {Object.entries(IDENTITY_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  審核狀態
                </label>
                <select
                  value={filters.approvalStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">全部</option>
                  {Object.entries(APPROVAL_STATUS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部門
                </label>
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="搜尋部門..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ vehicleType: '', identityType: '', approvalStatus: '', department: '' })}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                清除篩選
              </button>
            </div>
          </div>
        )}

        {/* 批次操作列 */}
        {selectedVehicles.size > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                已選取 {selectedVehicles.size} 筆記錄
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  匯出選取
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  刪除選取
                </button>
                <button
                  onClick={() => setSelectedVehicles(new Set())}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  取消選取
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 車輛列表 */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* 列表標題 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filteredVehicles.length > 0 && selectedVehicles.size === filteredVehicles.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">全選</span>
                </label>
                <span className="text-sm text-gray-600">
                  共 {filteredVehicles.length} 筆記錄
                </span>
              </div>
            </div>
          </div>

          {/* 車輛卡片列表 */}
          <div className="p-4">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">沒有找到符合條件的車輛記錄</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    {/* 選擇框 */}
                    <input
                      type="checkbox"
                      checked={selectedVehicles.has(vehicle.id)}
                      onChange={(e) => handleSelectVehicle(vehicle.id, e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* 車輛資訊 */}
                    <div className="flex-1">
                      <VehicleCard
                        vehicle={vehicle}
                        highlight={query}
                        className="border-none shadow-none p-0"
                      />
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/query/${vehicle.plate}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="檢視詳情"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                        title="編輯"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('確定要刪除此車輛記錄嗎？')) {
                            console.log('刪除車輛:', vehicle.id);
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 編輯表單彈窗 */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <VehicleForm
                initialData={editingVehicle || undefined}
                isEdit={!!editingVehicle}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
                }}
                className="p-6"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
