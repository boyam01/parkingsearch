import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';

// 模擬車輛資料（應該從資料庫取得）
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

// 計算搜尋相關性分數
function calculateRelevanceScore(vehicle: VehicleRecord, query: string): number {
  const normalizedQuery = query.toLowerCase();
  let score = 0;

  // 車牌完全匹配得分最高
  const normalizedPlate = vehicle.plate.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedQueryPlate = normalizedQuery.replace(/[^a-z0-9]/g, '');
  
  if (normalizedPlate === normalizedQueryPlate) {
    score += 1000; // 完全匹配
  } else if (normalizedPlate.includes(normalizedQueryPlate)) {
    score += 500; // 部分匹配
  }

  // 申請人姓名匹配
  if (vehicle.applicantName.toLowerCase().includes(normalizedQuery)) {
    score += 200;
  }

  // 其他欄位匹配
  const fieldsToCheck = [
    { field: vehicle.vehicleType, weight: 50 },
    { field: vehicle.identityType, weight: 50 },
    { field: vehicle.department || '', weight: 30 },
    { field: vehicle.brand || '', weight: 20 },
    { field: vehicle.color || '', weight: 20 },
    { field: vehicle.notes || '', weight: 10 }
  ];

  fieldsToCheck.forEach(({ field, weight }) => {
    if (field.toLowerCase().includes(normalizedQuery)) {
      score += weight;
    }
  });

  // 根據審核狀態調整分數
  if (vehicle.approvalStatus === 'approved') {
    score += 5;
  } else if (vehicle.approvalStatus === 'pending') {
    score += 2;
  }

  return score;
}

// GET /api/vehicles/search - 搜尋車輛
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const order = searchParams.get('order') || 'desc';
    const filterType = searchParams.get('type');
    const filterStatus = searchParams.get('status');
    const filterIdentity = searchParams.get('identity');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '搜尋查詢不能為空',
        data: []
      }, { status: 400 });
    }

    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase();

    // 基本搜尋過濾
    const results = mockVehicles.filter(vehicle => {
      const matchesQuery = (
        vehicle.plate.toLowerCase().includes(normalizedQuery) ||
        vehicle.applicantName.toLowerCase().includes(normalizedQuery) ||
        vehicle.vehicleType.toLowerCase().includes(normalizedQuery) ||
        vehicle.identityType.toLowerCase().includes(normalizedQuery) ||
        (vehicle.department && vehicle.department.toLowerCase().includes(normalizedQuery)) ||
        (vehicle.brand && vehicle.brand.toLowerCase().includes(normalizedQuery)) ||
        (vehicle.color && vehicle.color.toLowerCase().includes(normalizedQuery)) ||
        (vehicle.notes && vehicle.notes.toLowerCase().includes(normalizedQuery))
      );

      // 額外過濾條件
      const matchesType = !filterType || vehicle.vehicleType === filterType;
      const matchesStatus = !filterStatus || vehicle.approvalStatus === filterStatus;
      const matchesIdentity = !filterIdentity || vehicle.identityType === filterIdentity;

      return matchesQuery && matchesType && matchesStatus && matchesIdentity;
    });

    // 計算相關性並排序
    const resultsWithScore = results.map(vehicle => ({
      ...vehicle,
      _relevanceScore: calculateRelevanceScore(vehicle, query)
    }));

    // 排序
    resultsWithScore.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return order === 'desc' ? b._relevanceScore - a._relevanceScore : a._relevanceScore - b._relevanceScore;
        case 'plate':
          return order === 'desc' ? b.plate.localeCompare(a.plate) : a.plate.localeCompare(b.plate);
        case 'name':
          return order === 'desc' ? b.applicantName.localeCompare(a.applicantName) : a.applicantName.localeCompare(b.applicantName);
        case 'date':
          const dateA = new Date(a.applicationDate).getTime();
          const dateB = new Date(b.applicationDate).getTime();
          return order === 'desc' ? dateB - dateA : dateA - dateB;
        default:
          return order === 'desc' ? b._relevanceScore - a._relevanceScore : a._relevanceScore - b._relevanceScore;
      }
    });

    // 移除 _relevanceScore 欄位
    const finalResults = resultsWithScore.map(({ _relevanceScore, ...vehicle }) => vehicle);

    // 分頁
    const paginatedResults = finalResults.slice(offset, offset + limit);
    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      meta: {
        query,
        total: finalResults.length,
        limit,
        offset,
        searchTime,
        sortBy,
        order,
        filters: {
          type: filterType,
          status: filterStatus,
          identity: filterIdentity
        }
      },
      message: `找到 ${finalResults.length} 筆相關記錄`
    });
  } catch (error) {
    console.error('搜尋錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '搜尋失敗',
      data: []
    }, { status: 500 });
  }
}

