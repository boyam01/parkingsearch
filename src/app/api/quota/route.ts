import { NextRequest, NextResponse } from 'next/server';
import { VehicleQuotaConfig, QuotaStatus, ApiResponse, VehicleRecord } from '@/types/vehicle';

// 預設配額配置
const DEFAULT_QUOTA_CONFIG: VehicleQuotaConfig = {
  totalQuota: 100,
  quotaByType: {
    car: 60,
    motorcycle: 35,
    truck: 5
  },
  quotaByIdentity: {
    staff: 40,
    visitor: 30,
    contractor: 15,
    guest: 10,
    vip: 5
  },
  dailyApplicationLimit: 20,
  enableQuotaControl: true,
  enableWaitingList: true,
  quotaWarningThreshold: 80 // 80%
};

// 配額管理服務
export class QuotaManagementService {
  private static instance: QuotaManagementService;
  private quotaConfig: VehicleQuotaConfig;

  constructor() {
    this.quotaConfig = { ...DEFAULT_QUOTA_CONFIG };
  }

  static getInstance(): QuotaManagementService {
    if (!QuotaManagementService.instance) {
      QuotaManagementService.instance = new QuotaManagementService();
    }
    return QuotaManagementService.instance;
  }

  // 取得配額設定
  getQuotaConfig(): VehicleQuotaConfig {
    return { ...this.quotaConfig };
  }

  // 更新配額設定
  updateQuotaConfig(newConfig: Partial<VehicleQuotaConfig>): void {
    this.quotaConfig = { ...this.quotaConfig, ...newConfig };
  }

  // 計算配額狀態
  async calculateQuotaStatus(): Promise<QuotaStatus> {
    try {
      // 取得目前所有有效的車輛記錄
      const base = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : 'http://localhost:3000';
      
      const response = await fetch(`${base}/api/vehicles`);
      const vehiclesData = await response.json();
      
      if (!vehiclesData.success) {
        throw new Error('無法取得車輛資料');
      }

      const vehicles: VehicleRecord[] = vehiclesData.data.filter(
        (v: VehicleRecord) => v.approvalStatus === 'approved' || v.approvalStatus === 'pending'
      );

      // 計算各類型使用量
      const typeUsage = {
        car: vehicles.filter(v => v.vehicleType === 'car' || v.vehicleType === '轎車').length,
        motorcycle: vehicles.filter(v => v.vehicleType === 'motorcycle' || v.vehicleType === '機車').length,
        truck: vehicles.filter(v => v.vehicleType === 'truck' || v.vehicleType === '卡車').length
      };

      // 計算各身份類型使用量
      const identityUsage = {
        staff: vehicles.filter(v => v.identityType === 'staff' || v.identityType === '同仁').length,
        visitor: vehicles.filter(v => v.identityType === 'visitor' || v.identityType === '訪客').length,
        contractor: vehicles.filter(v => v.identityType === 'contractor' || v.identityType === '承包商').length,
        guest: vehicles.filter(v => v.identityType === 'guest' || v.identityType === '賓客').length,
        vip: vehicles.filter(v => v.identityType === 'vip' || v.identityType === 'VIP').length
      };

      // 計算今日申請數量
      const today = new Date().toISOString().split('T')[0];
      const todayApplications = vehicles.filter(v => 
        v.applicationDate === today || v.createdAt.startsWith(today)
      ).length;

      const totalUsed = vehicles.length;
      const totalAvailable = this.quotaConfig.totalQuota - totalUsed;
      const usageRate = (totalUsed / this.quotaConfig.totalQuota) * 100;

      // 檢查警告
      const warnings: string[] = [];
      if (usageRate >= this.quotaConfig.quotaWarningThreshold) {
        warnings.push(`總配額使用率已達 ${usageRate.toFixed(1)}%`);
      }
      if (todayApplications >= this.quotaConfig.dailyApplicationLimit) {
        warnings.push(`今日申請數量已達上限 ${this.quotaConfig.dailyApplicationLimit} 筆`);
      }

      const quotaStatus: QuotaStatus = {
        totalUsed,
        totalAvailable,
        usageRate,
        byType: {
          car: {
            used: typeUsage.car,
            available: this.quotaConfig.quotaByType.car - typeUsage.car,
            rate: (typeUsage.car / this.quotaConfig.quotaByType.car) * 100
          },
          motorcycle: {
            used: typeUsage.motorcycle,
            available: this.quotaConfig.quotaByType.motorcycle - typeUsage.motorcycle,
            rate: (typeUsage.motorcycle / this.quotaConfig.quotaByType.motorcycle) * 100
          },
          truck: {
            used: typeUsage.truck,
            available: this.quotaConfig.quotaByType.truck - typeUsage.truck,
            rate: (typeUsage.truck / this.quotaConfig.quotaByType.truck) * 100
          }
        },
        byIdentity: {
          staff: {
            used: identityUsage.staff,
            available: this.quotaConfig.quotaByIdentity.staff - identityUsage.staff,
            rate: (identityUsage.staff / this.quotaConfig.quotaByIdentity.staff) * 100
          },
          visitor: {
            used: identityUsage.visitor,
            available: this.quotaConfig.quotaByIdentity.visitor - identityUsage.visitor,
            rate: (identityUsage.visitor / this.quotaConfig.quotaByIdentity.visitor) * 100
          },
          contractor: {
            used: identityUsage.contractor,
            available: this.quotaConfig.quotaByIdentity.contractor - identityUsage.contractor,
            rate: (identityUsage.contractor / this.quotaConfig.quotaByIdentity.contractor) * 100
          },
          guest: {
            used: identityUsage.guest,
            available: this.quotaConfig.quotaByIdentity.guest - identityUsage.guest,
            rate: (identityUsage.guest / this.quotaConfig.quotaByIdentity.guest) * 100
          },
          vip: {
            used: identityUsage.vip,
            available: this.quotaConfig.quotaByIdentity.vip - identityUsage.vip,
            rate: (identityUsage.vip / this.quotaConfig.quotaByIdentity.vip) * 100
          }
        },
        dailyApplications: todayApplications,
        isOverLimit: totalUsed >= this.quotaConfig.totalQuota || 
                     todayApplications >= this.quotaConfig.dailyApplicationLimit,
        warnings
      };

      return quotaStatus;

    } catch (error) {
      console.error('計算配額狀態失敗:', error);
      throw error;
    }
  }

