import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';
import { RagicAPI } from '@/lib/api';

// POST /api/force-write - 強制寫入測試資料到 Ragic
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 強制寫入 API 被呼叫');
    
    const body = await request.json();
    console.log('接收到的資料:', body);

    // 如果沒有提供資料，使用測試資料
    const testData: Partial<VehicleRecord> = body.data || {
      plate: `TEST-${Date.now().toString().slice(-4)}`,
      vehicleType: 'car',
      applicantName: '測試申請人',
      contactPhone: '0912-345-678',
      identityType: 'visitor',
      applicationDate: new Date().toISOString().split('T')[0],
      visitTime: '09:00',
      brand: '測試品牌',
      color: '白色',
      department: '測試部門',
      approvalStatus: 'pending',
      notes: '強制寫入測試資料',
      submittedBy: 'force-write-api',
      ipAddress: request.headers.get('x-forwarded-for') || 'test',
      userAgent: request.headers.get('user-agent') || 'test-agent'
    };

    console.log('準備強制寫入的測試資料:', testData);

    // 強制寫入到 Ragic
    const result = await RagicAPI.createRecord(testData);
    
    console.log('✅ 強制寫入成功結果:', result);

    return NextResponse.json({
      success: true,
      message: '強制寫入成功！',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 強制寫入失敗:', error);
    
    return NextResponse.json({
      success: false,
      message: '強制寫入失敗',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET /api/force-write - 取得強制寫入測試說明
export async function GET() {
  return NextResponse.json({
    message: '強制寫入 API',
    usage: {
      method: 'POST',
      endpoint: '/api/force-write',
      description: '強制寫入測試資料到 Ragic 資料庫',
      body: {
        data: 'VehicleRecord 部分資料 (可選，不提供則使用預設測試資料)'
      }
    },
    example: {
      data: {
        plate: 'ABC-1234',
        vehicleType: 'car',
        applicantName: '張三',
        contactPhone: '0912-345-678',
        identityType: 'staff'
      }
    }
  });
}
