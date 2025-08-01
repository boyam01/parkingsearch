'use client';

import { useState, useEffect } from 'react';
import { RagicAPI } from '@/lib/api';

export default function EmergencyTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [plateAnalysis, setPlateAnalysis] = useState<any>(null);

  const runFullTest = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // 測試 1: 環境變數檢查
      results.env = {
        RAGIC_API_KEY: process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '✅ 已設定' : '❌ 未設定',
        RAGIC_BASE_URL: process.env.NEXT_PUBLIC_RAGIC_BASE_URL || '❌ 未設定',
        RAGIC_ACCOUNT: process.env.NEXT_PUBLIC_RAGIC_ACCOUNT || '❌ 未設定',
        RAGIC_FORM_ID: process.env.NEXT_PUBLIC_RAGIC_FORM_ID || '❌ 未設定',
        RAGIC_SUBTABLE_ID: process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID || '❌ 未設定'
      };

      // 測試 2: API 連接測試和車牌分析
      try {
        const apiResponse = await fetch('/api/vehicles');
        const apiData = await apiResponse.json();
        results.api = {
          status: apiResponse.ok ? '✅ 成功' : '❌ 失敗',
          statusCode: apiResponse.status,
          recordCount: apiData.success ? apiData.data.length : 0,
          error: apiData.error || null,
          sampleData: apiData.success && apiData.data.length > 0 ? apiData.data[0] : null
        };

        // 🔥 新增：車牌欄位詳細分析
        if (apiData.success && apiData.data.length > 0) {
          const records = apiData.data;
          const platesWithData = records.filter((r: any) => r.plate && r.plate.trim() !== '');
          const platesEmpty = records.filter((r: any) => !r.plate || r.plate.trim() === '');
          
          setPlateAnalysis({
            total: records.length,
            withPlates: platesWithData.length,
            emptyPlates: platesEmpty.length,
            plateExamples: platesWithData.slice(0, 5).map((r: any) => ({ 
              plate: r.plate, 
              applicant: r.applicantName,
              id: r.id 
            })),
            emptyExamples: platesEmpty.slice(0, 5).map((r: any) => ({ 
              applicant: r.applicantName,
              id: r.id,
              type: r.vehicleType 
            }))
          });
        }
      } catch (error) {
        results.api = {
          status: '❌ 連接失敗',
          error: error instanceof Error ? error.message : '未知錯誤'
        };
      }

      // 測試 3: 直接 Ragic 測試
      try {
        const ragicUrl = `https://ap7.ragic.com/xinsheng/ragicforms31/6?api&APIKey=${encodeURIComponent(process.env.NEXT_PUBLIC_RAGIC_API_KEY || '')}`;
        const ragicResponse = await fetch(ragicUrl);
        const ragicData = await ragicResponse.json();
        
        results.ragic = {
          status: ragicResponse.ok ? '✅ 成功' : '❌ 失敗',
          statusCode: ragicResponse.status,
          dataType: typeof ragicData,
          isArray: Array.isArray(ragicData),
          keys: typeof ragicData === 'object' ? Object.keys(ragicData) : [],
          recordCount: Array.isArray(ragicData) ? ragicData.length : (typeof ragicData === 'object' ? Object.keys(ragicData).length : 0),
          firstRecord: typeof ragicData === 'object' && !Array.isArray(ragicData) ? ragicData[Object.keys(ragicData)[0]] : null
        };
      } catch (error) {
        results.ragic = {
          status: '❌ 直接連接失敗',
          error: error instanceof Error ? error.message : '未知錯誤'
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('測試失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runFullTest();
  }, []);

  return (
    <div className="min-h-screen bg-red-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <h1 className="text-2xl font-bold text-red-800">🚨 緊急診斷測試</h1>
          <p className="text-red-700">系統全面檢測 - Demo 前最後檢查</p>
        </div>

        <button
          onClick={runFullTest}
          disabled={loading}
          className="mb-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '🔄 測試中...' : '🚀 重新執行完整測試'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {/* 環境變數測試 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 環境變數檢查</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testResults.env || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <span className={`font-semibold ${String(value).includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* API 測試 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">🔌 內部 API 測試</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">狀態：</span>
                  <span className={`font-semibold ${testResults.api?.status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.api?.status}
                  </span>
                </div>
                {testResults.api?.statusCode && (
                  <div><strong>狀態碼：</strong> {testResults.api.statusCode}</div>
                )}
                {testResults.api?.recordCount !== undefined && (
                  <div><strong>記錄數量：</strong> {testResults.api.recordCount}</div>
                )}
                {testResults.api?.error && (
                  <div className="text-red-600"><strong>錯誤：</strong> {testResults.api.error}</div>
                )}
                {testResults.api?.sampleData && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-600">查看範例資料</summary>
                    <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(testResults.api.sampleData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            {/* Ragic 直接測試 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">🔗 Ragic 直接連接測試</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">狀態：</span>
                  <span className={`font-semibold ${testResults.ragic?.status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.ragic?.status}
                  </span>
                </div>
                {testResults.ragic?.statusCode && (
                  <div><strong>狀態碼：</strong> {testResults.ragic.statusCode}</div>
                )}
                {testResults.ragic?.dataType && (
                  <div><strong>資料類型：</strong> {testResults.ragic.dataType}</div>
                )}
                {testResults.ragic?.isArray !== undefined && (
                  <div><strong>是否為陣列：</strong> {testResults.ragic.isArray ? '是' : '否'}</div>
                )}
                {testResults.ragic?.recordCount !== undefined && (
                  <div><strong>記錄數量：</strong> {testResults.ragic.recordCount}</div>
                )}
                {testResults.ragic?.keys && testResults.ragic.keys.length > 0 && (
                  <div><strong>資料鍵值：</strong> {testResults.ragic.keys.slice(0, 5).join(', ')}{testResults.ragic.keys.length > 5 ? '...' : ''}</div>
                )}
                {testResults.ragic?.error && (
                  <div className="text-red-600"><strong>錯誤：</strong> {testResults.ragic.error}</div>
                )}
                {testResults.ragic?.firstRecord && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-600">查看第一筆 Ragic 原始記錄</summary>
                    <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(testResults.ragic.firstRecord, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            {/* 🔥 車牌欄位詳細分析 */}
            {plateAnalysis && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">🏷️ 車牌欄位分析 (最新欄位對應)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-2xl font-bold text-blue-600">{plateAnalysis.total}</div>
                    <div className="text-sm text-blue-800">總記錄數</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-2xl font-bold text-green-600">{plateAnalysis.withPlates}</div>
                    <div className="text-sm text-green-800">有車牌資料</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded">
                    <div className="text-2xl font-bold text-red-600">{plateAnalysis.emptyPlates}</div>
                    <div className="text-sm text-red-800">空白車牌</div>
                  </div>
                </div>

                {plateAnalysis.withPlates > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-700">✅ 有效車牌範例</h3>
                    <div className="space-y-2">
                      {plateAnalysis.plateExamples.map((example: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded">
                          <div>
                            <span className="font-bold text-green-800">{example.plate}</span>
                            <span className="ml-3 text-gray-600">申請人: {example.applicant}</span>
                          </div>
                          <span className="text-xs text-gray-500">ID: {example.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plateAnalysis.emptyPlates > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-700">❌ 空白車牌記錄</h3>
                    <div className="space-y-2">
                      {plateAnalysis.emptyExamples.map((example: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded">
                          <div>
                            <span className="text-red-800">申請人: {example.applicant}</span>
                            <span className="ml-3 text-gray-600">類型: {example.type}</span>
                          </div>
                          <span className="text-xs text-gray-500">ID: {example.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plateAnalysis.emptyPlates > 0 && (
                  <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">🔧 欄位對應檢查</h4>
                    <p className="text-yellow-700 text-sm">
                      目前使用的 Ragic 欄位對應：
                      <br />• 車牌號碼：<code className="bg-yellow-200 px-1 py-0.5 rounded">1003984</code>
                      <br />• 申請人姓名：<code className="bg-yellow-200 px-1 py-0.5 rounded">1003985</code>
                      <br />• 車輛類型：<code className="bg-yellow-200 px-1 py-0.5 rounded">1003986</code>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 診斷建議 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">💡 診斷建議</h2>
              <div className="space-y-2 text-yellow-700">
                {!testResults.env?.RAGIC_API_KEY?.includes('✅') && (
                  <p>❌ <strong>環境變數問題：</strong> RAGIC_API_KEY 未設定，請檢查 .env.local 檔案</p>
                )}
                {!testResults.api?.status?.includes('✅') && (
                  <p>❌ <strong>API 問題：</strong> 內部 API 無法正常工作，請檢查伺服器狀態</p>
                )}
                {!testResults.ragic?.status?.includes('✅') && (
                  <p>❌ <strong>Ragic 連接問題：</strong> 無法直接連接 Ragic，請檢查 API Key 和網路</p>
                )}
                {testResults.ragic?.recordCount === 0 && (
                  <p>⚠️ <strong>資料問題：</strong> Ragic 表單中沒有記錄，請先新增測試資料</p>
                )}
                {testResults.api?.recordCount === 0 && testResults.ragic?.recordCount > 0 && (
                  <p>❌ <strong>轉換問題：</strong> Ragic 有資料但 API 轉換失敗，請檢查欄位對應</p>
                )}
                {plateAnalysis && plateAnalysis.emptyPlates > 0 && (
                  <p>⚠️ <strong>車牌欄位問題：</strong> 有 {plateAnalysis.emptyPlates} 筆記錄的車牌是空白的，請檢查 Ragic 欄位 1003984 是否正確</p>
                )}
                {plateAnalysis && plateAnalysis.withPlates === 0 && plateAnalysis.total > 0 && (
                  <p>❌ <strong>嚴重車牌問題：</strong> 所有記錄的車牌都是空白，欄位對應可能完全錯誤</p>
                )}
                {testResults.api?.status?.includes('✅') && testResults.ragic?.status?.includes('✅') && plateAnalysis && plateAnalysis.withPlates > 0 && (
                  <p>✅ <strong>系統正常：</strong> API 連接成功，車牌資料正常顯示</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
