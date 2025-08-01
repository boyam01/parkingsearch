import { NextRequest, NextResponse } from 'next/server';

interface QuotaConfig {
  id: string;
  vehicleType: string;
  identityType: string;
  maxLimit: number;
  warningThreshold: number;
  enabled: boolean;
}

// 配額配置（這裡可以改為從數據庫或配置文件讀取）
let quotaConfigs: QuotaConfig[] = [
  {
    id: 'car-employee',
    vehicleType: 'car',
    identityType: 'employee',
    maxLimit: 100,
    warningThreshold: 80,
    enabled: true
  },
  {
    id: 'car-visitor',
    vehicleType: 'car',
    identityType: 'visitor',
    maxLimit: 50,
    warningThreshold: 40,
    enabled: true
  },
  {
    id: 'motorcycle-employee',
    vehicleType: 'motorcycle',
    identityType: 'employee',
    maxLimit: 200,
    warningThreshold: 150,
    enabled: true
  },
  {
    id: 'motorcycle-visitor',
    vehicleType: 'motorcycle',
    identityType: 'visitor',
    maxLimit: 30,
    warningThreshold: 25,
    enabled: true
  },
  {
    id: 'vip-official',
    vehicleType: 'vip',
    identityType: 'official',
    maxLimit: 20,
    warningThreshold: 15,
    enabled: true
  }
];

// GET /api/quota/[id] - 取得單一配額設定
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    const config = quotaConfigs.find(c => c.id === configId);
    
    if (!config) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的配額設定',
        data: null
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: config,
      message: '配額設定取得成功'
    });
  } catch (error) {
    console.error('取得配額設定錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '取得設定失敗',
      data: null
    }, { status: 500 });
  }
}

// PUT /api/quota/[id] - 更新配額設定
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    const body = await request.json();

    // 驗證必要欄位
    const requiredFields = ['vehicleType', 'identityType', 'maxLimit', 'warningThreshold', 'enabled'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({
          success: false,
          error: `缺少必要欄位: ${field}`,
          data: null
        }, { status: 400 });
      }
    }

    // 驗證數值
    if (body.maxLimit < 0 || body.warningThreshold < 0) {
      return NextResponse.json({
        success: false,
        error: '限制數量和警告閾值必須為非負數',
        data: null
      }, { status: 400 });
    }

    if (body.warningThreshold > body.maxLimit) {
      return NextResponse.json({
        success: false,
        error: '警告閾值不能大於最大限制',
        data: null
      }, { status: 400 });
    }

    // 查找並更新配額設定
    const configIndex = quotaConfigs.findIndex(c => c.id === configId);
    if (configIndex === -1) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的配額設定',
        data: null
      }, { status: 404 });
    }

    // 更新配額設定
    quotaConfigs[configIndex] = {
      id: configId,
      vehicleType: body.vehicleType,
      identityType: body.identityType,
      maxLimit: Number(body.maxLimit),
      warningThreshold: Number(body.warningThreshold),
      enabled: Boolean(body.enabled)
    };

    return NextResponse.json({
      success: true,
      data: quotaConfigs[configIndex],
      message: '配額設定更新成功'
    });
  } catch (error) {
    console.error('更新配額設定錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新設定失敗',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/quota/[id] - 刪除配額設定
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    
    // 查找配額設定
    const configIndex = quotaConfigs.findIndex(c => c.id === configId);
    if (configIndex === -1) {
      return NextResponse.json({
        success: false,
        error: '找不到指定的配額設定',
        data: null
      }, { status: 404 });
    }

    // 刪除配額設定
    const deletedConfig = quotaConfigs.splice(configIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: { id: configId },
      message: '配額設定刪除成功'
    });
  } catch (error) {
    console.error('刪除配額設定錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除設定失敗',
      data: null
    }, { status: 500 });
  }
}
