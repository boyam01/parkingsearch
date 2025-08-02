import { NextRequest, NextResponse } from 'next/server';
import { testRagicConnection } from '@/utils/ragicRequest';
import { debugRagicConfig, validateRagicConfig } from '@/config/ragicConfig';

// GET /api/vehicles/test - 測試 Ragic 連線
export async function GET(request: NextRequest) {
  try {
    console.log('=== 開始 Ragic 連線測試 ===');
    
    // 顯示配置資訊
    debugRagicConfig();
    
    // 驗證配置
    validateRagicConfig();
    
    // 測試連線
    const testResult = await testRagicConnection('vehicles');
    
    return NextResponse.json({
      success: true,
      message: 'Ragic 連線測試完成',
      data: {
        connectionTest: testResult,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Ragic 連線測試失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Ragic 連線測試失敗'
    }, { status: 500 });
  }
}

// POST /api/vehicles/test - 測試寫入功能
export async function POST(request: NextRequest) {
  try {
    console.log('=== 開始 Ragic 寫入測試 ===');
    
    const { ragicWrite } = await import('@/utils/ragicRequest');
    
    // 測試資料
    const testData = {
      plate: `TEST-${Date.now()}`,
      applicantName: 'API測試申請人',
      vehicleType: '轎車',
      contactPhone: '0912-345-678',
      identityType: '訪客',
      applicationDate: new Date().toISOString().split('T')[0],
      visitTime: '14:30',
      brand: 'Toyota',
      color: '白色',
      department: '測試部門',
      notes: '這是API寫入測試記錄'
    };
    
    console.log('📝 測試寫入資料:', testData);
    
    // 執行寫入測試
    const writeResult = await ragicWrite('vehicles', testData);
    
    return NextResponse.json({
      success: writeResult.success,
      message: writeResult.success ? 'Ragic 寫入測試成功' : 'Ragic 寫入測試失敗',
      data: {
        writeResult,
        testData,
        timestamp: new Date().toISOString()
      }
    }, { status: writeResult.success ? 200 : 500 });
    
  } catch (error) {
    console.error('❌ Ragic 寫入測試失敗:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Ragic 寫入測試失敗'
    }, { status: 500 });
  }
}
