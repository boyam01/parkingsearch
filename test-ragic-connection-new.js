import { RagicAPI } from '../src/lib/api.js';

console.log('🧪 開始測試 Ragic API 連接...');
console.log('環境變數檢查:');
console.log('- RAGIC_BASE_URL:', process.env.NEXT_PUBLIC_RAGIC_BASE_URL);
console.log('- RAGIC_API_KEY:', process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '已設定' : '未設定');
console.log('- RAGIC_ACCOUNT:', process.env.NEXT_PUBLIC_RAGIC_ACCOUNT);
console.log('- RAGIC_FORM_ID:', process.env.NEXT_PUBLIC_RAGIC_FORM_ID);
console.log('- RAGIC_SUBTABLE_ID:', process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID);

async function testRagicConnection() {
  try {
    console.log('\n📡 測試 Ragic API 連接...');
    const records = await RagicAPI.getRecords();
    console.log('✅ 成功取得記錄:', records.length);
    
    if (records.length > 0) {
      console.log('\n📊 第一筆記錄範例:');
      console.log(JSON.stringify(records[0], null, 2));
    }
    
    return records;
  } catch (error) {
    console.error('❌ Ragic API 連接失敗:', error);
    return [];
  }
}

// 執行測試
testRagicConnection();
