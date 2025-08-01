import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';
import { RagicAPI } from '@/lib/api';

// GET /api/vehicles/[id] - 根據 ID 取得單一車輛記錄
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const vehicle = await RagicAPI.getRecordById(id);

    if (!vehicle) {
      return NextResponse.json({
        success: false,
        error: '找不到車輛記錄',
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: '車輛記錄取得成功'
    });
  } catch (error) {
    console.error('取得車輛記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '伺服器錯誤',
      data: null
    }, { status: 500 });
  }
}

// PUT /api/vehicles/[id] - 更新車輛記錄
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    console.log('更新車輛記錄 ID:', id);
    console.log('更新資料:', body);

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

    // 檢查記錄是否存在
    const existingRecord = await RagicAPI.getRecordById(id);
    if (!existingRecord) {
      return NextResponse.json({
        success: false,
        error: '找不到要更新的記錄',
        data: null
      }, { status: 404 });
    }

    // 更新記錄
    const updatedVehicleData: Partial<VehicleRecord> = {
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

    const updatedVehicle = await RagicAPI.updateRecord(id, updatedVehicleData);

    return NextResponse.json({
      success: true,
      data: updatedVehicle,
      message: '車輛記錄更新成功'
    });
  } catch (error) {
    console.error('更新車輛記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新記錄失敗',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/vehicles/[id] - 刪除車輛記錄
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    console.log('刪除車輛記錄 ID:', id);

    // 檢查記錄是否存在
    const existingRecord = await RagicAPI.getRecordById(id);
    if (!existingRecord) {
      return NextResponse.json({
        success: false,
        error: '找不到要刪除的記錄',
        data: null
      }, { status: 404 });
    }

    // 刪除記錄
    await RagicAPI.deleteRecord(id);

    return NextResponse.json({
      success: true,
      data: null,
      message: '車輛記錄刪除成功'
    });
  } catch (error) {
    console.error('刪除車輛記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除記錄失敗',
      data: null
    }, { status: 500 });
  }
}
