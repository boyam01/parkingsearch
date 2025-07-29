'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Eye, User, Car, 
  Calendar, Phone, Mail, AlertTriangle, FileText,
  Filter, Search, RefreshCw
} from 'lucide-react';
import { Navigation, PageHeader } from '@/components/Navigation';
import { VehicleRecord, VEHICLE_TYPES, IDENTITY_TYPES, APPROVAL_STATUS } from '@/types/vehicle';
import { cn, formatDate, getStatusColor } from '@/lib/utils';

interface ApplicationListProps {
  className?: string;
}

export default function AdminApplicationsPage({ className }: ApplicationListProps) {
  const [applications, setApplications] = useState<VehicleRecord[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VehicleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<VehicleRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // 載入申請列表
  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/applications');
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.data.applications);
        setFilteredApplications(result.data.applications);
      }
    } catch (error) {
      console.error('載入申請列表失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 篩選和搜尋
  const filterApplications = () => {
    let filtered = applications;

    // 按狀態篩選
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.approvalStatus === selectedStatus);
    }

    // 搜尋
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(query) ||
        app.plate.toLowerCase().includes(query) ||
        app.applicantEmail?.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  // 核准申請
  const approveApplication = async (applicationId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadApplications();
        setSelectedApplication(null);
        alert('申請已核准！通知郵件將發送給申請者。');
      } else {
        alert('核准失敗：' + result.message);
      }
    } catch (error) {
      console.error('核准申請失敗:', error);
      alert('核准失敗，請稍後再試');
    } finally {
      setIsProcessing(false);
    }
  };

  // 拒絕申請
  const rejectApplication = async (applicationId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'reject', 
          rejectionReason: reason 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadApplications();
        setSelectedApplication(null);
        setShowRejectModal(false);
        setRejectionReason('');
        alert('申請已拒絕！通知郵件將發送給申請者。');
      } else {
        alert('拒絕失敗：' + result.message);
      }
    } catch (error) {
      console.error('拒絕申請失敗:', error);
      alert('拒絕失敗，請稍後再試');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, selectedStatus, searchQuery]);

  // 統計數據
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.approvalStatus === 'pending').length,
    approved: applications.filter(app => app.approvalStatus === 'approved').length,
    rejected: applications.filter(app => app.approvalStatus === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title="申請審核管理"
          description="審核和管理車輛申請，處理核准或拒絕申請"
          breadcrumbs={[
            { href: '/', label: '首頁' },
            { href: '/dashboard', label: '儀錶板' },
            { label: '申請審核' }
          ]}
          actions={
            <button
              onClick={loadApplications}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              <span>重新整理</span>
            </button>
          }
        />

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">總申請數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">待審核</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">已核准</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">已拒絕</p>
                <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* 篩選和搜尋 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋申請人、車牌、信箱或申請編號..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部狀態</option>
                  <option value="pending">待審核</option>
                  <option value="approved">已核准</option>
                  <option value="rejected">已拒絕</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 申請列表 */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              申請列表 ({filteredApplications.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">載入中...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">沒有找到符合條件的申請記錄</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => {
                const statusConfig = getStatusColor(application.approvalStatus);
                
                return (
                  <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {application.applicantName}
                          </h4>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            statusConfig.bg,
                            statusConfig.text,
                            statusConfig.border,
                            'border'
                          )}>
                            {APPROVAL_STATUS[application.approvalStatus as keyof typeof APPROVAL_STATUS]?.label}
                          </span>
                          {application.approvalStatus === 'pending' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              需要處理
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Car className="w-4 h-4" />
                            <span>{application.plate} - {VEHICLE_TYPES[application.vehicleType as keyof typeof VEHICLE_TYPES]?.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{IDENTITY_TYPES[application.identityType as keyof typeof IDENTITY_TYPES]?.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(application.applicationDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{application.contactPhone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{application.applicantEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>提交：{formatDate(application.createdAt)}</span>
                          </div>
                        </div>

                        {application.visitPurpose && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">來訪目的：</span>
                            {application.visitPurpose}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="檢視詳情"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {application.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => approveApplication(application.id)}
                              disabled={isProcessing}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                              title="核准申請"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>核准</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowRejectModal(true);
                              }}
                              disabled={isProcessing}
                              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                              title="拒絕申請"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>拒絕</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 申請詳情彈窗 */}
        {selectedApplication && !showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">申請詳情</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">申請人資訊</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium">姓名：</span>{selectedApplication.applicantName}</div>
                      <div><span className="font-medium">身份證字號：</span>{selectedApplication.applicantId}</div>
                      <div><span className="font-medium">電子郵件：</span>{selectedApplication.applicantEmail}</div>
                      <div><span className="font-medium">聯絡電話：</span>{selectedApplication.contactPhone}</div>
                      <div><span className="font-medium">身份類別：</span>{IDENTITY_TYPES[selectedApplication.identityType as keyof typeof IDENTITY_TYPES]?.label}</div>
                      {selectedApplication.department && (
                        <div><span className="font-medium">部門：</span>{selectedApplication.department}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">車輛資訊</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium">車牌號碼：</span>{selectedApplication.plate}</div>
                      <div><span className="font-medium">車輛類型：</span>{VEHICLE_TYPES[selectedApplication.vehicleType as keyof typeof VEHICLE_TYPES]?.label}</div>
                      {selectedApplication.brand && (
                        <div><span className="font-medium">車輛品牌：</span>{selectedApplication.brand}</div>
                      )}
                      {selectedApplication.color && (
                        <div><span className="font-medium">車輛顏色：</span>{selectedApplication.color}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">來訪資訊</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium">來訪目的：</span>{selectedApplication.visitPurpose}</div>
                      <div><span className="font-medium">申請日期：</span>{formatDate(selectedApplication.applicationDate)}</div>
                      {selectedApplication.visitTime && (
                        <div><span className="font-medium">到訪時間：</span>{selectedApplication.visitTime}</div>
                      )}
                      <div><span className="font-medium">預期停留：</span>{selectedApplication.expectedDuration}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">緊急聯絡人</h3>
                    <div className="space-y-3 text-sm">
                      <div><span className="font-medium">姓名：</span>{selectedApplication.emergencyContact}</div>
                      <div><span className="font-medium">電話：</span>{selectedApplication.emergencyPhone}</div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">系統資訊</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">申請編號：</span>{selectedApplication.id}</div>
                      <div><span className="font-medium">提交時間：</span>{formatDate(selectedApplication.createdAt)}</div>
                      <div><span className="font-medium">最後更新：</span>{formatDate(selectedApplication.updatedAt)}</div>
                      <div><span className="font-medium">提交方式：</span>{selectedApplication.submittedBy === 'self' ? '自助申請' : '管理員代為申請'}</div>
                      {selectedApplication.ipAddress && (
                        <div><span className="font-medium">來源 IP：</span>{selectedApplication.ipAddress}</div>
                      )}
                    </div>
                  </div>

                  {selectedApplication.notes && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">備註</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedApplication.notes}
                      </p>
                    </div>
                  )}
                </div>

                {selectedApplication.approvalStatus === 'pending' && (
                  <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowRejectModal(true);
                      }}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>拒絕申請</span>
                    </button>

                    <button
                      onClick={() => approveApplication(selectedApplication.id)}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>核准申請</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 拒絕申請彈窗 */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">拒絕申請</h2>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  您即將拒絕 <strong>{selectedApplication.applicantName}</strong> 的車輛申請。
                  請說明拒絕原因，這將會發送給申請者。
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="請輸入拒絕原因..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    取消
                  </button>

                  <button
                    onClick={() => rejectApplication(selectedApplication.id, rejectionReason)}
                    disabled={isProcessing || !rejectionReason.trim()}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>處理中...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>確認拒絕</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
