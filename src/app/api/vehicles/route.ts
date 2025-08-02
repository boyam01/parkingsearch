import { NextRequest, NextResponse } from 'next/server';
import { ragicConfig, validateRagicConfig, RagicDataTransformer } from '@/config/ragicConfig';

// 智能回應接口
interface SmartVehicleResponse {
  success: boolean;
  data?: any[];
  total?: number;
  filteredCount?: number;
  cached?: boolean;
  cacheStatus?: string;
  queryTime?: number;
  error?: string;
  message?: string;
}

// 🚀 智能快取系統
class VehicleDataCache {
  private static cache: {
    data: any[] | null;
    timestamp: number;
    ttl: number;
    isInitialized: boolean;
    lastRefresh: number;
  } = {
    data: null,
    timestamp: 0,
    ttl: 300000, // 5 分鐘快取 (除非手動重整)
    isInitialized: false,
    lastRefresh: 0
  };

  // 檢查是否需要初始載入
  static needsInitialLoad(): boolean {
    return !this.cache.isInitialized || this.cache.data === null;
  }

  // 檢查快取是否有效 (僅用於非手動重整)
  static isValid(): boolean {
    if (!this.cache.isInitialized || this.cache.data === null) {
      return false;
    }
    const now = Date.now();
    return (now - this.cache.timestamp) < this.cache.ttl;
  }

  // 獲取快取資料
  static get(): any[] | null {
    return this.cache.data;
  }

  // 設定快取資料
  static set(data: any[]): void {
    this.cache.data = data;
    this.cache.timestamp = Date.now();
    this.cache.isInitialized = true;
    console.log(`💾 快取已更新: ${data.length} 筆記錄`);
  }

  // 手動重整快取
  static refresh(): void {
    this.cache.lastRefresh = Date.now();
    this.clear();
    console.log('🔄 手動重整快取');
  }

  // 清除快取
  static clear(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;
    this.cache.isInitialized = false;
  }

  // 獲取快取年齡
  static getAge(): number {
    return Date.now() - this.cache.timestamp;
  }

  // 獲取快取狀態資訊
  static getStatus(): {
    initialized: boolean;
    hasData: boolean;
    age: number;
    isValid: boolean;
  } {
    return {
      initialized: this.cache.isInitialized,
      hasData: this.cache.data !== null,
      age: this.getAge(),
      isValid: this.isValid()
    };
  }
}

