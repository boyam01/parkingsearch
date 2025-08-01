import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord, ApplicationResponse } from '@/types/vehicle';
import { notificationManager } from '@/lib/notifications';
import { RagicAPI } from '@/lib/api';

interface Params {
  id: string;
}

// 取得單一申請詳情
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const applicationId = params.id;
    
    const application = await RagicAPI.getRecordById(applicationId);
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: '找不到指定的申請記錄'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('取得申請詳情時發生錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '無法取得申請詳情'
    }, { status: 500 });
  }
}

// 更新申請狀態（核准/拒絕）
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const applicationId = params.id;
    const { action, rejectionReason, reviewerId } = await request.json();
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: '無效的操作類型'
      }, { status: 400 });
    }

    // 取得現有申請記錄
    const application = await RagicAPI.getRecordById(applicationId);
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: '找不到指定的申請記錄'
      }, { status: 404 });
    }
    
    // 檢查申請狀態是否可以更新
    if (application.approvalStatus !== 'pending') {
      return NextResponse.json({
        success: false,
        message: '此申請已經處理過，無法重複操作'
      }, { status: 400 });
    }

    // 準備更新資料
    const updateData: Partial<VehicleRecord> = {
      approvalStatus: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date().toISOString()
    };

    // 如果是拒絕，添加拒絕原因到備註
    if (action === 'reject' && rejectionReason) {
      updateData.notes = `${application.notes ? application.notes + '\n' : ''}拒絕原因：${rejectionReason}`;
    }

    // 更新記錄
    const updatedApplication = await RagicAPI.updateRecord(applicationId, updateData);

    // 發送審核結果通知
    try {
      await notificationManager.handleApprovalNotification(
        updatedApplication,
        action === 'approve',
        rejectionReason
      );
    } catch (notificationError) {
      console.error('發送審核通知失敗:', notificationError);
      // 通知失敗不影響狀態更新
    }

    return NextResponse.json<ApplicationResponse>({
      success: true,
      applicationId: updatedApplication.id,
      message: `申請已${action === 'approve' ? '核准' : '拒絕'}`
    });

  } catch (error) {
    console.error('更新申請狀態時發生錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '無法更新申請狀態'
    }, { status: 500 });
  }
}

// 刪除申請（軟刪除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const applicationId = params.id;
    
    // 檢查記錄是否存在
    const application = await RagicAPI.getRecordById(applicationId);
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: '找不到指定的申請記錄'
      }, { status: 404 });
    }

    // 軟刪除：標記為已刪除而不是真正刪除
    await RagicAPI.updateRecord(applicationId, {
      approvalStatus: 'deleted',
      updatedAt: new Date().toISOString(),
      notes: `${application.notes ? application.notes + '\n' : ''}系統刪除：${new Date().toLocaleString('zh-TW')}`
    });

    return NextResponse.json({
      success: true,
      message: '申請已刪除'
    });

  } catch (error) {
    console.error('刪除申請時發生錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '無法刪除申請'
    }, { status: 500 });
  }
}
