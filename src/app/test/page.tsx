/**
 * 測試頁面 - 驗證所有新功能
 * 包含：單字搜尋、CRUD操作、配額管理、會員系統
 */
'use client';

import { useState } from 'react';
import { useVehicleData } from '@/hooks/useVehicleData';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import { VehicleRecord } from '@/types/vehicle';
import QuotaDisplay from '@/components/QuotaDisplay';
import { Navigation } from '@/components/Navigation';

export default function TestPage() {
  const {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    addRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    getRecordByPlate,
    statistics
  } = useVehicleData();

  const vehicleSearchHook = useVehicleSearch();

  const [testPlate, setTestPlate] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [singleCharTest, setSingleCharTest] = useState('');
  const [singleCharResults, setSingleCharResults] = useState<VehicleRecord[]>([]);
  const [quotaTest, setQuotaTest] = useState<any>(null);
  const [memberTest, setMemberTest] = useState<any>(null);

  // 測試查詢功能
  const testSearch = async () => {
    if (!testPlate) return;
    
    setTestLoading(true);
    try {
      const result = await getRecordByPlate(testPlate);
      setTestResult(result);
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  // 測試單字搜尋功能
  const testSingleCharSearch = async () => {
    if (!singleCharTest || singleCharTest.length !== 1) return;
    
    setTestLoading(true);
    try {
      await vehicleSearchHook.search(singleCharTest);
      setSingleCharResults(vehicleSearchHook.results);
      setTestResult({ 
        type: 'single-char-search',
        results: vehicleSearchHook.results,
        searchTime: vehicleSearchHook.searchTime
      });
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  // 測試配額管理功能
  const testQuotaManagement = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/quota?action=status');
      const quotaStatus = await response.json();
      setQuotaTest(quotaStatus);
      setTestResult({ type: 'quota', data: quotaStatus });
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  // 測試會員系統功能
  const testMemberSystem = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/members');
      const members = await response.json();
      setMemberTest(members);
      setTestResult({ type: 'members', data: members });
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  // 測試新增功能
  const testAdd = async () => {
    setTestLoading(true);
    try {
      const newRecord = await addRecord({
        plate: `TEST-${Date.now().toString().slice(-4)}`,
        vehicleType: 'car',
        applicantName: '測試用戶',
        contactPhone: '0912345678',
        identityType: 'visitor',
        applicationDate: new Date().toISOString().split('T')[0],
        approvalStatus: 'pending',
        notes: '自動化測試記錄'
      });
      setTestResult(newRecord);
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🧪 系統功能測試頁面
            </h1>
            <p className="text-gray-600 mt-2">
              測試所有新功能：單字搜尋、CRUD操作、配額管理、會員系統
            </p>
          </div>

          {/* 配額狀態顯示 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 配額管理系統</h2>
            <QuotaDisplay showConfig={true} />
          </div>

          {/* 即時狀態 - 整合兩個系統的數據 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 系統即時狀態</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">車輛數據載入</div>
                <div className="text-lg font-bold text-blue-900">
                  {loading ? '🔄 載入中' : '✅ 已載入'}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">車輛記錄總數</div>
                <div className="text-lg font-bold text-green-900">{statistics.total}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">搜尋系統狀態</div>
                <div className="text-lg font-bold text-purple-900">
                  {vehicleSearchHook.isDataLoaded ? '✅ 就緒' : '⚠️ 準備中'}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">錯誤狀態</div>
                <div className="text-lg font-bold text-red-900">
                  {error || vehicleSearchHook.isError ? '❌ 有錯誤' : '✅ 正常'}
                </div>
              </div>
            </div>
            
            {(error || vehicleSearchHook.error) && (
              <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">錯誤信息:</p>
                <p className="text-red-600">{error || vehicleSearchHook.error}</p>
              </div>
            )}
          </div>

          {/* 功能測試區域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* 單字搜尋測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 單字搜尋測試</h3>
              <p className="text-gray-600 mb-4">
                輸入單個字符測試搜尋功能，會匹配車牌、姓名、車型等所有相關欄位
              </p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="輸入單個字符..."
                    value={singleCharTest}
                    onChange={(e) => setSingleCharTest(e.target.value.slice(0, 1))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={1}
                  />
                  <button
                    onClick={testSingleCharSearch}
                    disabled={testLoading || !singleCharTest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {testLoading ? '搜尋中...' : '搜尋'}
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {singleCharResults.length > 0 && (
                    <p>找到 {singleCharResults.length} 筆記錄</p>
                  )}
                </div>
              </div>
            </div>

            {/* 配額管理測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 配額管理測試</h3>
              <p className="text-gray-600 mb-4">
                測試配額限制系統，檢查總量和類型限制
              </p>
              <div className="space-y-2">
                <button
                  onClick={testQuotaManagement}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {testLoading ? '檢查中...' : '檢查配額狀態'}
                </button>
                {quotaTest && (
                  <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                    <p>總配額: {quotaTest.totalQuota?.used || 0}/{quotaTest.totalQuota?.limit || 0}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 會員系統測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 會員系統測試</h3>
              <p className="text-gray-600 mb-4">
                測試會員管理功能，包含月租車管理
              </p>
              <div className="space-y-2">
                <button
                  onClick={testMemberSystem}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {testLoading ? '載入中...' : '測試會員系統'}
                </button>
                {memberTest && Array.isArray(memberTest) && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <p>會員總數: {memberTest.length}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CRUD 功能測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 CRUD 功能測試</h3>
              <p className="text-gray-600 mb-4">
                測試完整的新增、讀取、更新、刪除功能
              </p>
              <div className="space-y-2">
                <button
                  onClick={testAdd}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {testLoading ? '新增中...' : '測試新增記錄'}
                </button>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="輸入車牌號碼..."
                    value={testPlate}
                    onChange={(e) => setTestPlate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={testSearch}
                    disabled={testLoading || !testPlate}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    查詢
                  </button>
                </div>
              </div>
            </div>
          </div>
              <div className="text-red-700 font-semibold">錯誤訊息:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>

        {/* 操作測試 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 功能測試</h2>
          
          <div className="space-y-4">
            {/* 刷新測試 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={refresh}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '🔄 刷新中...' : '🔄 手動刷新'}
              </button>
              <span className="text-gray-600">強制重新獲取 Ragic 資料</span>
            </div>

            {/* 查詢測試 */}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="輸入車牌號碼..."
                value={testPlate}
                onChange={(e) => setTestPlate(e.target.value)}
                className="border rounded-lg px-3 py-2 w-48"
              />
              <button
                onClick={testSearch}
                disabled={testLoading || !testPlate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {testLoading ? '🔍 查詢中...' : '🔍 測試查詢'}
              </button>
              <span className="text-gray-600">測試車牌查詢功能</span>
            </div>

            {/* 新增測試 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={testAdd}
                disabled={testLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {testLoading ? '➕ 新增中...' : '➕ 測試新增'}
              </button>
              <span className="text-gray-600">新增測試記錄到 Ragic</span>
            </div>
          </div>
        </div>

        {/* 測試結果 */}
        {testResult && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 測試結果</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* 資料預覽 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📄 資料預覽</h2>
          
          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {loading ? '載入中...' : '沒有資料'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      車牌
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      車主
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      電話
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      類型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      狀態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(0, 10).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.plate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.applicantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.contactPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.vehicleType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          record.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {data.length > 10 && (
                <div className="text-center py-4 text-gray-500">
                  還有 {data.length - 10} 筆資料...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
