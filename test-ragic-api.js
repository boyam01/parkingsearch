/**
 * 🚨 DEMO 前 Ragic API 測試腳本
 * 
 * 使用方法：
 * 1. 確保 .env.local 設定正確
 * 2. 運行：node test-ragic-api.js
 * 3. 檢查所有測試是否通過
 */

const https = require('https');
const { URLSearchParams } = require('url');

// 從環境變數讀取設定
const config = {
  baseURL: 'https://ap7.ragic.com',
  account: 'xinsheng',
  apiKey: 'c0VySnlCOEJ6dHlndkRHY0pUOTFEMnh6Zmo3VE9lYWdwbjB5d2tIcTRDZE1GMHB2NUFBUUZVZFByWVhxK1JGR3FSN2tDd2ttVlgwPQ==',
  formId: '31',
  subtableId: '6'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testRagicRead() {
  console.log('🔍 測試 1：讀取 Ragic 資料...');
  
  const url = `${config.baseURL}/${config.account}/ragicforms${config.formId}/${config.subtableId}?api&APIKey=${encodeURIComponent(config.apiKey)}`;
  
  try {
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 200) {
      const recordCount = Object.keys(response.data).length;
      console.log('✅ 讀取成功！共', recordCount, '筆記錄');
      return true;
    } else {
      console.log('❌ 讀取失敗：HTTP', response.status);
      console.log('回應內容:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ 讀取錯誤:', error.message);
    return false;
  }
}

async function testRagicWrite() {
  console.log('✍️ 測試 2：寫入 Ragic 資料...');
  
  const testData = {
    '1003984': `TEST-API-${Date.now()}`, // 車牌號碼
    '1003988': '轎車',                    // 車輛類型
    '1003990': 'API測試申請人',           // 申請人姓名
    '1003992': '0900123456',             // 聯絡電話
    '1003994': '2025/08/01',             // 申請日期
    '1003986': '10:30',                  // 到訪時間
    '1003989': '訪客',                   // 身分類別
    '1003991': 'Honda',                  // 車輛品牌
    '1003995': 'IT部門'                  // 部門
  };
  
  const url = `${config.baseURL}/${config.account}/ragicforms${config.formId}/${config.subtableId}?api&APIKey=${encodeURIComponent(config.apiKey)}`;
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(testData).toString()
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ 寫入成功！');
      console.log('新記錄資料:', response.data);
      return response.data;
    } else {
      console.log('❌ 寫入失敗：HTTP', response.status);
      console.log('錯誤詳情:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ 寫入錯誤:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 開始 Ragic API 完整測試...');
  console.log('==========================================');
  
  // 顯示配置資訊
  console.log('📋 測試配置:');
  console.log('- Ragic URL:', config.baseURL);
  console.log('- 帳戶:', config.account);
  console.log('- 表單 ID:', config.formId);
  console.log('- 子表 ID:', config.subtableId);
  console.log('- API Key:', config.apiKey ? '已設定' : '未設定');
  console.log('==========================================');
  
  let passedTests = 0;
  const totalTests = 2;
  
  // 測試 1：讀取
  if (await testRagicRead()) {
    passedTests++;
  }
  
  console.log('');
  
  // 測試 2：寫入
  if (await testRagicWrite()) {
    passedTests++;
  }
  
  console.log('');
  console.log('==========================================');
  console.log('📊 測試結果摘要:');
  console.log(`✅ 通過: ${passedTests}/${totalTests}`);
  console.log(`❌ 失敗: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有測試通過！系統準備就緒，可以進行 DEMO！');
  } else {
    console.log('🚨 有測試失敗！請檢查 Ragic 設定和 API Key 權限！');
  }
  
  console.log('==========================================');
}

// 執行測試
runAllTests().catch(console.error);
