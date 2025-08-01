import { NextRequest, NextResponse } from 'next/server';
import { MonthlyParkingRecord } from '@/types/membership';

// Ragic 月租車表單配置
const RAGIC_MONTHLY_PARKING_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_RAGIC_BASE_URL,
  account: process.env.NEXT_PUBLIC_RAGIC_ACCOUNT,
  apiKey: process.env.NEXT_PUBLIC_RAGIC_API_KEY,
  formId: '33',
  subtableId: '8'
};

// 欄位映射：前端 -> Ragic
const fieldMapping = {
  memberName: '1000002',
  vehiclePlate: '1000003',
  parkingSpaceNumber: '1000004',
  contractStartDate: '1000005',
  contractEndDate: '1000006',
  monthlyFee: '1000007',
  paymentMethod: '1000008',
  paymentStatus: '1000009',
  autoRenewal: '1000010',
  contactPhone: '1000011',
  notes: '1000012'
};

// 反向映射：Ragic -> 前端
const reverseFieldMapping = Object.entries(fieldMapping).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

// 轉換月租車數據：前端 -> Ragic
function transformMonthlyParkingToRagic(record: Partial<MonthlyParkingRecord>) {
  const ragicData: Record<string, any> = {};
  Object.entries(record).forEach(([key, value]) => {
    const ragicField = fieldMapping[key as keyof typeof fieldMapping];
    if (ragicField && value !== undefined) {
      ragicData[ragicField] = value;
    }
  });
  return ragicData;
}

// 轉換月租車數據：Ragic -> 前端
function transformRagicToMonthlyParking(ragicData: any): MonthlyParkingRecord {
  const record: any = { id: ragicData._ragicId };
  Object.entries(ragicData).forEach(([ragicField, value]) => {
    const frontendField = reverseFieldMapping[ragicField];
    if (frontendField) {
      record[frontendField] = value;
    }
  });
  return record;
}

// GET /api/monthly-parking/[id] - 取得單一月租車記錄
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    const url = `${RAGIC_MONTHLY_PARKING_CONFIG.baseUrl}/${RAGIC_MONTHLY_PARKING_CONFIG.account}/${RAGIC_MONTHLY_PARKING_CONFIG.formId}/${RAGIC_MONTHLY_PARKING_CONFIG.subtableId}/${recordId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${RAGIC_MONTHLY_PARKING_CONFIG.apiKey?.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: '找不到指定的月租車記錄',
          data: null
        }, { status: 404 });
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const ragicData = await response.json();
    const record = transformRagicToMonthlyParking(ragicData);

    return NextResponse.json({
      success: true,
      data: record,
      message: '月租車記錄取得成功'
    });
  } catch (error) {
    console.error('取得月租車記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '取得記錄失敗',
      data: null
    }, { status: 500 });
  }
}

// PUT /api/monthly-parking/[id] - 更新月租車記錄
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    const body = await request.json();

    // 驗證必要欄位
    const requiredFields = ['memberName', 'vehiclePlate', 'parkingSpaceNumber', 'contractStartDate', 'contractEndDate', 'monthlyFee', 'paymentMethod', 'paymentStatus', 'contactPhone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `缺少必要欄位: ${field}`,
          data: null
        }, { status: 400 });
      }
    }

    // 轉換數據格式
    const ragicData = transformMonthlyParkingToRagic(body);
    
    // 更新到 Ragic
    const url = `${RAGIC_MONTHLY_PARKING_CONFIG.baseUrl}/${RAGIC_MONTHLY_PARKING_CONFIG.account}/${RAGIC_MONTHLY_PARKING_CONFIG.formId}/${RAGIC_MONTHLY_PARKING_CONFIG.subtableId}/${recordId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${RAGIC_MONTHLY_PARKING_CONFIG.apiKey?.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ragicData)
    });

    if (!response.ok) {
      throw new Error(`更新失敗: HTTP ${response.status}`);
    }

    const updatedRagicData = await response.json();
    const updatedRecord = transformRagicToMonthlyParking(updatedRagicData);

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: '月租車記錄更新成功'
    });
  } catch (error) {
    console.error('更新月租車記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新記錄失敗',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/monthly-parking/[id] - 刪除月租車記錄
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    
    // 從 Ragic 刪除記錄
    const url = `${RAGIC_MONTHLY_PARKING_CONFIG.baseUrl}/${RAGIC_MONTHLY_PARKING_CONFIG.account}/${RAGIC_MONTHLY_PARKING_CONFIG.formId}/${RAGIC_MONTHLY_PARKING_CONFIG.subtableId}/${recordId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${RAGIC_MONTHLY_PARKING_CONFIG.apiKey?.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: '找不到要刪除的月租車記錄',
          data: null
        }, { status: 404 });
      }
      throw new Error(`刪除失敗: HTTP ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      data: { id: recordId },
      message: '月租車記錄刪除成功'
    });
  } catch (error) {
    console.error('刪除月租車記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除記錄失敗',
      data: null
    }, { status: 500 });
  }
}
