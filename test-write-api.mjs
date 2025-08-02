import fetch from 'node-fetch';

const testData = {
  plate: "TEST" + Date.now(),
  vehicleType: "car",
  applicantName: "API測試用戶",
  contactPhone: "0912345678",
  identityType: "visitor",
  applicationDate: "2025-08-02"
};

console.log('🚀 開始測試寫入功能...');
console.log('📝 測試資料:', testData);

async function testWrite() {
  try {
    console.log('📡 發送請求到 API...');
    const response = await fetch('http://localhost:3000/api/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 回應狀態:', response.status);
    console.log('📊 回應標頭:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('✅ 回應資料:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('🎉 寫入成功！新記錄 ID:', data.data.id);
    } else {
      console.error('❌ 寫入失敗:', data.error);
      if (data.details) {
        console.error('💡 詳細錯誤:', data.details);
      }
    }
  } catch (error) {
    console.error('💥 請求錯誤:', error.message);
    console.error('💥 完整錯誤:', error);
  }
}

testWrite();
