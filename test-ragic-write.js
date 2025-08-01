// 測試 Ragic 寫入功能
const testRagicWrite = async () => {
  const apiKey = 'c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==';
  const baseURL = 'https://ap7.ragic.com';
  const accountName = 'xinsheng';
  const formId = '31';
  const addRecordId = '-20000';
  
  const testData = {
    '車牌號碼': 'TEST-999',
    '車輛類型': '轎車',
    '申請人姓名': '測試用戶',
    '聯絡電話': '0912345678',
    '身份類別': '訪客',
    '申請日期': '2025/08/01',
    '備註': '前端寫入測試'
  };
  
  const url = `${baseURL}/${accountName}/ragicforms${formId}/${addRecordId}?api&APIKey=${encodeURIComponent(apiKey)}`;
  
  console.log('測試 URL:', url);
  console.log('測試資料:', testData);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('回應狀態:', response.status);
    console.log('回應標頭:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('回應內容:', responseText);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('解析後的 JSON:', jsonData);
        return jsonData;
      } catch (parseError) {
        console.log('回應不是 JSON 格式，可能是成功的 HTML');
        return responseText;
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
  } catch (error) {
    console.error('錯誤:', error);
    throw error;
  }
};

// 在瀏覽器控制台執行
testRagicWrite().then(result => {
  console.log('成功結果:', result);
}).catch(error => {
  console.error('失敗:', error);
});
