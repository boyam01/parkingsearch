// 簡單的 Ragic API 測試腳本
async function testRagicConnection() {
  const baseURL = 'https://ap7.ragic.com';
  const accountName = 'xinsheng';
  const formId = '31';
  const subtableId = '6';
  const apiKey = 'c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdnMGQvY3IwaEhXT0d1SndhaEZLdWFzVURUM1dOYjlPMHV0RkI1MzlyS0xjPQ==';

  const url = `${baseURL}/${accountName}/ragicforms${formId}/${subtableId}?api&APIKey=${encodeURIComponent(apiKey)}`;
  
  console.log('測試 URL:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('錯誤回應:', errorText);
      return;
    }

    const data = await response.json();
    console.log('成功取得資料:', data);
    
  } catch (error) {
    console.error('連接錯誤:', error);
  }
}

testRagicConnection();
