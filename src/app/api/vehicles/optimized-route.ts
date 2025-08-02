import { NextRequest, NextResponse } from 'next/server';
import { ragicConfig, validateRagicConfig, RagicDataTransformer } from '@/config/ragicConfig';

// 🎯 優化的回應接口
interface OptimizedVehicleResponse {
  success: boolean;
  data?: any[];
  total?: number;
  filteredCount?: number;
  cached?: boolean;
  queryTime?: number;
  error?: string;
  message?: string;
}

// 🚀 快取系統
class VehicleDataCache {
  private static cache: {
    data: any[] | null;
    timestamp: number;
    ttl: number; // 存活時間 (毫秒)
  } = {
    data: null,
    timestamp: 0,
    ttl: 60000 // 1 分鐘快取
  };

  static isValid(): boolean {
    const now = Date.now();
    return this.cache.data !== null && 
           (now - this.cache.timestamp) < this.cache.ttl;
  }

  static get(): any[] | null {
    return this.isValid() ? this.cache.data : null;
  }

  static set(data: any[]): void {
    this.cache.data = data;
    this.cache.timestamp = Date.now();
  }

  static clear(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;
  }

  static getAge(): number {
    return Date.now() - this.cache.timestamp;
  }
}

// 🔍 優化的 Ragic 讀取函式
async function optimizedRagicRead(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
  fromCache?: boolean;
}> {
  const startTime = Date.now();
  
  try {
    // 1. 檢查快取
    const cachedData = VehicleDataCache.get();
    if (cachedData) {
      console.log(`📦 使用快取資料 (快取年齡: ${VehicleDataCache.getAge()}ms)`);
      return {
        success: true,
        data: cachedData,
        fromCache: true
      };
    }

    // 2. 驗證配置
    validateRagicConfig();
    
    const vehicleConfig = ragicConfig.forms.vehicles;
    const url = `${ragicConfig.baseURL}/${ragicConfig.account}/ragicforms${vehicleConfig.formId}/${vehicleConfig.subtableId}?api&APIKey=${ragicConfig.apiKey}`;
    
    console.log('🔄 開始 Ragic 讀取請求');

    // 3. 發送優化的請求
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json; charset=UTF-8',
        'Accept-Charset': 'UTF-8',
        'Cache-Control': 'no-cache',
        'User-Agent': 'ParkingSearch-Optimized/3.0'
      },
      // 添加超時控制
      signal: AbortSignal.timeout(15000) // 15 秒超時
    });

    const duration = Date.now() - startTime;
    console.log(`📊 Ragic 回應: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 4. 解析回應
    const responseText = await response.text();
    
    if (!responseText.trim()) {
      throw new Error('Ragic 回應為空');
    }

    let rawData: any;
    try {
      rawData = JSON.parse(responseText);
    } catch (error) {
      throw new Error('JSON 解析失敗: 無效的 Ragic 回應格式');
    }

    // 5. 資料轉換和標準化
    const processedData = processRagicData(rawData);
    
    // 6. 快取結果
    VehicleDataCache.set(processedData);
    
    console.log(`✅ 成功讀取 ${processedData.length} 筆記錄 (耗時: ${duration}ms)`);
    
    return {
      success: true,
      data: processedData,
      fromCache: false
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Ragic 讀取失敗 (耗時: ${duration}ms):`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// 📊 資料處理和標準化
function processRagicData(rawData: any): any[] {
  if (!rawData || typeof rawData !== 'object') {
    return [];
  }

  const records: any[] = [];
  const vehicleConfig = ragicConfig.forms.vehicles;

  // 處理 Ragic 的對象格式 (例如: {"0": {...}, "1": {...}})
  Object.entries(rawData).forEach(([key, value]) => {
    if (value && typeof value === 'object' && '_ragicId' in value) {
      // 轉換 Ragic 格式到本地格式
      try {
        const localRecord = RagicDataTransformer.fromRagicFormat('vehicles', value);
        
        // 添加額外的系統欄位
        const processedRecord = {
          id: key,
          _ragicId: (value as any)._ragicId,
          _timestamp: (value as any)._dataTimestamp,
          ...localRecord,
          // 確保關鍵欄位存在
          plate: localRecord.plate || (value as any)['車牌號碼'] || '',
          applicantName: localRecord.applicantName || (value as any)['申請人姓名'] || '',
          vehicleType: localRecord.vehicleType || (value as any)['車輛類型'] || '',
          contactPhone: localRecord.contactPhone || (value as any)['聯絡電話'] || '',
          applicationDate: localRecord.applicationDate || (value as any)['申請日期'] || ''
        };

        records.push(processedRecord);
      } catch (error) {
        console.warn(`⚠️ 記錄 ${key} 轉換失敗:`, error);
      }
    }
  });

  // 按申請日期排序 (最新的在前)
  records.sort((a, b) => {
    const dateA = new Date(a.applicationDate || '1970-01-01').getTime();
    const dateB = new Date(b.applicationDate || '1970-01-01').getTime();
    return dateB - dateA;
  });

  return records;
}

// 🔍 智能搜尋過濾
function smartFilter(records: any[], query: string): any[] {
  if (!query || !query.trim()) {
    return records;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return records.filter(record => {
    // 多欄位搜尋
    const searchableFields = [
      record.plate,
      record.applicantName,
      record.vehicleType,
      record.contactPhone,
      record.department,
      record.brand,
      record.identityType
    ];

    return searchableFields.some(field => {
      if (!field) return false;
      const fieldValue = String(field).toLowerCase();
      
      // 支援部分匹配和子序列匹配
      return fieldValue.includes(searchTerm) ||
             isSubsequenceMatch(fieldValue, searchTerm);
    });
  });
}

// 子序列匹配演算法 (支援 "bc" 匹配 "abc-123")
function isSubsequenceMatch(text: string, pattern: string): boolean {
  let textIndex = 0;
  let patternIndex = 0;
  
  while (textIndex < text.length && patternIndex < pattern.length) {
    if (text[textIndex] === pattern[patternIndex]) {
      patternIndex++;
    }
    textIndex++;
  }
  
  return patternIndex === pattern.length;
}

// 🚀 優化的 GET API 端點
export async function GET(request: NextRequest): Promise<NextResponse<OptimizedVehicleResponse>> {
  const requestStart = Date.now();
  
  try {
    console.log('=== 優化車輛查詢 API 開始 ===');
    
    // 解析查詢參數
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const plate = searchParams.get('plate') || '';
    const limit = parseInt(searchParams.get('limit') || '0');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    console.log('📝 查詢參數:', { query, plate, limit, forceRefresh });

    // 強制重新整理時清除快取
    if (forceRefresh) {
      VehicleDataCache.clear();
      console.log('🗑️ 已清除快取');
    }

    // 讀取資料
    const result = await optimizedRagicRead();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: '讀取車輛資料失敗'
      }, { status: 500 });
    }

    let filteredData = result.data || [];

    // 應用搜尋過濾
    const searchQuery = query || plate;
    if (searchQuery) {
      filteredData = smartFilter(filteredData, searchQuery);
      console.log(`🔍 搜尋 "${searchQuery}" 找到 ${filteredData.length} 筆結果`);
    }

    // 應用數量限制
    const originalCount = filteredData.length;
    if (limit > 0 && filteredData.length > limit) {
      filteredData = filteredData.slice(0, limit);
      console.log(`📊 限制結果數量: ${originalCount} → ${limit}`);
    }

    const totalTime = Date.now() - requestStart;
    
    console.log(`✅ 查詢完成 (總耗時: ${totalTime}ms, 快取: ${result.fromCache ? '是' : '否'})`);

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: result.data?.length || 0,
      filteredCount: originalCount,
      cached: result.fromCache,
      queryTime: totalTime
    });

  } catch (error) {
    const totalTime = Date.now() - requestStart;
    console.error(`💥 優化查詢 API 失敗 (耗時: ${totalTime}ms):`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '查詢過程中發生錯誤',
      queryTime: totalTime
    }, { status: 500 });
  }
}

