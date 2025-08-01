import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord, ApplicationResponse } from '@/types/vehicle';
import { validateApplicationForm, formatApplicationData } from '@/lib/validation';
import { notificationManager } from '@/lib/notifications';
import { RagicAPI } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // 驗證表單資料
    const validation = validateApplicationForm(formData);
    
    if (!validation.isValid) {
      return NextResponse.json<ApplicationResponse>({
        success: false,
        message: '表單資料驗證失敗，請檢查填寫內容',
        errors: validation.errors
      }, { status: 400 });
    }

    // 檢查車牌是否已存在
    const existingApplications = await RagicAPI.getRecords();
    const existingApplication = existingApplications.find(app => 
      app.plate === formData.plate && app.approvalStatus !== 'rejected'
    );

    if (existingApplication) {
      return NextResponse.json<ApplicationResponse>({
        success: false,
        message: '此車牌已有申請記錄，請聯繫管理員或等待審核結果'
      }, { status: 409 });
    }

    // 格式化申請資料
    const applicationData = formatApplicationData(formData) as Partial<VehicleRecord>;
    
    // 添加額外的系統資訊
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const fullApplicationData: Partial<VehicleRecord> = {
      ...applicationData,
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    console.log('🔥 強制寫入申請資料到 Ragic...');
    console.log('完整申請資料:', fullApplicationData);

    // 強制儲存申請資料到 Ragic - 不允許失敗
    let savedApplication: VehicleRecord;
    try {
      savedApplication = await RagicAPI.createRecord(fullApplicationData);
      console.log('✅ 強制寫入成功！', savedApplication);
    } catch (ragicError) {
      console.error('💥 Ragic 寫入失敗:', ragicError);
      
      // 即使 Ragic 寫入失敗也要回報明確錯誤
      return NextResponse.json<ApplicationResponse>({
        success: false,
        message: `資料寫入失敗: ${ragicError instanceof Error ? ragicError.message : String(ragicError)}`,
        errors: { 
          system: '無法將申請資料寫入資料庫，請檢查 Ragic 連線或聯繫管理員' 
        }
      }, { status: 500 });
    }

    // 發送通知
    try {
      await notificationManager.handleNewApplication(savedApplication);
    } catch (notificationError) {
      console.error('發送通知失敗:', notificationError);
      // 通知失敗不影響申請成功
    }

    return NextResponse.json<ApplicationResponse>({
      success: true,
      applicationId: savedApplication.id,
      message: '申請提交成功！我們已收到您的申請，將在 1-2 個工作天內審核。',
      submissionTime: savedApplication.createdAt
    });

  } catch (error) {
    console.error('處理申請時發生錯誤:', error);
    
    return NextResponse.json<ApplicationResponse>({
      success: false,
      message: '系統發生錯誤，請稍後再試或聯繫管理員'
    }, { status: 500 });
  }
}

// 取得申請列表（管理員用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 從 Ragic 取得申請資料
    let filteredApplications = await RagicAPI.getRecords();

    // 按狀態篩選
    if (status && status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.approvalStatus === status);
    }

    // 排序（最新的在前面）
    filteredApplications.sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );

    // 分頁
    const total = filteredApplications.length;
    const paginatedApplications = filteredApplications.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        applications: paginatedApplications,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('取得申請列表時發生錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '無法取得申請列表'
    }, { status: 500 });
  }
}
