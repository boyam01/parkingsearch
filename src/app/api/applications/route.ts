import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord, ApplicationResponse } from '@/types/vehicle';
import { validateApplicationForm, formatApplicationData } from '@/lib/validation';
import { notificationManager } from '@/lib/notifications';

// 模擬資料庫
const applications: VehicleRecord[] = [];

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
    const existingApplication = applications.find(app => 
      app.plate === formData.plate && app.approvalStatus !== 'rejected'
    );

    if (existingApplication) {
      return NextResponse.json<ApplicationResponse>({
        success: false,
        message: '此車牌已有申請記錄，請聯繫管理員或等待審核結果'
      }, { status: 409 });
    }

    // 格式化申請資料
    const applicationData = formatApplicationData(formData) as VehicleRecord;
    
    // 添加額外的系統資訊
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const fullApplicationData: VehicleRecord = {
      ...applicationData,
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // 儲存申請資料（在實際應用中這裡應該儲存到資料庫）
    applications.push(fullApplicationData);

    // 發送通知
    try {
      await notificationManager.handleNewApplication(fullApplicationData);
    } catch (notificationError) {
      console.error('發送通知失敗:', notificationError);
      // 通知失敗不影響申請成功
    }

    return NextResponse.json<ApplicationResponse>({
      success: true,
      applicationId: fullApplicationData.id,
      message: '申請提交成功！我們已收到您的申請，將在 1-2 個工作天內審核。',
      submissionTime: fullApplicationData.createdAt
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

    let filteredApplications = applications;

    // 按狀態篩選
    if (status && status !== 'all') {
      filteredApplications = applications.filter(app => app.approvalStatus === status);
    }

    // 排序（最新的在前面）
    filteredApplications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
