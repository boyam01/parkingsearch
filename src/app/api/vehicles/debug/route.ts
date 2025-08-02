import { NextRequest, NextResponse } from 'next/server';
import { ragicConfig, RagicDataTransformer } from '@/config/ragicConfig';

// GET /api/vehicles/debug - 診斷配置和欄位映射
export async function GET(request: NextRequest) {
  try {
    const vehicleConfig = ragicConfig.forms.vehicles;
    
    // 準備診斷資訊
    const diagnostics = {
      configuration: {
        formId: vehicleConfig.formId,
        subtableId: vehicleConfig.subtableId,
        writeSubtableId: vehicleConfig.writeSubtableId,
        baseURL: ragicConfig.baseURL,
        account: ragicConfig.account
      },
      
      fieldMapping: vehicleConfig.fieldMapping,
      
      // 測試資料轉換
      testData: {
        plate: 'TEST-DEBUG',
        applicantName: '測試申請人',
        vehicleType: '轎車',
        contactPhone: '0912-345-678'
      },
      
      // 顯示轉換結果
      transformedData: {},
      
      // 構建的 URL
      urls: {
        read: `${ragicConfig.baseURL}/${ragicConfig.account}/ragicforms${vehicleConfig.formId}/${vehicleConfig.subtableId}?api&APIKey=${ragicConfig.apiKey}`,
        write: `${ragicConfig.baseURL}/${ragicConfig.account}/ragicforms${vehicleConfig.writeSubtableId ? vehicleConfig.formId : vehicleConfig.formId}/${vehicleConfig.writeSubtableId || vehicleConfig.subtableId}?api&APIKey=${ragicConfig.apiKey}`
      }
    };
    
    // 執行資料轉換測試
    diagnostics.transformedData = RagicDataTransformer.toRagicFormat('vehicles', diagnostics.testData);
    
    return NextResponse.json({
      success: true,
      message: '診斷資訊已生成',
      data: diagnostics
    });
    
  } catch (error) {
    console.error('❌ 診斷失敗:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '診斷過程中發生錯誤'
    }, { status: 500 });
  }
}

// POST /api/vehicles/debug - 測試特定欄位寫入
export async function POST(request: NextRequest) {
  try {
    const { ragicWrite } = await import('@/utils/ragicRequest');
    const body = await request.json();
    
    // 如果沒有提供測試資料，使用預設值
    const testData = body.testData || {
      plate: `DEBUG-${Date.now()}`,
      applicantName: '診斷測試申請人',
      contactPhone: '0912-999-888'
    };
    
    console.log('🔍 開始診斷寫入測試:', testData);
    
    // 嘗試寫入
    const result = await ragicWrite('vehicles', testData);
    
    return NextResponse.json({
      success: true,
      message: '診斷寫入測試完成',
      data: {
        testData,
        result,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ 診斷寫入測試失敗:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '診斷寫入測試失敗'
    }, { status: 500 });
  }
}