  // 檢查是否可以申請
  async canApplyForVehicle(vehicleType: string, identityType: string): Promise<{ 
    canApply: boolean; 
    reason?: string; 
    quotaStatus: QuotaStatus 
  }> {
    try {
      if (!this.quotaConfig.enableQuotaControl) {
        const quotaStatus = await this.calculateQuotaStatus();
        return { canApply: true, quotaStatus };
      }

      const quotaStatus = await this.calculateQuotaStatus();

      // 檢查總配額
      if (quotaStatus.totalAvailable <= 0) {
        return { 
          canApply: false, 
          reason: '總配額已滿，無法新增車輛申請', 
          quotaStatus 
        };
      }

      // 檢查每日申請限制
      if (quotaStatus.dailyApplications >= this.quotaConfig.dailyApplicationLimit) {
        return { 
          canApply: false, 
          reason: `今日申請數量已達上限 ${this.quotaConfig.dailyApplicationLimit} 筆`, 
          quotaStatus 
        };
      }

      // 檢查車輛類型配額
      const normalizedVehicleType = this.normalizeVehicleType(vehicleType);
      if (quotaStatus.byType[normalizedVehicleType].available <= 0) {
        return { 
          canApply: false, 
          reason: `${vehicleType} 類型配額已滿`, 
          quotaStatus 
        };
      }

      // 檢查身份類型配額
      const normalizedIdentityType = this.normalizeIdentityType(identityType);
      if (quotaStatus.byIdentity[normalizedIdentityType].available <= 0) {
        return { 
          canApply: false, 
          reason: `${identityType} 身份配額已滿`, 
          quotaStatus 
        };
      }

      return { canApply: true, quotaStatus };

    } catch (error) {
      console.error('檢查申請資格失敗:', error);
      throw error;
    }
  }

  // 標準化車輛類型
  private normalizeVehicleType(vehicleType: string): 'car' | 'motorcycle' | 'truck' {
    const type = vehicleType.toLowerCase();
    if (type.includes('car') || type.includes('轎車')) return 'car';
    if (type.includes('motorcycle') || type.includes('機車')) return 'motorcycle';
    if (type.includes('truck') || type.includes('卡車')) return 'truck';
    return 'car'; // 預設
  }

  // 標準化身份類型
  private normalizeIdentityType(identityType: string): 'staff' | 'visitor' | 'contractor' | 'guest' | 'vip' {
    const type = identityType.toLowerCase();
    if (type.includes('staff') || type.includes('同仁') || type.includes('員工')) return 'staff';
    if (type.includes('visitor') || type.includes('訪客')) return 'visitor';
    if (type.includes('contractor') || type.includes('承包商')) return 'contractor';
    if (type.includes('guest') || type.includes('賓客')) return 'guest';
    if (type.includes('vip')) return 'vip';
    return 'visitor'; // 預設
  }
}

// GET: 取得配額狀態
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const quotaService = QuotaManagementService.getInstance();

    if (action === 'status') {
      const quotaStatus = await quotaService.calculateQuotaStatus();
      return NextResponse.json<ApiResponse<QuotaStatus>>({
        success: true,
        data: quotaStatus,
        message: '配額狀態取得成功'
      });
    }

    if (action === 'config') {
      const quotaConfig = quotaService.getQuotaConfig();
      return NextResponse.json<ApiResponse<VehicleQuotaConfig>>({
        success: true,
        data: quotaConfig,
        message: '配額設定取得成功'
      });
    }

    if (action === 'check') {
      const vehicleType = url.searchParams.get('vehicleType') || 'car';
      const identityType = url.searchParams.get('identityType') || 'visitor';
      
      const result = await quotaService.canApplyForVehicle(vehicleType, identityType);
      return NextResponse.json<ApiResponse<typeof result>>({
        success: true,
        data: result,
        message: result.canApply ? '可以申請' : result.reason || '無法申請'
      });
    }

    const quotaStatus = await quotaService.calculateQuotaStatus();
    return NextResponse.json<ApiResponse<QuotaStatus>>({
      success: true,
      data: quotaStatus,
      message: '配額狀態取得成功'
    });

  } catch (error) {
    console.error('取得配額資訊失敗:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '取得配額資訊失敗'
    }, { status: 500 });
  }
}

// POST: 更新配額設定
export async function POST(request: NextRequest) {
  try {
    const newConfig: Partial<VehicleQuotaConfig> = await request.json();
    
    const quotaService = QuotaManagementService.getInstance();
    quotaService.updateQuotaConfig(newConfig);
    
    const updatedConfig = quotaService.getQuotaConfig();
    
    return NextResponse.json<ApiResponse<VehicleQuotaConfig>>({
      success: true,
      data: updatedConfig,
      message: '配額設定更新成功'
    });

  } catch (error) {
    console.error('更新配額設定失敗:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '更新配額設定失敗'
    }, { status: 500 });
  }
}
