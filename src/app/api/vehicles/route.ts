import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';

// 模擬車輛資料庫
const mockVehicles: VehicleRecord[] = [
  {
    id: '1',
    plate: 'ABC-1234',
    vehicleType: 'car',
    applicantName: '張小明',
    contactPhone: '0912-345-678',
    identityType: 'staff',
    applicationDate: '2024-01-15',
    visitTime: '09:00',
    brand: 'Toyota',
    color: '白色',
    department: '資訊部',
    approvalStatus: 'approved',
    notes: '長期停車權限'
  },
  {
    id: '2',
    plate: 'DEF-5678',
    vehicleType: 'motorcycle',
    applicantName: '李小華',
    contactPhone: '0923-456-789',
    identityType: 'visitor',
    applicationDate: '2024-01-16',
    visitTime: '14:30',
    brand: 'Yamaha',
    color: '黑色',
    department: '',
    approvalStatus: 'pending',
    notes: '臨時訪客'
  },
  {
    id: '3',
    plate: 'GHI-9012',
    vehicleType: 'vip',
    applicantName: '王總經理',
    contactPhone: '0934-567-890',
    identityType: 'executive',
    applicationDate: '2024-01-17',
    visitTime: '10:00',
    brand: 'Mercedes-Benz',
    color: '黑色',
    department: '總經理室',
    approvalStatus: 'approved',
    notes: '貴賓車輛，優先停車'
  },
  {
    id: '4',
    plate: 'JKL-3456',
    vehicleType: 'car',
    applicantName: '陳經理',
    contactPhone: '0945-678-901',
    identityType: 'partner',
    applicationDate: '2024-01-18',
    visitTime: '15:45',
    brand: 'Honda',
    color: '銀色',
    department: '合作夥伴',
    approvalStatus: 'approved',
    notes: '合作廠商代表'
  },
  {
    id: '5',
    plate: 'MNO-7890',
    vehicleType: 'truck',
    applicantName: '林師傅',
    contactPhone: '0956-789-012',
    identityType: 'visitor',
    applicationDate: '2024-01-19',
    visitTime: '08:30',
    brand: 'Isuzu',
    color: '白色',
    department: '',
    approvalStatus: 'rejected',
    notes: '貨車禁止進入停車場'
  },
  {
    id: '6',
    plate: 'PQR-2468',
    vehicleType: 'car',
    applicantName: '劉小姐',
    contactPhone: '0967-890-123',
    identityType: 'staff',
    applicationDate: '2024-01-20',
    visitTime: '08:00',
    brand: 'Nissan',
    color: '紅色',
    department: '行銷部',
    approvalStatus: 'approved',
    notes: '新進同事'
  },
  {
    id: '7',
    plate: 'STU-1357',
    vehicleType: 'motorcycle',
    applicantName: '黃先生',
    contactPhone: '0978-901-234',
    identityType: 'staff',
    applicationDate: '2024-01-21',
    visitTime: '07:30',
    brand: 'Honda',
    color: '藍色',
    department: '工程部',
    approvalStatus: 'approved',
    notes: '機車停車區'
  },
  {
    id: '8',
    plate: 'VWX-9753',
    vehicleType: 'car',
    applicantName: '吳董事長',
    contactPhone: '0989-012-345',
    identityType: 'executive',
    applicationDate: '2024-01-22',
    visitTime: '09:30',
    brand: 'BMW',
    color: '黑色',
    department: '董事會',
    approvalStatus: 'approved',
    notes: '董事長專用車位'
  }
];

// GET /api/vehicles - 取得所有車輛記錄
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let vehicles = mockVehicles;

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
    const existingVehicle = mockVehicles.find(v => v.plate === body.plate);
    if (existingVehicle) {
      return NextResponse.json({
        success: false,
        error: '車牌號碼已存在',
        data: null
      }, { status: 409 });
    }

    // 創建新記錄
    const newVehicle: VehicleRecord = {
      id: (mockVehicles.length + 1).toString(),
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

    // 將新記錄加入陣列（在實際應用中會儲存到資料庫）
    mockVehicles.push(newVehicle);

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
