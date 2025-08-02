import { NextRequest, NextResponse } from 'next/server';
import { ragicRead, ragicWrite } from '@/utils/ragicRequest';
import { validateRagicConfig } from '@/config/ragicConfig';

// GET /api/vehicles - 查詢車輛資料
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/vehicles 開始 ===');
    
    // 驗證配置
    validateRagicConfig();
    
    const { searchParams } = new URL(request.url);
    const plate = searchParams.get('plate');
    const limit = searchParams.get('limit');
    
    console.log('📝 查詢參數:', { plate, limit });
    
    // 使用新的 ragicRead 函數
    const result = await ragicRead('vehicles');
    
    if (result.success) {
      console.log('✅ 查詢成功，記錄數:', Array.isArray(result.data) ? result.data.length : 1);
      return NextResponse.json({
        success: true,
        data: result.data,
        count: Array.isArray(result.data) ? result.data.length : 1
      });
    } else {
      console.error('❌ 查詢失敗:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: '查詢車輛資料失敗'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('💥 GET /api/vehicles 異常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '查詢車輛資料時發生錯誤'
    }, { status: 500 });
  }
}

// POST /api/vehicles - 新增車輛資料
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/vehicles 開始 ===');
    
    // 驗證配置
    validateRagicConfig();
    
    const body = await request.json();
    console.log('📝 接收到的資料:', body);
    
    // 驗證必要欄位
    const { plate, applicantName, contactPhone } = body;
    if (!plate || !applicantName || !contactPhone) {
      return NextResponse.json({
        success: false,
        error: '缺少必要欄位：車牌號碼、申請人姓名、聯絡電話',
        message: '請填寫完整的車輛資訊'
      }, { status: 400 });
    }
    
    // 使用新的 ragicWrite 函數
    const result = await ragicWrite('vehicles', body);
    
    if (result.success) {
      console.log('✅ 寫入成功，記錄 ID:', result.data?.recordId);
      return NextResponse.json({
        success: true,
        data: result.data,
        message: '車輛資料新增成功'
      });
    } else {
      console.error('❌ 寫入失敗:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        message: '新增車輛資料失敗'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('💥 POST /api/vehicles 異常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '新增車輛資料時發生錯誤'
    }, { status: 500 });
  }
}
