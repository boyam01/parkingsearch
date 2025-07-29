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

// GET /api/vehicles/statistics - 取得車輛統計資料
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // 預設30天

    // 計算日期範圍
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    // 過濾指定期間內的記錄
    const recentVehicles = mockVehicles.filter(vehicle => {
      const applicationDate = new Date(vehicle.applicationDate);
      return applicationDate >= daysAgo;
    });

    // 統計資料
    const statistics = {
      total: mockVehicles.length,
      recent: recentVehicles.length,
      
      // 按車型統計
      byType: mockVehicles.reduce((acc, vehicle) => {
        acc[vehicle.vehicleType] = (acc[vehicle.vehicleType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // 按身份統計
      byIdentity: mockVehicles.reduce((acc, vehicle) => {
        acc[vehicle.identityType] = (acc[vehicle.identityType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // 按審核狀態統計
      byStatus: mockVehicles.reduce((acc, vehicle) => {
        acc[vehicle.approvalStatus] = (acc[vehicle.approvalStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // 按部門統計（排除空值）
      byDepartment: mockVehicles
        .filter(vehicle => vehicle.department && vehicle.department.trim())
        .reduce((acc, vehicle) => {
          acc[vehicle.department!] = (acc[vehicle.department!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      
      // 按車輛品牌統計（排除空值）
      byBrand: mockVehicles
        .filter(vehicle => vehicle.brand && vehicle.brand.trim())
        .reduce((acc, vehicle) => {
          acc[vehicle.brand!] = (acc[vehicle.brand!] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      
      // 每日申請數量（最近7天）
      dailyApplications: (() => {
        const daily: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          daily[dateStr] = 0;
        }
        
        recentVehicles.forEach(vehicle => {
          const dateStr = vehicle.applicationDate;
          if (daily.hasOwnProperty(dateStr)) {
            daily[dateStr]++;
          }
        });
        
        return daily;
      })(),
      
      // 時段分析
      timeAnalysis: (() => {
        const hourlyStats: Record<string, number> = {};
        mockVehicles
          .filter(vehicle => vehicle.visitTime)
          .forEach(vehicle => {
            const hour = parseInt(vehicle.visitTime!.split(':')[0]);
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            hourlyStats[timeSlot] = (hourlyStats[timeSlot] || 0) + 1;
          });
        return hourlyStats;
      })(),
      
      // 審核效率統計
      approvalStats: {
        pending: mockVehicles.filter(v => v.approvalStatus === 'pending').length,
        approved: mockVehicles.filter(v => v.approvalStatus === 'approved').length,
        rejected: mockVehicles.filter(v => v.approvalStatus === 'rejected').length,
        approvalRate: mockVehicles.length > 0 
          ? Math.round((mockVehicles.filter(v => v.approvalStatus === 'approved').length / mockVehicles.length) * 100)
          : 0
      },
      
      // 熱門車型前5名
      topVehicleTypes: Object.entries(
        mockVehicles.reduce((acc, vehicle) => {
          acc[vehicle.vehicleType] = (acc[vehicle.vehicleType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count })),
      
      // 最活躍部門前5名
      topDepartments: Object.entries(
        mockVehicles
          .filter(vehicle => vehicle.department && vehicle.department.trim())
          .reduce((acc, vehicle) => {
            acc[vehicle.department!] = (acc[vehicle.department!] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([department, count]) => ({ department, count })),
      
      // 系統健康度指標
      healthMetrics: {
        averageProcessingTime: '< 300ms', // 模擬數據
        cacheHitRate: '95.2%',
        systemUptime: '99.9%',
        lastUpdate: now.toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: statistics,
      message: '統計資料取得成功',
      period: `最近 ${period} 天`,
      generatedAt: now.toISOString()
    });
  } catch (error) {
    console.error('統計資料錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '無法取得統計資料',
      data: null
    }, { status: 500 });
  }
}
