const testData = {
  plate: "TEST" + Date.now(),
  vehicleType: "car",
  applicantName: "API測試用戶",
  contactPhone: "0912345678",
  identityType: "visitor",
  applicationDate: "2025-08-02",
  brand: "Honda",
  color: "白色",
  department: "測試部門",
  notes: "API寫入測試"
};

console.log('🚀 開始測試寫入功能...');
console.log('📝 測試資料:', testData);

fetch('http://localhost:3000/api/vehicles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📊 回應狀態:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ 回應資料:', data);
  if (data.success) {
    console.log('🎉 寫入成功！');
    console.log('📋 新記錄:', data.data);
  } else {
    console.error('❌ 寫入失敗:', data.error);
  }
})
.catch(error => {
  console.error('💥 請求錯誤:', error);
});
