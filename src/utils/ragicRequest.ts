// 🔄 Ragic 動態請求工具
// 統一處理所有 Ragic API 請求，包含重試機制和詳細日誌

import { ragicConfig, RagicDataTransformer } from '@/config/ragicConfig';

export interface RagicRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  formKey: string;           // 表單配置鍵值（如 'vehicles'）
  recordId?: string;         // 記錄 ID（用於單筆操作）
  payload?: Record<string, any>; // 請求資料
  useWriteSubtable?: boolean; // 是否使用寫入專用子表
  maxRetries?: number;       // 最大重試次數（預設 3）
  retryDelay?: number;       // 重試延遲（預設 1000ms）
}

export interface RagicResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  retryCount?: number;
  url?: string;
}

// 🔧 重試配置
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

// 🌐 統一的 Ragic 請求函式
export async function ragicRequest<T = any>(options: RagicRequestOptions): Promise<RagicResponse<T>> {
  const {
    method,
    formKey,
    recordId,
    payload,
    useWriteSubtable = false,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    retryDelay = DEFAULT_RETRY_CONFIG.baseDelay
  } = options;

  // 獲取表單配置
  const formConfig = ragicConfig.forms[formKey];
  if (!formConfig) {
    return {
      success: false,
      error: `未找到表單配置: ${formKey}`,
      statusCode: 400
    };
  }

  // 建構 URL
  const subtableId = useWriteSubtable ? formConfig.writeSubtableId : formConfig.subtableId;
  const baseUrl = `${ragicConfig.baseURL}/${ragicConfig.account}/ragicforms${formConfig.formId}/${subtableId}`;
  const recordPath = recordId ? `/${recordId}` : '';
  const apiParams = `?api&APIKey=${encodeURIComponent(ragicConfig.apiKey)}`;
  const url = `${baseUrl}${recordPath}${apiParams}`;

  console.log(`🚀 Ragic ${method} 請求開始:`, {
    formKey,
    formId: formConfig.formId,
    subtableId,
    recordId,
    url: url.replace(ragicConfig.apiKey, '***HIDDEN***'),
    payloadKeys: payload ? Object.keys(payload) : []
  });

  let lastError: any = null;
  
  // 重試迴圈
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`⏳ 第 ${attempt} 次嘗試 (共 ${maxRetries} 次)`);
      
      const response = await makeRagicRequest(url, method, payload, formKey);
      
      if (response.success) {
        console.log(`✅ Ragic ${method} 成功 (第 ${attempt} 次嘗試):`, {
          statusCode: response.statusCode,
          dataType: typeof response.data,
          retryCount: attempt - 1
        });
        
        return {
          ...response,
          retryCount: attempt - 1,
          url: url.replace(ragicConfig.apiKey, '***HIDDEN***')
        };
      }
      
      // 如果不是最後一次嘗試，準備重試
      if (attempt < maxRetries) {
        const delay = Math.min(retryDelay * attempt, DEFAULT_RETRY_CONFIG.maxDelay);
        console.warn(`⚠️ 第 ${attempt} 次嘗試失敗，${delay}ms 後重試...`, response.error);
        await new Promise(resolve => setTimeout(resolve, delay));
        lastError = response.error;
        continue;
      }
      
      // 最後一次嘗試也失敗了
      return response;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ 第 ${attempt} 次嘗試發生異常:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.min(retryDelay * attempt, DEFAULT_RETRY_CONFIG.maxDelay);
        console.log(`🔄 ${delay}ms 後重試...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 所有重試都失敗
  console.error(`💥 Ragic ${method} 請求完全失敗 (${maxRetries} 次重試):`, lastError);
  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    statusCode: 500,
    retryCount: maxRetries,
    url: url.replace(ragicConfig.apiKey, '***HIDDEN***')
  };
}

// 🔧 實際發送請求的核心函式
async function makeRagicRequest(
  url: string,
  method: string,
  payload?: Record<string, any>,
  formKey?: string
): Promise<RagicResponse> {
  
  const startTime = Date.now();
  
  try {
    // 準備請求選項
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'User-Agent': 'ParkingSearch/2.0',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    };
    
    // 根據請求方法設定 body 和 headers
    if (method === 'GET') {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Accept': 'application/json',
      };
    } else if (payload) {
      // POST/PUT 使用 form-urlencoded 格式
      const ragicPayload = formKey 
        ? RagicDataTransformer.toRagicFormat(formKey, payload)
        : payload;
        
      console.log('📝 轉換後的 Ragic 格式:', ragicPayload);
      
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json; charset=UTF-8',
        'Accept-Charset': 'UTF-8'
      };
      
      // 使用 URLSearchParams 確保正確的 UTF-8 編碼
      const params = new URLSearchParams();
      Object.entries(ragicPayload).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      fetchOptions.body = params.toString();
    }
    
    // 發送請求
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;
    
    console.log(`📊 Ragic API 回應:`, {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // 讀取回應內容
    const responseText = await response.text();
    console.log('📄 原始回應內容:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText} - ${responseText}`,
        statusCode: response.status
      };
    }
    
    // 解析回應
    let data: any = null;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON 解析成功:', typeof data, Array.isArray(data) ? `陣列長度: ${data.length}` : '物件');
      } catch (parseError) {
        console.warn('⚠️ JSON 解析失敗，使用原始文字:', parseError);
        
        // 檢查是否是 HTML 錯誤頁面
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
          return {
            success: false,
            error: 'Ragic 回傳 HTML 頁面，可能是認證失敗或 URL 錯誤',
            statusCode: response.status
          };
        }
        
        data = responseText;
      }
    } else {
      console.log('ℹ️ 空回應內容');
    }
    
    return {
      success: true,
      data,
      statusCode: response.status
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 請求異常 (${duration}ms):`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      statusCode: 0
    };
  }
}

// 🔍 便利的讀取函式
export async function ragicRead(formKey: string, recordId?: string): Promise<RagicResponse> {
  return ragicRequest({
    method: 'GET',
    formKey,
    recordId
  });
}

// 📝 便利的寫入函式
export async function ragicWrite(
  formKey: string,
  payload: Record<string, any>,
  recordId?: string
): Promise<RagicResponse> {
  return ragicRequest({
    method: recordId ? 'POST' : 'POST', // Ragic 使用 POST 進行新增和更新
    formKey,
    recordId,
    payload,
    useWriteSubtable: !recordId // 新增時使用寫入子表，更新時使用讀取子表
  });
}

// 🗑️ 便利的刪除函式
export async function ragicDelete(formKey: string, recordId: string): Promise<RagicResponse> {
  return ragicRequest({
    method: 'DELETE',
    formKey,
    recordId
  });
}

// 🧪 測試連線函式
export async function testRagicConnection(formKey: string = 'vehicles'): Promise<RagicResponse> {
  console.log('🔍 測試 Ragic 連線...');
  
  try {
    const result = await ragicRead(formKey);
    
    if (result.success) {
      console.log('✅ Ragic 連線測試成功');
      return {
        success: true,
        data: {
          connectionStatus: 'OK',
          recordCount: Array.isArray(result.data) ? result.data.length : (result.data ? Object.keys(result.data).length : 0),
          sampleRecord: Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : null
        }
      };
    } else {
      console.error('❌ Ragic 連線測試失敗:', result.error);
      return result;
    }
  } catch (error) {
    console.error('💥 Ragic 連線測試異常:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