// 保持原有的 POST 功能
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/vehicles 開始 ===');
    
    validateRagicConfig();
    
    const body = await request.json();
    console.log('📝 接收到的資料:', body);
    
    // 驗證必要欄位
    const { plate, applicantName, contactPhone } = body;
    if (!plate || !applicantName || !contactPhone) {
      return NextResponse.json({
        success: false,
        error: '缺少必要欄位：車牌號碼、申請人姓名、聯絡電話',
        message: '請填寫完整的車輛資訊'
      }, { status: 400 });
    }
    
    // 使用現有的寫入功能
    const { ragicWrite } = await import('@/utils/ragicRequest');
    const result = await ragicWrite('vehicles', body);
    
    if (result.success) {
      // 清除快取以確保下次讀取獲得最新資料
      VehicleDataCache.clear();
      console.log('🗑️ 寫入成功，已清除快取');
      
      console.log('✅ 寫入成功，記錄 ID:', result.data?.ragicId);
      return NextResponse.json({
        success: true,
        data: result.data,
        message: '車輛資料新增成功'
      });
    } else {
      console.error('❌ 寫入失敗:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: '新增車輛資料失敗'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('💥 POST /api/vehicles 異常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '新增車輛資料時發生錯誤'
    }, { status: 500 });
  }
}
