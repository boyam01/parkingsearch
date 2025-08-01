/**
 * 子序列模糊搜尋測試頁面
 * 展示新的搜尋功能和測試範例
 */
'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useVehicleSearch } from '@/hooks/useVehicleSearch';

// 測試數據範例
const testData = [
  { plate: 'ABC-4567', name: '王小明', type: 'car' },
  { plate: 'ABC1234', name: '李大華', type: 'motorcycle' },
  { plate: 'TEST-492', name: '張三豐', type: 'car' },
  { plate: 'XYZ 999', name: '陳美麗', type: 'vip' },
  { plate: 'BCA-888', name: '林志玲', type: 'car' },
  { plate: 'A1B2C3', name: '劉德華', type: 'motorcycle' },
];

export default function SubsequenceSearchTestPage() {
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const vehicleSearchHook = useVehicleSearch();

  // 正規化函數 - 與搜尋邏輯相同
  const normalizeString = (str: string): string => {
    if (!str) return '';
    return str.replace(/[\s\-]/g, '').toUpperCase();
  };

  // 產生子序列正則表達式
  const createSubsequenceRegex = (query: string): RegExp => {
    if (!query) return /^$/;
    
    const normalizedQuery = normalizeString(query);
    const regexPattern = normalizedQuery
      .split('')
      .map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');
    
    return new RegExp(regexPattern, 'i');
  };

  // 本地測試函數
  const testLocalSearch = () => {
    if (!testQuery) {
      setTestResults([]);
      return;
    }

    const regex = createSubsequenceRegex(testQuery);
    const results = testData.filter(item => {
      const searchableFields = [item.plate, item.name, item.type];
      return searchableFields.some(field => {
        const normalizedField = normalizeString(field);
        return regex.test(normalizedField);
      });
    });
    
    setTestResults(results);
  };

  // 實際系統搜尋測試
  const testSystemSearch = async () => {
    if (!testQuery) return;
    await vehicleSearchHook.search(testQuery);
  };

  const testCases = [
    {
      query: 'BC',
      description: 'BC → B.*C',
      expected: 'ABC-4567, ABC1234, BCA-888, A1B2C3',
      explanation: '會匹配包含 B 和 C（按順序）的車牌'
    },
    {
      query: 'A4',
      description: 'A4 → A.*4',
      expected: 'ABC-4567',
      explanation: '會匹配包含 A 和 4（按順序）的車牌'
    },
    {
      query: 'T49',
      description: 'T49 → T.*4.*9',
      expected: 'TEST-492',
      explanation: '會匹配包含 T、4、9（按順序）的車牌'
    },
    {
      query: '王',
      description: '王 → 王',
      expected: '王小明',
      explanation: '會匹配包含「王」的姓名'
    },
    {
      query: 'CAR',
      description: 'CAR → C.*A.*R',
      expected: 'car 類型的車輛',
      explanation: '會匹配車輛類型為 car 的記錄'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 頁面標題 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🔍 子序列模糊搜尋測試</h1>
            <p className="text-gray-600 mt-2">
              測試新的子序列模糊搜尋功能，支援拆解關鍵字並用正則表達式匹配
            </p>
          </div>

          {/* 功能說明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">🎯 功能特色</h2>
            <ul className="space-y-2 text-blue-800">
              <li>• <strong>正規化處理</strong>：自動移除空格、破折號並轉為大寫</li>
              <li>• <strong>子序列匹配</strong>：將 "BC" 轉換為 "B.*C" 正則表達式</li>
              <li>• <strong>全欄位搜尋</strong>：搜尋車牌、姓名、車型等所有欄位</li>
              <li>• <strong>智能匹配</strong>：ABC-4567、ABC1234 等都能被 "BC" 搜尋到</li>
            </ul>
          </div>

          {/* 測試數據展示 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 測試數據</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">車牌號碼</th>
                    <th className="px-4 py-2 text-left">正規化後</th>
                    <th className="px-4 py-2 text-left">姓名</th>
                    <th className="px-4 py-2 text-left">車型</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {testData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono">{item.plate}</td>
                      <td className="px-4 py-2 font-mono text-blue-600">{normalizeString(item.plate)}</td>
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 測試案例 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 測試案例</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {testCase.query}
                    </code>
                    <span className="text-gray-500">→</span>
                    <code className="text-blue-600 text-sm">{testCase.description}</code>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{testCase.explanation}</p>
                  <p className="text-sm"><strong>預期結果：</strong>{testCase.expected}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 實際測試區域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 本地測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 本地測試</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="輸入測試關鍵字（如：BC、A4、T49）"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={testLocalSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    測試
                  </button>
                </div>
                
                {testQuery && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>查詢：</strong><code>{testQuery}</code> → 
                      <code className="text-blue-600 ml-2">{createSubsequenceRegex(testQuery).source}</code>
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>正規化：</strong><code>{normalizeString(testQuery)}</code>
                    </p>
                  </div>
                )}

                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">本地測試結果 ({testResults.length} 筆):</h4>
                    {testResults.map((result, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-green-800">{result.plate}</span>
                          <span className="text-green-600">{result.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {testQuery && testResults.length === 0 && (
                  <div className="text-gray-500 text-sm">沒有找到匹配結果</div>
                )}
              </div>
            </div>

            {/* 系統測試 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 系統測試</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="輸入關鍵字測試實際系統"
                    value={vehicleSearchHook.query}
                    onChange={(e) => vehicleSearchHook.setQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={testSystemSearch}
                    disabled={vehicleSearchHook.isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {vehicleSearchHook.isLoading ? '搜尋中...' : '測試'}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>搜尋狀態：</strong>
                      {vehicleSearchHook.isLoading ? '🔄 搜尋中' : '✅ 就緒'}
                    </div>
                    <div>
                      <strong>數據載入：</strong>
                      {vehicleSearchHook.isDataLoaded ? '✅ 已載入' : '⚠️ 載入中'}
                    </div>
                    <div>
                      <strong>總記錄數：</strong>{vehicleSearchHook.totalRecords}
                    </div>
                    <div>
                      <strong>搜尋結果：</strong>{vehicleSearchHook.results.length} 筆
                    </div>
                  </div>
                  {vehicleSearchHook.searchTime > 0 && (
                    <div className="mt-2">
                      <strong>搜尋耗時：</strong>{vehicleSearchHook.searchTime}ms
                    </div>
                  )}
                </div>

                {vehicleSearchHook.results.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <h4 className="font-medium text-gray-900">系統搜尋結果:</h4>
                    {vehicleSearchHook.results.slice(0, 10).map((result, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-blue-800">{result.plate}</span>
                          <span className="text-blue-600">{result.applicantName}</span>
                        </div>
                        <div className="text-sm text-blue-500 mt-1">
                          {result.vehicleType} | {result.identityType}
                        </div>
                      </div>
                    ))}
                    {vehicleSearchHook.results.length > 10 && (
                      <div className="text-center text-gray-500 text-sm">
                        還有 {vehicleSearchHook.results.length - 10} 筆結果...
                      </div>
                    )}
                  </div>
                )}

                {vehicleSearchHook.isError && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-700">錯誤: {vehicleSearchHook.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 程式碼範例 */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 程式碼範例</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// 正規化函數 - 移除空格、破折號並轉大寫
const normalizeString = (str) => {
  return str.replace(/[\\s-]/g, '').toUpperCase();
};

// 產生子序列正則表達式
const createSubsequenceRegex = (query) => {
  const normalized = normalizeString(query);
  const pattern = normalized.split('').join('.*');
  return new RegExp(pattern, 'i');
};

// 使用範例
const regex = createSubsequenceRegex('BC');
console.log(regex); // /B.*C/i

// 測試數據
const testData = [
  'ABC-4567',  // 正規化: ABC4567 → 匹配 B.*C ✓
  'ABC1234',   // 正規化: ABC1234 → 匹配 B.*C ✓  
  'TEST-492',  // 正規化: TEST492 → 不匹配 B.*C ✗
  'BCA-888'    // 正規化: BCA888  → 匹配 B.*C ✓
];

const results = testData.filter(item => {
  const normalized = normalizeString(item);
  return regex.test(normalized);
});

console.log(results); // ['ABC-4567', 'ABC1234', 'BCA-888']`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
