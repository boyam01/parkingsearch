import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';

// 這裡應該從主要的車輛 API 或資料庫取得資料
// 為了示範，我們重複使用相同的模擬資料
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

interface RouteParams {
  params: {
    plate: string;
  };
}

// GET /api/vehicles/[plate] - 根據車牌查詢車輛
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const plate = decodeURIComponent(params.plate);
    
    if (!plate) {
      return NextResponse.json({
        success: false,
        error: '車牌號碼不能為空',
        data: null
      }, { status: 400 });
    }

    // 正規化車牌號碼進行比對
    const normalizedSearchPlate = plate.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const vehicle = mockVehicles.find(v => {
      const normalizedVehiclePlate = v.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedVehiclePlate === normalizedSearchPlate;
    });

    if (!vehicle) {
      return NextResponse.json({
        success: false,
        error: '找不到該車牌的記錄',
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: '查詢成功'
    });
  } catch (error) {
    console.error('查詢車牌錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '伺服器錯誤',
      data: null
    }, { status: 500 });
  }
}

// PUT /api/vehicles/[plate] - 更新車輛記錄
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const plate = decodeURIComponent(params.plate);
    const body = await request.json();

    if (!plate) {
      return NextResponse.json({
        success: false,
        error: '車牌號碼不能為空',
        data: null
      }, { status: 400 });
    }

    // 找到要更新的車輛
    const normalizedSearchPlate = plate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const vehicleIndex = mockVehicles.findIndex(v => {
      const normalizedVehiclePlate = v.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedVehiclePlate === normalizedSearchPlate;
    });

    if (vehicleIndex === -1) {
      return NextResponse.json({
        success: false,
        error: '找不到該車牌的記錄',
        data: null
      }, { status: 404 });
    }

    // 更新車輛資訊
    const updatedVehicle = {
      ...mockVehicles[vehicleIndex],
      ...body,
      id: mockVehicles[vehicleIndex].id, // 保持原有 ID
      plate: mockVehicles[vehicleIndex].plate // 保持原有車牌
    };

    mockVehicles[vehicleIndex] = updatedVehicle;

    return NextResponse.json({
      success: true,
      data: updatedVehicle,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新車輛記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新失敗',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/vehicles/[plate] - 刪除車輛記錄
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const plate = decodeURIComponent(params.plate);

    if (!plate) {
      return NextResponse.json({
        success: false,
        error: '車牌號碼不能為空',
        data: null
      }, { status: 400 });
    }

    // 找到要刪除的車輛
    const normalizedSearchPlate = plate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const vehicleIndex = mockVehicles.findIndex(v => {
      const normalizedVehiclePlate = v.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedVehiclePlate === normalizedSearchPlate;
    });

    if (vehicleIndex === -1) {
      return NextResponse.json({
        success: false,
        error: '找不到該車牌的記錄',
        data: null
      }, { status: 404 });
    }

    // 刪除車輛記錄
    const deletedVehicle = mockVehicles.splice(vehicleIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedVehicle,
      message: '刪除成功'
    });
  } catch (error) {
    console.error('刪除車輛記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除失敗',
      data: null
    }, { status: 500 });
  }
}