// POST /api/vehicles/search - 進階搜尋
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      filters = {},
      sortBy = 'relevance',
      order = 'desc',
      limit = 50,
      offset = 0
    } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: '搜尋查詢不能為空',
        data: []
      }, { status: 400 });
    }

    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase();

    // 進階過濾
    const results = mockVehicles.filter(vehicle => {
      // 基本查詢匹配
      const matchesQuery = (
        vehicle.plate.toLowerCase().includes(normalizedQuery) ||
        vehicle.applicantName.toLowerCase().includes(normalizedQuery) ||
        vehicle.vehicleType.toLowerCase().includes(normalizedQuery) ||
        vehicle.identityType.toLowerCase().includes(normalizedQuery) ||
        (vehicle.department && vehicle.department.toLowerCase().includes(normalizedQuery)) ||
        (vehicle.brand && vehicle.brand.toLowerCase().includes(normalizedQuery)) ||
        (vehicle.color && vehicle.color.toLowerCase().includes(normalizedQuery)) ||
        (vehicle.notes && vehicle.notes.toLowerCase().includes(normalizedQuery))
      );

      // 進階過濾條件
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        switch (key) {
          case 'vehicleTypes':
            return Array.isArray(value) ? value.includes(vehicle.vehicleType) : vehicle.vehicleType === value;
          case 'identityTypes':
            return Array.isArray(value) ? value.includes(vehicle.identityType) : vehicle.identityType === value;
          case 'approvalStatuses':
            return Array.isArray(value) ? value.includes(vehicle.approvalStatus) : vehicle.approvalStatus === value;
          case 'departments':
            return Array.isArray(value) ? value.includes(vehicle.department) : vehicle.department === value;
          case 'dateFrom':
            return new Date(vehicle.applicationDate) >= new Date(value as string);
          case 'dateTo':
            return new Date(vehicle.applicationDate) <= new Date(value as string);
          default:
            return true;
        }
      });

      return matchesQuery && matchesFilters;
    });

    // 計算相關性並排序
    const resultsWithScore = results.map(vehicle => ({
      ...vehicle,
      _relevanceScore: calculateRelevanceScore(vehicle, query)
    }));

    // 排序
    resultsWithScore.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return order === 'desc' ? b._relevanceScore - a._relevanceScore : a._relevanceScore - b._relevanceScore;
        case 'plate':
          return order === 'desc' ? b.plate.localeCompare(a.plate) : a.plate.localeCompare(b.plate);
        case 'name':
          return order === 'desc' ? b.applicantName.localeCompare(a.applicantName) : a.applicantName.localeCompare(b.applicantName);
        case 'date':
          const dateA = new Date(a.applicationDate).getTime();
          const dateB = new Date(b.applicationDate).getTime();
          return order === 'desc' ? dateB - dateA : dateA - dateB;
        default:
          return order === 'desc' ? b._relevanceScore - a._relevanceScore : a._relevanceScore - b._relevanceScore;
      }
    });

    // 移除 _relevanceScore 欄位
    const finalResults = resultsWithScore.map(({ _relevanceScore, ...vehicle }) => vehicle);

    // 分頁
    const paginatedResults = finalResults.slice(offset, offset + limit);
    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      meta: {
        query,
        total: finalResults.length,
        limit,
        offset,
        searchTime,
        sortBy,
        order,
        filters
      },
      message: `找到 ${finalResults.length} 筆相關記錄`
    });
  } catch (error) {
    console.error('進階搜尋錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '搜尋失敗',
      data: []
    }, { status: 500 });
  }
}
