import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';
import { RagicAPI } from '@/lib/api';

// GET /api/vehicles - 取得所有車輛記錄
export async function GET(request: NextRequest) {
  try {
    console.log('=== API /vehicles 被呼叫 ===');
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    console.log('搜尋參數:', query);

    // 直接從 Ragic 取得車輛資料
    console.log('🔍 開始從 Ragic 取得資料...');
    let vehicles = await RagicAPI.getRecords();
    console.log('📊 從 Ragic 取得資料筆數:', vehicles.length);

    // 如果有搜尋查詢，進行過濾
    if (query) {
      const normalizedQuery = query.toLowerCase();
      vehicles = vehicles.filter(vehicle => {
        return (
          vehicle.plate.toLowerCase().includes(normalizedQuery) ||
          vehicle.applicantName.toLowerCase().includes(normalizedQuery) ||
          vehicle.vehicleType.toLowerCase().includes(normalizedQuery) ||
          vehicle.identityType.toLowerCase().includes(normalizedQuery) ||
          vehicle.department?.toLowerCase().includes(normalizedQuery) ||
          vehicle.brand?.toLowerCase().includes(normalizedQuery) ||
          vehicle.color?.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    console.log(`✅ API: 返回 ${vehicles.length} 筆車輛記錄`);

    return NextResponse.json({
      success: true,
      data: vehicles,
      message: `找到 ${vehicles.length} 筆記錄`
    });
  } catch (error) {
    console.error('❌ API 錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '取得車輛資料失敗',
      data: []
    }, { status: 500 });
  }
}

// POST /api/vehicles - 新增車輛記錄
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/vehicles 開始處理 ===');
    
    // 解析請求內容
    let body;
    try {
      body = await request.json();
      console.log('📝 收到的資料:', body);
    } catch (parseError) {
      console.error('❌ 解析請求內容失敗:', parseError);
      return NextResponse.json({
        success: false,
        error: '請求格式錯誤',
        data: null
      }, { status: 400 });
    }
    
    // 驗證必要欄位
    const requiredFields = ['plate', 'vehicleType', 'applicantName', 'contactPhone', 'identityType'];
    const missingFields = requiredFields.filter(field => !body[field] || String(body[field]).trim() === '');
    
    if (missingFields.length > 0) {
      console.error('❌ 缺少必要欄位:', missingFields);
      return NextResponse.json({
        success: false,
        error: `缺少必要欄位: ${missingFields.join(', ')}`,
        data: null
      }, { status: 400 });
    }

    // 檢查配額限制
    try {
      const quotaResponse = await fetch(`${request.nextUrl.origin}/api/quota?action=check&vehicleType=${body.vehicleType}&identityType=${body.identityType}`);
      const quotaData = await quotaResponse.json();
      
      if (!quotaData.success) {
        console.warn('⚠️ 配額檢查失敗，但繼續處理');
      } else if (!quotaData.data.canApply) {
        return NextResponse.json({
          success: false,
          error: quotaData.data.reason || '已達配額上限，無法新增車輛申請',
          data: null,
          quotaStatus: quotaData.data.quotaStatus
        }, { status: 409 });
      }
    } catch (quotaError) {
      console.warn('⚠️ 配額檢查發生錯誤，但繼續處理:', quotaError);
    }

    // 檢查車牌是否已存在
    try {
      console.log('🔍 檢查車牌是否重複...');
      const vehicles = await RagicAPI.getRecords();
      const existingVehicle = vehicles.find(v => v.plate === body.plate);
      if (existingVehicle) {
        return NextResponse.json({
          success: false,
          error: `車牌號碼 ${body.plate} 已存在`,
          data: null
        }, { status: 409 });
      }
    } catch (checkError) {
      console.warn('⚠️ 檢查重複車牌時發生錯誤，但繼續處理:', checkError);
    }

    // 準備新車輛資料
    const newVehicleData: Partial<VehicleRecord> = {
      plate: String(body.plate).trim(),
      vehicleType: body.vehicleType,
      applicantName: String(body.applicantName).trim(),
      contactPhone: String(body.contactPhone).trim(),
      identityType: body.identityType,
      applicationDate: body.applicationDate || new Date().toISOString().split('T')[0],
      visitTime: body.visitTime ? String(body.visitTime).trim() : '',
      brand: body.brand ? String(body.brand).trim() : '',
      color: body.color ? String(body.color).trim() : '',
      department: body.department ? String(body.department).trim() : '',
      approvalStatus: body.approvalStatus || 'pending',
      notes: body.notes ? String(body.notes).trim() : ''
    };

    console.log('💾 準備寫入資料:', newVehicleData);

    // 儲存到 Ragic
    const newVehicle = await RagicAPI.createRecord(newVehicleData);
    
    console.log('✅ 車輛記錄建立成功:', newVehicle);

    return NextResponse.json({
      success: true,
      data: newVehicle,
      message: `車輛 ${newVehicle.plate} 記錄建立成功`
    }, { status: 201 });
  } catch (error) {
    console.error('💥 建立車輛記錄錯誤:', error);
    
    // 根據錯誤類型提供不同的回應
    let errorMessage = '建立記錄失敗';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API_KEY') || error.message.includes('API Key')) {
        errorMessage = 'Ragic API 驗證失敗，請檢查設定';
        statusCode = 401;
      } else if (error.message.includes('缺少必要欄位')) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (error.message.includes('網路') || error.message.includes('fetch')) {
        errorMessage = '無法連接到資料庫，請稍後再試';
        statusCode = 503;
      } else {
        errorMessage = error.message || errorMessage;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: null,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: statusCode });
  }
}
