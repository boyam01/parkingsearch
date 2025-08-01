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
    const body = await request.json();
    
    // 檢查配額限制
    const quotaResponse = await fetch(`${request.nextUrl.origin}/api/quota?action=check&vehicleType=${body.vehicleType}&identityType=${body.identityType}`);
    const quotaData = await quotaResponse.json();
    
    if (!quotaData.success) {
      return NextResponse.json({
        success: false,
        error: '無法檢查配額狀態',
        data: null
      }, { status: 500 });
    }
    
    if (!quotaData.data.canApply) {
      return NextResponse.json({
        success: false,
        error: quotaData.data.reason || '已達配額上限，無法新增車輛申請',
        data: null,
        quotaStatus: quotaData.data.quotaStatus
      }, { status: 409 }); // Conflict
    }
    
    // 驗證必要欄位
    const requiredFields = ['plate', 'vehicleType', 'applicantName', 'contactPhone', 'identityType', 'applicationDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `缺少必要欄位: ${field}`,
          data: null
        }, { status: 400 });
      }
    }

    // 檢查車牌是否已存在
    const vehicles = await RagicAPI.getRecords();
    const existingVehicle = vehicles.find(v => v.plate === body.plate);
    if (existingVehicle) {
      return NextResponse.json({
        success: false,
        error: '車牌號碼已存在',
        data: null
      }, { status: 409 });
    }

    // 創建新記錄
    const newVehicleData: Partial<VehicleRecord> = {
      plate: body.plate,
      vehicleType: body.vehicleType,
      applicantName: body.applicantName,
      contactPhone: body.contactPhone,
      identityType: body.identityType,
      applicationDate: body.applicationDate,
      visitTime: body.visitTime || '',
      brand: body.brand || '',
      color: body.color || '',
      department: body.department || '',
      approvalStatus: body.approvalStatus || 'pending',
      notes: body.notes || ''
    };

    // 儲存到 Ragic
    const newVehicle = await RagicAPI.createRecord(newVehicleData);

    return NextResponse.json({
      success: true,
      data: newVehicle,
      message: '車輛記錄建立成功'
    }, { status: 201 });
  } catch (error) {
    console.error('建立車輛記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '建立記錄失敗',
      data: null
    }, { status: 500 });
  }
}
