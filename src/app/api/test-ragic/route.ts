import { NextRequest, NextResponse } from 'next/server';
import { RagicAPI } from '@/lib/api';

// POST /api/test-ragic - 測試 Ragic API 連接
export async function POST(request: NextRequest) {
  try {
    const { apiKey, action } = await request.json();
    
    if (action === 'test-connection' && apiKey) {
      // 臨時設定 API Key 進行測試
      const originalApiKey = process.env.NEXT_PUBLIC_RAGIC_API_KEY;
      (process.env as any).NEXT_PUBLIC_RAGIC_API_KEY = apiKey;
      
      try {
        // 測試 Ragic API 連接
        const records = await RagicAPI.getRecords();
        
        // 恢復原本的 API Key
        if (originalApiKey) {
          (process.env as any).NEXT_PUBLIC_RAGIC_API_KEY = originalApiKey;
        }
        
        return NextResponse.json({
          success: true,
          data: {
            recordCount: records.length,
            sampleRecords: records.slice(0, 2) // 返回前2筆作為範例
          },
          message: `成功連接 Ragic，找到 ${records.length} 筆記錄`
        });
      } catch (error) {
        // 恢復原本的 API Key
        if (originalApiKey) {
          (process.env as any).NEXT_PUBLIC_RAGIC_API_KEY = originalApiKey;
        }
        throw error;
      }
    }
    
    // 原本的測試寫入功能
    console.log('🧪 開始測試 Ragic 寫入功能...');
    
    const testVehicle = {
      plate: 'TEST-' + Math.floor(Math.random() * 1000),
      vehicleType: 'car' as const,
      applicantName: '測試用戶',
      contactPhone: '0912345678',
      identityType: 'visitor' as const,
      applicationDate: new Date().toISOString().split('T')[0],
      visitTime: '09:00',
      brand: 'Toyota',
      color: '白色',
      department: '測試部門',
      approvalStatus: 'pending' as const,
      notes: '這是一個測試記錄 - ' + new Date().toLocaleString()
    };

    console.log('🧪 測試資料:', testVehicle);

    // 使用 RagicAPI.createRecord 進行測試
    const result = await RagicAPI.createRecord(testVehicle);
    
    console.log('✅ 測試成功，建立的記錄:', result);

    return NextResponse.json({
      success: true,
      message: '✅ Ragic 寫入測試成功！',
      data: result,
      testData: testVehicle
    });
  } catch (error) {
    console.error('❌ Ragic 寫入測試失敗:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Ragic 寫入測試失敗',
      error: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET /api/test-ragic - 測試 Ragic 讀取功能
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 開始測試 Ragic 讀取功能...');
    
    const records = await RagicAPI.getRecords();
    
    console.log(`✅ 讀取成功，找到 ${records.length} 筆記錄`);

    return NextResponse.json({
      success: true,
      message: `✅ Ragic 讀取測試成功！找到 ${records.length} 筆記錄`,
      count: records.length,
      data: records.slice(0, 3) // 只返回前 3 筆記錄作為範例
    });
  } catch (error) {
    console.error('❌ Ragic 讀取測試失敗:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Ragic 讀取測試失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
