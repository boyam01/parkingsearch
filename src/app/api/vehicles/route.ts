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

    // 暫時使用更多測試資料，確認前端顯示正常
    const testVehicles: VehicleRecord[] = [
      {
        id: '1',
        plate: 'ABC-1234',
        vehicleType: '轎車',
        applicantName: '張三',
        contactPhone: '0912-345-678',
        identityType: '同仁',
        applicationDate: '2024-01-15',
        visitTime: '09:00',
        brand: 'Toyota',
        color: '白色',
        department: '資訊部',
        approvalStatus: 'approved',
        notes: '長期停車',
        createdAt: '2024-01-15T09:00:00.000Z',
        updatedAt: '2024-01-15T09:00:00.000Z',
        submittedBy: 'admin'
      },
      {
        id: '2',
        plate: 'DEF-5678',
        vehicleType: '機車',
        applicantName: '李四',
        contactPhone: '0923-456-789',
        identityType: '一般訪客',
        applicationDate: '2024-01-16',
        visitTime: '14:30',
        brand: 'Yamaha',
        color: '黑色',
        department: '',
        approvalStatus: 'pending',
        notes: '臨時訪客',
        createdAt: '2024-01-16T14:30:00.000Z',
        updatedAt: '2024-01-16T14:30:00.000Z',
        submittedBy: 'self'
      },
      {
        id: '3',
        plate: 'GHI-9012',
        vehicleType: '貴賓用車',
        applicantName: '王五',
        contactPhone: '0934-567-890',
        identityType: '長官',
        applicationDate: '2024-01-17',
        visitTime: '10:00',
        brand: 'Mercedes-Benz',
        color: '黑色',
        department: '總經理室',
        approvalStatus: 'approved',
        notes: '貴賓車輛',
        createdAt: '2024-01-17T10:00:00.000Z',
        updatedAt: '2024-01-17T10:00:00.000Z',
        submittedBy: 'admin'
      },
      {
        id: '4',
        plate: 'JKL-3456',
        vehicleType: '轎車',
        applicantName: '陳六',
        contactPhone: '0945-678-901',
        identityType: '關係企業',
        applicationDate: '2024-01-18',
        visitTime: '15:45',
        brand: 'Honda',
        color: '銀色',
        department: '合作夥伴',
        approvalStatus: 'approved',
        notes: '合作廠商代表',
        createdAt: '2024-01-18T15:45:00.000Z',
        updatedAt: '2024-01-18T15:45:00.000Z',
        submittedBy: 'self'
      },
      {
        id: '5',
        plate: 'MNO-7890',
        vehicleType: '轎車',
        applicantName: '林七',
        contactPhone: '0956-789-012',
        identityType: '一般訪客',
        applicationDate: '2024-01-19',
        visitTime: '08:30',
        brand: 'Nissan',
        color: '藍色',
        department: '',
        approvalStatus: 'rejected',
        notes: '資料不完整',
        createdAt: '2024-01-19T08:30:00.000Z',
        updatedAt: '2024-01-19T08:30:00.000Z',
        submittedBy: 'self'
      },
      {
        id: '6',
        plate: 'PQR-2468',
        vehicleType: '轎車',
        applicantName: '吳八',
        contactPhone: '0967-890-123',
        identityType: '同仁',
        applicationDate: '2024-08-01',
        visitTime: '08:00',
        brand: 'BMW',
        color: '白色',
        department: '業務部',
        approvalStatus: 'approved',
        notes: '員工車輛',
        createdAt: '2024-08-01T08:00:00.000Z',
        updatedAt: '2024-08-01T08:00:00.000Z',
        submittedBy: 'admin'
      },
      {
        id: '7',
        plate: 'STU-1357',
        vehicleType: '機車',
        applicantName: '劉九',
        contactPhone: '0978-901-234',
        identityType: '關係企業',
        applicationDate: '2024-08-02',
        visitTime: '09:30',
        brand: 'Suzuki',
        color: '紅色',
        department: '供應商',
        approvalStatus: 'pending',
        notes: '供應商訪問',
        createdAt: '2024-08-02T09:30:00.000Z',
        updatedAt: '2024-08-02T09:30:00.000Z',
        submittedBy: 'self'
      },
      {
        id: '8',
        plate: 'VWX-9753',
        vehicleType: '轎車',
        applicantName: '黃十',
        contactPhone: '0989-012-345',
        identityType: '長官',
        applicationDate: '2024-08-02',
        visitTime: '11:00',
        brand: 'Audi',
        color: '灰色',
        department: '董事會',
        approvalStatus: 'approved',
        notes: '董事會成員',
        createdAt: '2024-08-02T11:00:00.000Z',
        updatedAt: '2024-08-02T11:00:00.000Z',
        submittedBy: 'admin'
      }
    ];

    let vehicles = testVehicles;

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

    console.log(`API: 返回 ${vehicles.length} 筆車輛記錄`);

    return NextResponse.json({
      success: true,
      data: vehicles,
      message: `找到 ${vehicles.length} 筆記錄`
    });
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '伺服器錯誤',
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
