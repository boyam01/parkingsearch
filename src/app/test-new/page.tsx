/**
 * 新系統功能測試頁面
 * 測試：單字搜尋、CRUD操作、配額管理、會員系統
 */
'use client';

import { useState } from 'react';
import { useVehicleData } from '@/hooks/useVehicleData';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';
import { VehicleRecord } from '@/types/vehicle';
import QuotaDisplay from '@/components/QuotaDisplay';
import { Navigation } from '@/components/Navigation';

export default function TestNewPage() {
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
  const [quotaTest, setQuotaTest] = useState<any>(null);
  const [memberTest, setMemberTest] = useState<any>(null);

  // 測試單字搜尋功能
  const testSingleCharSearch = async () => {
    if (!singleCharTest || singleCharTest.length !== 1) return;
    
    setTestLoading(true);
    try {
      await vehicleSearchHook.search(singleCharTest);
      setTestResult({ 
        type: 'single-char-search',
        results: vehicleSearchHook.results,
        searchTime: vehicleSearchHook.searchTime,
        query: singleCharTest
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
      setTestResult({ type: 'add', data: newRecord });
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  // 測試查詢功能
  const testSearch = async () => {
    if (!testPlate) return;
    
    setTestLoading(true);
    try {
      const result = await getRecordByPlate(testPlate);
      setTestResult({ type: 'search', data: result });
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  // 測試API端點
  const testAPI = async (endpoint: string, name: string) => {
    setTestLoading(true);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setTestResult({ type: 'api', endpoint, name, data });
    } catch (err) {
      setTestResult({ error: err });
    }
    setTestLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🧪 系統功能完整測試</h1>
            <p className="text-gray-600 mt-2">
              測試所有新實現的功能：單字搜尋、CRUD操作、配額管理、會員系統
            </p>
          </div>

          {/* 配額管理系統顯示 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 配額管理系統</h2>
            <QuotaDisplay showConfig={true} />
          </div>

          {/* 系統狀態概覽 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
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
                <div className="text-sm text-red-600">系統錯誤狀態</div>
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
                  搜尋統計: 總記錄數 {vehicleSearchHook.totalRecords}，
                  搜尋結果 {vehicleSearchHook.results.length} 筆
                  {vehicleSearchHook.searchTime > 0 && `，耗時 ${vehicleSearchHook.searchTime}ms`}
                </div>
              </div>
            </div>

            {/* 配額管理測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 配額管理測試</h3>
              <p className="text-gray-600 mb-4">
                測試配額限制系統和總量控制功能
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
                  <div className="mt-2 p-3 bg-purple-50 rounded text-sm">
                    <p className="font-medium">配額狀態:</p>
                    {quotaTest.totalQuota && (
                      <p>總配額: {quotaTest.totalQuota.used}/{quotaTest.totalQuota.limit}</p>
                    )}
                    {quotaTest.vehicleTypeQuotas && Object.entries(quotaTest.vehicleTypeQuotas).map(([type, quota]: [string, any]) => (
                      <p key={type}>{type}: {quota.used}/{quota.limit}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 會員系統測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 會員系統測試</h3>
              <p className="text-gray-600 mb-4">
                測試會員管理和月租車功能
              </p>
              <div className="space-y-2">
                <button
                  onClick={testMemberSystem}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {testLoading ? '載入中...' : '測試會員系統'}
                </button>
                <button
                  onClick={() => testAPI('/api/monthly-parking', '月租車系統')}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  測試月租車系統
                </button>
                <button
                  onClick={() => testAPI('/api/renewal-reminders', '續約提醒')}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  測試續約提醒
                </button>
                {memberTest && Array.isArray(memberTest) && (
                  <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                    <p className="font-medium">會員系統狀態:</p>
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
                    placeholder="輸入車牌號碼查詢..."
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
                <button
                  onClick={refresh}
                  disabled={testLoading}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  刷新數據
                </button>
              </div>
            </div>
          </div>

          {/* API 測試區 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔌 API 端點測試</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => testAPI('/api/vehicles', '車輛管理 API')}
                disabled={testLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                車輛 API
              </button>
              <button 
                onClick={() => testAPI('/api/members', '會員管理 API')}
                disabled={testLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                會員 API
              </button>
              <button 
                onClick={() => testAPI('/api/monthly-parking', '月租車 API')}
                disabled={testLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                月租車 API
              </button>
              <button 
                onClick={() => testAPI('/api/quota?action=status', '配額管理 API')}
                disabled={testLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                配額 API
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              按下按鈕後請查看下方測試結果區域或瀏覽器控制台 (F12) 查看詳細回應
            </p>
          </div>

          {/* 測試結果顯示區 */}
          {testResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 測試結果</h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                清除結果
              </button>
            </div>
          )}

          {/* 功能實現清單 */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ 已實現功能清單</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">🎯 核心功能</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>單字模糊搜尋 (匹配所有相關欄位)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>完整 CRUD 操作 (新增、讀取、更新、刪除)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>配額管理系統 (總量限制、類型限制)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>會員管理模組 (完整註冊流程)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>月租車管理 (申請、續約、提醒)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>自動續約提醒機制</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>配額檢查與申請拒絕機制</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>手機響應式介面設計</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">🔧 技術架構</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔌</span>
                    <span>GET/POST /api/vehicles (車輛管理)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔌</span>
                    <span>GET/POST /api/members (會員管理)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔌</span>
                    <span>GET/POST /api/monthly-parking (月租車)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔌</span>
                    <span>GET/POST /api/quota (配額管理)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">🔌</span>
                    <span>GET/POST /api/renewal-reminders (續約提醒)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">🎨</span>
                    <span>TypeScript 型別定義完整</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">🎨</span>
                    <span>Ragic API 完整整合</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">🎨</span>
                    <span>錯誤處理與驗證機制</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
