// 直接測試 Ragic API 連接
async function testRagicAPI() {
  console.log('🧪 測試 Ragic API 連接...');
  
  // 直接在這裡設定 API Key (請替換為真實的 Key)
  const apiKey = 'YOUR_RAGIC_API_KEY_HERE'; // 請您提供真實的 API Key
  
  try {
    const baseURL = 'https://ap7.ragic.com';
    const accountName = 'xinsheng';
    const formId = '31';
    const subtableId = '6';
    
    const url = `${baseURL}/${accountName}/ragicforms${formId}/${subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
    console.log('測試 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('回應狀態:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP 錯誤:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ 取得資料成功');
    console.log('資料類型:', typeof data);
    console.log('是否為陣列:', Array.isArray(data));
    
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.log('物件鍵值:', Object.keys(data));
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        console.log('第一個記錄的欄位:', Object.keys(data[firstKey]));
        console.log('第一個記錄範例:', JSON.stringify(data[firstKey], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ 連接錯誤:', error.message);
  }
}

testRagicAPI();
