'use client';

import { useState, useEffect } from 'react';
import { VehicleCard } from '@/components/VehicleCard';
import { VehicleRecord } from '@/types/vehicle';

export default function ImprovedTestPage() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataQuality, setDataQuality] = useState({
    score: 0,
    issues: [] as string[],
    suggestions: [] as string[]
  });
  const [stats, setStats] = useState({
    total: 0,
    withPlates: 0,
    missingPlates: 0,
    emptyApplicants: 0,
    vehicleTypes: {} as Record<string, number>,
    identityTypes: {} as Record<string, number>,
    fetchTime: 0
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  // 資料品質分析函數
  const analyzeDataQuality = (data: VehicleRecord[]) => {
    if (!data || data.length === 0) {
      return {
        score: 0,
        issues: ['無資料'],
        suggestions: ['請檢查 API 連接']
      };
    }

    let score = 100;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 檢查車牌品質
    const invalidPlates = data.filter(v => {
      const plate = v.plate?.trim();
      return !plate || plate === '' || plate.startsWith('MISSING-') || plate.startsWith('未知車牌');
    });
    
    if (invalidPlates.length > 0) {
      const percentage = (invalidPlates.length / data.length * 100).toFixed(1);
      score -= invalidPlates.length * 5; // 每個無效車牌扣 5 分
      issues.push(`${invalidPlates.length} 筆記錄缺少有效車牌 (${percentage}%)`);
      suggestions.push('檢查 Ragic 中的車牌號碼欄位是否正確填寫');
    }

    // 檢查申請人品質
    const invalidApplicants = data.filter(v => {
      const name = v.applicantName?.trim();
      return !name || name === '' || name === '未知申請人';
    });
    
    if (invalidApplicants.length > 0) {
      const percentage = (invalidApplicants.length / data.length * 100).toFixed(1);
      score -= invalidApplicants.length * 3; // 每個無效申請人扣 3 分
      issues.push(`${invalidApplicants.length} 筆記錄缺少申請人 (${percentage}%)`);
      suggestions.push('檢查 Ragic 中的申請人姓名欄位');
    }

    // 檢查聯絡電話
    const missingPhones = data.filter(v => !v.contactPhone || v.contactPhone.trim() === '');
    if (missingPhones.length > 0) {
      const percentage = (missingPhones.length / data.length * 100).toFixed(1);
      score -= missingPhones.length * 2; // 每個缺少電話扣 2 分
      issues.push(`${missingPhones.length} 筆記錄缺少聯絡電話 (${percentage}%)`);
      suggestions.push('建議補充聯絡電話以便緊急聯絡');
    }

    // 檢查日期格式
    const invalidDates = data.filter(v => {
      const date = v.applicationDate;
      return date && date !== '' && !date.match(/\d{4}-\d{2}-\d{2}/);
    });
    
    if (invalidDates.length > 0) {
      score -= invalidDates.length * 1;
      issues.push(`${invalidDates.length} 筆記錄的日期格式不正確`);
      suggestions.push('日期應使用 YYYY-MM-DD 格式');
    }

    // 確保分數不低於 0
    score = Math.max(0, score);

    // 如果沒有問題，給予正面回饋
    if (issues.length === 0) {
      suggestions.push('資料品質良好！');
    }

    return {
      score: Math.round(score),
      issues,
      suggestions
    };
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      console.log('🔄 開始獲取車輛資料...');
      const startTime = performance.now();
      
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      
      const fetchTime = performance.now() - startTime;
      console.log(`⏱️ API 回應時間: ${fetchTime.toFixed(2)}ms`);
      
      if (data.success) {
        setVehicles(data.data);
        
        // 詳細統計分析
        const total = data.data.length;
        
        // 有效車牌：不是空白、不是 MISSING- 開頭、不是未知車牌
        const withPlates = data.data.filter((v: VehicleRecord) => {
          const plate = v.plate?.trim();
          return plate && 
                 plate !== '' && 
                 !plate.startsWith('MISSING-') && 
                 !plate.startsWith('未知車牌') &&
                 plate !== 'undefined' &&
                 plate !== 'null';
        }).length;
        
        // 問題車牌
        const missingPlates = data.data.filter((v: VehicleRecord) => {
          const plate = v.plate?.trim();
          return !plate || 
                 plate === '' || 
                 plate.startsWith('MISSING-') || 
                 plate.startsWith('未知車牌') ||
                 plate === 'undefined' ||
                 plate === 'null';
        }).length;
        
        // 空白申請人
        const emptyApplicants = data.data.filter((v: VehicleRecord) => {
          const name = v.applicantName?.trim();
          return !name || 
                 name === '' || 
                 name === '未知申請人' ||
                 name === 'undefined' ||
                 name === 'null';
        }).length;
        
        // 車輛類型統計
        const vehicleTypes = data.data.reduce((acc: any, v: VehicleRecord) => {
          const type = v.vehicleType || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        // 身份類型統計
        const identityTypes = data.data.reduce((acc: any, v: VehicleRecord) => {
          const type = v.identityType || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        setStats({ 
          total, 
          withPlates, 
          missingPlates, 
          emptyApplicants,
          vehicleTypes,
          identityTypes,
          fetchTime: Math.round(fetchTime)
        });
        
        // 計算資料品質分數
        const qualityAnalysis = analyzeDataQuality(data.data);
        setDataQuality(qualityAnalysis);
        
        console.log('📊 統計結果:', {
          total,
          withPlates,
          missingPlates,
          emptyApplicants,
          vehicleTypes,
          identityTypes,
          dataQuality: qualityAnalysis
        });
      } else {
        console.error('❌ API 回應失敗:', data.error);
        setStats({ 
          total: 0, 
          withPlates: 0, 
          missingPlates: 0, 
          emptyApplicants: 0,
          vehicleTypes: {},
          identityTypes: {},
          fetchTime: 0
        });
      }
    } catch (error) {
      console.error('💥 獲取車輛資料失敗:', error);
      setStats({ 
        total: 0, 
        withPlates: 0, 
        missingPlates: 0, 
        emptyApplicants: 0,
        vehicleTypes: {},
        identityTypes: {},
        fetchTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">🔧 改進版系統測試</h1>
          <p className="text-blue-700 mb-4">
            測試強化後的欄位對應和錯誤處理機制
          </p>
          
          {!loading && (
            <div className="space-y-4">
              {/* 基本統計 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-sm text-gray-600">總記錄數</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">{stats.withPlates}</div>
                  <div className="text-sm text-gray-600">有效車牌</div>
                  <div className="text-xs text-green-500">
                    {stats.total > 0 ? `${((stats.withPlates / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">{stats.missingPlates}</div>
                  <div className="text-sm text-gray-600">問題車牌</div>
                  <div className="text-xs text-red-500">
                    {stats.total > 0 ? `${((stats.missingPlates / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-orange-600">{stats.emptyApplicants}</div>
                  <div className="text-sm text-gray-600">空白申請人</div>
                  <div className="text-xs text-orange-500">
                    {stats.total > 0 ? `${((stats.emptyApplicants / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </div>
              
              {/* 資料品質分析 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-blue-700 mb-3">📈 資料品質分析</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">品質分數:</span>
                    <div className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                      dataQuality.score >= 90 ? 'bg-green-100 text-green-800' :
                      dataQuality.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      dataQuality.score >= 50 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dataQuality.score}/100
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {dataQuality.score >= 90 ? '🏆 優秀' : 
                     dataQuality.score >= 70 ? '✅ 良好' : 
                     dataQuality.score >= 50 ? '⚠️ 一般' : '❌ 需改進'}
                  </div>
                </div>
                
                {dataQuality.issues.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-red-700 mb-1">🔍 發現問題:</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {dataQuality.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-1">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {dataQuality.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-blue-700 mb-1">💡 建議改進:</h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {dataQuality.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* 性能指標 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-blue-700 mb-2">⚡ 性能指標</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">API 回應時間:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                      stats.fetchTime < 300 ? 'bg-green-100 text-green-800' :
                      stats.fetchTime < 1000 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stats.fetchTime}ms
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.fetchTime < 300 ? '🚀 極快' : 
                     stats.fetchTime < 1000 ? '✅ 良好' : '⚠️ 需優化'}
                  </div>
                </div>
              </div>
              
              {/* 車輛類型分布 */}
              {Object.keys(stats.vehicleTypes).length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-blue-700 mb-2">🚗 車輛類型分布</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(stats.vehicleTypes).map(([type, count]) => (
                      <div key={type} className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-gray-800">{count}</div>
                        <div className="text-xs text-gray-600 capitalize">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 身份類型分布 */}
              {Object.keys(stats.identityTypes).length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold text-blue-700 mb-2">👥 身份類型分布</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(stats.identityTypes).map(([type, count]) => (
                      <div key={type} className="bg-gray-50 p-2 rounded text-center">
                        <div className="font-semibold text-gray-800">{count}</div>
                        <div className="text-xs text-gray-600 capitalize">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 改進重點</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">✅ 欄位對應改進</h3>
              <ul className="text-sm space-y-1">
                <li>• 支援中文欄位名稱和數字 ID 雙重對應</li>
                <li>• 車牌號碼: <code>item["車牌號碼"] || item["1003984"]</code></li>
                <li>• 申請人: <code>item["申請人姓名"] || item["1003985"]</code></li>
                <li>• 車輛類型: <code>item["車輛類型"] || item["1003986"]</code></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">🛡️ 錯誤處理改進</h3>
              <ul className="text-sm space-y-1">
                <li>• 空白車牌顯示 <span className="bg-orange-100 px-1 rounded">MISSING-ID</span></li>
                <li>• 空白申請人顯示 "未知申請人"</li>
                <li>• 預設車輛類型為 "轎車"</li>
                <li>• 身份類別預設為 "訪客"</li>
              </ul>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">車輛記錄測試</h2>
              <div className="flex space-x-2">
                <button
                  onClick={fetchVehicles}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    loading 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      載入中...
                    </div>
                  ) : (
                    <>🔄 重新載入</>
                  )}
                </button>
                <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                  最後更新: {new Date().toLocaleTimeString('zh-TW')}
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle, index) => {
                // 為每個車輛添加詳細的狀態分析
                const plateStatus = (() => {
                  const plate = vehicle.plate?.trim();
                  if (!plate || plate === '') return { type: 'empty', color: 'red', label: '空白' };
                  if (plate.startsWith('MISSING-')) return { type: 'missing', color: 'orange', label: '缺失' };
                  if (plate.startsWith('未知車牌')) return { type: 'unknown', color: 'yellow', label: '未知' };
                  if (plate.length < 3) return { type: 'invalid', color: 'red', label: '格式錯誤' };
                  return { type: 'valid', color: 'green', label: '有效' };
                })();

                return (
                  <div key={vehicle.id} className="relative">
                    {/* 狀態指示器 */}
                    <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                      plateStatus.color === 'green' ? 'bg-green-500' :
                      plateStatus.color === 'yellow' ? 'bg-yellow-500' :
                      plateStatus.color === 'orange' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} title={`車牌狀態: ${plateStatus.label}`}></div>
                    
                    <VehicleCard
                      vehicle={vehicle}
                      showDetails={true}
                    />
                    
                    {/* 詳細狀態資訊 */}
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <div>#{index + 1} | 狀態: <span className={`font-semibold ${
                        plateStatus.color === 'green' ? 'text-green-600' :
                        plateStatus.color === 'yellow' ? 'text-yellow-600' :
                        plateStatus.color === 'orange' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>{plateStatus.label}</span></div>
                      {vehicle.createdAt && (
                        <div>建立: {new Date(vehicle.createdAt).toLocaleString('zh-TW')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