// 🔍 智能 Ragic 讀取函式
async function smartRagicRead(forceRefresh: boolean = false): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
  fromCache?: boolean;
  cacheStatus?: string;
}> {
  const startTime = Date.now();
  
  try {
    // 1. 檢查是否需要強制重整
    if (forceRefresh) {
      VehicleDataCache.refresh();
    }

    // 2. 智能快取策略
    const cacheStatus = VehicleDataCache.getStatus();
    console.log('📊 快取狀態:', cacheStatus);

    // 如果已初始化且有有效資料，直接返回快取
    if (cacheStatus.initialized && cacheStatus.hasData && cacheStatus.isValid && !forceRefresh) {
      console.log(`⚡ 使用快取資料 (年齡: ${cacheStatus.age}ms)`);
      return {
        success: true,
        data: VehicleDataCache.get() || [],
        fromCache: true,
        cacheStatus: '快取命中'
      };
    }

    // 3. 需要從 Ragic 讀取資料
    console.log(`🌐 從 Ragic 讀取資料 (原因: ${forceRefresh ? '手動重整' : '初始載入或快取過期'})`);
    
    // 動態導入配置，避免構建時執行
    const { ragicConfig, validateRagicConfig } = await import('@/config/ragicConfig');
    
    // 驗證配置
    validateRagicConfig();
    
    const vehicleConfig = ragicConfig.forms.vehicles;
    const url = `${ragicConfig.baseURL}/${ragicConfig.account}/ragicforms${vehicleConfig.formId}/${vehicleConfig.subtableId}?api&APIKey=${ragicConfig.apiKey}`;

    // 4. 發送請求 (增強錯誤處理)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 12000); // 12 秒超時

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json; charset=UTF-8',
          'Accept-Charset': 'UTF-8',
          'Cache-Control': 'no-cache',
          'User-Agent': 'ParkingSearch-Smart/4.0'
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const fetchDuration = Date.now() - startTime;
    console.log(`📡 Ragic 網路回應: ${response.status} (${fetchDuration}ms)`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 5. 解析回應
    const responseText = await response.text();
    
    if (!responseText.trim()) {
      throw new Error('Ragic 回應內容為空');
    }

    let rawData: any;
    try {
      rawData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON 解析錯誤:', parseError);
      console.error('🔍 回應內容預覽:', responseText.substring(0, 200));
      throw new Error('無法解析 Ragic 回應: JSON 格式錯誤');
    }

    // 6. 資料處理和驗證
    const processedData = processRagicData(rawData);
    
    if (processedData.length === 0) {
      console.warn('⚠️ 處理後的資料為空');
    }

    // 7. 更新快取
    VehicleDataCache.set(processedData);
    
    const totalDuration = Date.now() - startTime;
    console.log(`✅ 資料讀取完成: ${processedData.length} 筆記錄 (總耗時: ${totalDuration}ms)`);
    
    return {
      success: true,
      data: processedData,
      fromCache: false,
      cacheStatus: forceRefresh ? '手動重整' : '初始載入'
    };

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    
    // 如果是網路錯誤但有舊快取，考慮使用舊快取
    const cachedData = VehicleDataCache.get();
    if (cachedData && cachedData.length > 0 && !forceRefresh) {
      console.warn(`⚠️ 網路錯誤但使用舊快取資料 (耗時: ${totalDuration}ms):`, error);
      return {
        success: true,
        data: cachedData,
        fromCache: true,
        cacheStatus: '網路錯誤-使用舊快取'
      };
    }

    console.error(`💥 資料讀取失敗 (耗時: ${totalDuration}ms):`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      cacheStatus: '讀取失敗'
    };
  }
}

// 📊 資料處理和標準化
function processRagicData(rawData: any): any[] {
  if (!rawData || typeof rawData !== 'object') {
    return [];
  }

  const records: any[] = [];

  // 處理 Ragic 的對象格式 (例如: {"0": {...}, "1": {...}})
  Object.entries(rawData).forEach(([key, value]) => {
    if (value && typeof value === 'object' && '_ragicId' in value) {
      // 直接轉換資料格式，不依賴 RagicDataTransformer
      try {
        const record = value as any;
        
        // 手動轉換關鍵欄位
        const localRecord = {
          plate: record['車牌號碼'] || record['1003984'] || '',
          applicantName: record['申請人姓名'] || record['1003990'] || '',
          vehicleType: record['車輛類型'] || record['1003988'] || '',
          contactPhone: record['聯絡電話'] || record['1003992'] || '',
          applicationDate: record['申請日期'] || record['1003994'] || '',
          visitTime: record['到訪時間'] || record['1003986'] || '',
          identityType: record['身份類別'] || record['1003989'] || '',
          brand: record['車輛品牌'] || record['1003991'] || '',
          department: record['部門'] || record['1003995'] || ''
        };
        
        // 添加額外的系統欄位
        const processedRecord = {
          id: key,
          _ragicId: record._ragicId,
          _timestamp: record._dataTimestamp,
          ...localRecord,
          // 確保關鍵欄位存在
          plate: localRecord.plate || '',
          applicantName: localRecord.applicantName || '',
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

// 🚀 智能 GET API 端點
export async function GET(request: NextRequest): Promise<NextResponse<SmartVehicleResponse>> {
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

    // 讀取資料 (智能快取策略)
    const result = await smartRagicRead(forceRefresh);
    
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
    
    console.log(`✅ 查詢完成 (總耗時: ${totalTime}ms, 策略: ${result.cacheStatus})`);

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: result.data?.length || 0,
      filteredCount: originalCount,
      cached: result.fromCache,
      cacheStatus: result.cacheStatus,
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
    
    // 動態導入配置
    const { validateRagicConfig } = await import('@/config/ragicConfig');
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
