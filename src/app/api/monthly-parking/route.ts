import { NextRequest, NextResponse } from 'next/server';
import { MonthlyParkingRecord, MembershipApiResponse } from '@/types/membership';

// Ragic 欄位對應 - 月租車資料表
const MONTHLY_PARKING_FIELD_MAPPING = {
  memberId: '1004030', // 會員ID
  memberNumber: '1004031', // 會員編號
  plate: '1004032', // 車牌號碼
  vehicleType: '1004033', // 車輛類型
  brand: '1004034', // 車輛品牌
  color: '1004035', // 車輛顏色
  model: '1004036', // 車型
  parkingSpaceNumber: '1004037', // 停車位號碼
  contractStartDate: '1004038', // 合約開始日期
  contractEndDate: '1004039', // 合約結束日期
  monthlyFee: '1004040', // 月租費用
  paymentStatus: '1004041', // 付款狀態
  paymentMethod: '1004042', // 付款方式
  lastPaymentDate: '1004043', // 最後付款日期
  nextPaymentDue: '1004044', // 下次付款到期日
  status: '1004045', // 狀態
  notes: '1004046' // 備註
};

// 轉換月租車資料為 Ragic 格式
function transformMonthlyParkingToRagic(record: Partial<MonthlyParkingRecord>): Record<string, string> {
  const ragicData: Record<string, string> = {};
  
  Object.entries(MONTHLY_PARKING_FIELD_MAPPING).forEach(([key, ragicField]) => {
    const value = record[key as keyof MonthlyParkingRecord];
    if (value !== undefined && value !== null) {
      ragicData[ragicField] = String(value);
    }
  });
  
  return ragicData;
}

// 轉換 Ragic 資料為月租車格式
function transformRagicToMonthlyParking(ragicData: any): MonthlyParkingRecord {
  return {
    id: ragicData._ragicId?.toString() || '0',
    memberId: ragicData[MONTHLY_PARKING_FIELD_MAPPING.memberId] || '',
    memberNumber: ragicData[MONTHLY_PARKING_FIELD_MAPPING.memberNumber] || '',
    plate: ragicData[MONTHLY_PARKING_FIELD_MAPPING.plate] || '',
    vehicleType: ragicData[MONTHLY_PARKING_FIELD_MAPPING.vehicleType] as any || 'car',
    brand: ragicData[MONTHLY_PARKING_FIELD_MAPPING.brand] || '',
    color: ragicData[MONTHLY_PARKING_FIELD_MAPPING.color] || '',
    model: ragicData[MONTHLY_PARKING_FIELD_MAPPING.model] || '',
    parkingSpaceNumber: ragicData[MONTHLY_PARKING_FIELD_MAPPING.parkingSpaceNumber] || '',
    contractStartDate: ragicData[MONTHLY_PARKING_FIELD_MAPPING.contractStartDate] || '',
    contractEndDate: ragicData[MONTHLY_PARKING_FIELD_MAPPING.contractEndDate] || '',
    monthlyFee: parseFloat(ragicData[MONTHLY_PARKING_FIELD_MAPPING.monthlyFee]) || 0,
    paymentStatus: ragicData[MONTHLY_PARKING_FIELD_MAPPING.paymentStatus] as any || 'pending',
    paymentMethod: ragicData[MONTHLY_PARKING_FIELD_MAPPING.paymentMethod] as any || 'cash',
    lastPaymentDate: ragicData[MONTHLY_PARKING_FIELD_MAPPING.lastPaymentDate] || '',
    nextPaymentDue: ragicData[MONTHLY_PARKING_FIELD_MAPPING.nextPaymentDue] || '',
    status: ragicData[MONTHLY_PARKING_FIELD_MAPPING.status] as any || 'active',
    notes: ragicData[MONTHLY_PARKING_FIELD_MAPPING.notes] || '',
    renewalReminders: [], // 這會從另一個資料表載入
    createdAt: ragicData._create_date 
      ? new Date(ragicData._create_date).toISOString() 
      : new Date().toISOString(),
    updatedAt: ragicData._update_date 
      ? new Date(ragicData._update_date).toISOString() 
      : new Date().toISOString()
  } as MonthlyParkingRecord;
}

// GET: 取得所有月租車記錄
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');
    const status = url.searchParams.get('status');
    const expiringWithinDays = url.searchParams.get('expiringWithinDays');

    // 從 Ragic 取得月租車資料
    const ragicResponse = await fetch(
      `https://ap7.ragic.com/xinsheng/ragicforms33/8?api&APIKey=${process.env.NEXT_PUBLIC_RAGIC_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ragicResponse.ok) {
      throw new Error(`Ragic API 錯誤: ${ragicResponse.status}`);
    }

    const ragicData = await ragicResponse.json();
    
    // 轉換為月租車格式
    let records: MonthlyParkingRecord[] = [];
    if (ragicData && typeof ragicData === 'object') {
      records = Object.values(ragicData)
        .filter((item: any) => item && typeof item === 'object' && item._ragicId !== undefined)
        .map(transformRagicToMonthlyParking);
    }

    // 應用篩選
    if (memberId) {
      records = records.filter(record => record.memberId === memberId);
    }

    if (status) {
      records = records.filter(record => record.status === status);
    }

    if (expiringWithinDays) {
      const days = parseInt(expiringWithinDays);
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + days);
      
      records = records.filter(record => {
        const endDate = new Date(record.contractEndDate);
        return endDate <= targetDate && endDate >= now;
      });
    }

    return NextResponse.json<MembershipApiResponse<MonthlyParkingRecord[]>>({
      success: true,
      data: records,
      message: `成功取得 ${records.length} 筆月租車資料`
    });

  } catch (error) {
    console.error('取得月租車資料失敗:', error);
    return NextResponse.json<MembershipApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '取得月租車資料失敗'
    }, { status: 500 });
  }
}

// POST: 新增月租車記錄
export async function POST(request: NextRequest) {
  try {
    const recordData: Partial<MonthlyParkingRecord> = await request.json();
    
    // 設定預設值
    recordData.status = recordData.status || 'active';
    recordData.paymentStatus = recordData.paymentStatus || 'pending';
    recordData.paymentMethod = recordData.paymentMethod || 'cash';
    
    // 計算下次付款到期日
    if (!recordData.nextPaymentDue && recordData.contractStartDate) {
      const startDate = new Date(recordData.contractStartDate);
      const nextDue = new Date(startDate);
      nextDue.setMonth(startDate.getMonth() + 1);
      recordData.nextPaymentDue = nextDue.toISOString().split('T')[0];
    }
    
    // 轉換為 Ragic 格式
    const ragicData = transformMonthlyParkingToRagic(recordData);
    
    // 提交到 Ragic
    const response = await fetch(
      `https://ap7.ragic.com/xinsheng/ragicforms33/8?api&APIKey=${process.env.NEXT_PUBLIC_RAGIC_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(ragicData).toString()
      }
    );

    if (!response.ok) {
      throw new Error(`Ragic API 錯誤: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'SUCCESS') {
      const newRecord = transformRagicToMonthlyParking(result.data);
      
      return NextResponse.json<MembershipApiResponse<MonthlyParkingRecord>>({
        success: true,
        data: newRecord,
        message: '月租車記錄建立成功'
      }, { status: 201 });
    } else {
      throw new Error(result.msg || '建立月租車記錄失敗');
    }

  } catch (error) {
    console.error('建立月租車記錄失敗:', error);
    return NextResponse.json<MembershipApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '建立月租車記錄失敗'
    }, { status: 500 });
  }
}
