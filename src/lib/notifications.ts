import { NotificationData, VehicleRecord } from '@/types/vehicle';

// 電子郵件通知服務
export class EmailNotificationService {
  private static instance: EmailNotificationService;
  
  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  // 發送申請確認郵件給申請者
  async sendApplicationConfirmation(
    applicantEmail: string, 
    applicationId: string, 
    applicantName: string
  ): Promise<boolean> {
    try {
      const emailData = {
        to: applicantEmail,
        subject: `車輛申請確認 - 申請編號：${applicationId}`,
        html: this.generateConfirmationEmailTemplate(applicationId, applicantName)
      };

      // 這裡應該整合實際的郵件服務 (如 SendGrid, SES 等)
      console.log('發送確認郵件:', emailData);
      
      // 模擬發送延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('發送確認郵件失敗:', error);
      return false;
    }
  }

  // 發送審核通知郵件給管理員
  async sendAdminNotification(
    adminEmails: string[], 
    applicationData: VehicleRecord
  ): Promise<boolean> {
    try {
      const emailData = {
        to: adminEmails,
        subject: `新車輛申請待審核 - ${applicationData.applicantName}`,
        html: this.generateAdminNotificationTemplate(applicationData)
      };

      console.log('發送管理員通知:', emailData);
      
      // 模擬發送延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('發送管理員通知失敗:', error);
      return false;
    }
  }

  // 發送審核結果通知
  async sendApprovalNotification(
    applicantEmail: string, 
    applicationData: VehicleRecord,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<boolean> {
    try {
      const emailData = {
        to: applicantEmail,
        subject: `車輛申請${isApproved ? '核准' : '拒絕'} - ${applicationData.plate}`,
        html: this.generateApprovalNotificationTemplate(applicationData, isApproved, rejectionReason)
      };

      console.log('發送審核結果通知:', emailData);
      
      // 模擬發送延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('發送審核結果通知失敗:', error);
      return false;
    }
  }

  // 確認郵件模板
  private generateConfirmationEmailTemplate(applicationId: string, applicantName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Microsoft JhengHei', Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; color: #666; }
          .highlight { background-color: #fef3c7; padding: 2px 4px; border-radius: 3px; }
          .info-box { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>車輛申請確認通知</h1>
        </div>
        
        <div class="content">
          <p>親愛的 <strong>${applicantName}</strong>，您好：</p>
          
          <p>您的車輛申請已成功提交，我們已收到您的申請資料。</p>
          
          <div class="info-box">
            <p><strong>申請編號：</strong> <span class="highlight">${applicationId}</span></p>
            <p><strong>提交時間：</strong> ${new Date().toLocaleString('zh-TW')}</p>
            <p><strong>申請狀態：</strong> 待審核</p>
          </div>
          
          <h3>後續流程：</h3>
          <ol>
            <li>管理員將在 <strong>1-2 個工作天</strong> 內審核您的申請</li>
            <li>審核完成後，您將收到審核結果通知信</li>
            <li>如申請通過，您可開始使用申請的停車權限</li>
          </ol>
          
          <div class="info-box">
            <p><strong>注意事項：</strong></p>
            <ul>
              <li>請保留此申請編號以便查詢進度</li>
              <li>如需修改申請資料，請聯繫管理員</li>
              <li>申請核准前請勿進入停車區域</li>
            </ul>
          </div>
          
          <p>如有任何疑問，請聯繫我們：</p>
          <p>📧 電子郵件：parking-admin@company.com</p>
          <p>📞 電話：(02) 1234-5678</p>
        </div>
        
        <div class="footer">
          <p>此為系統自動發送的郵件，請勿直接回復。</p>
          <p>&copy; 2025 車輛管理系統 - 讓停車管理更簡單</p>
        </div>
      </body>
      </html>
    `;
  }

  // 管理員通知模板
  private generateAdminNotificationTemplate(applicationData: VehicleRecord): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Microsoft JhengHei', Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; color: #666; }
          .application-info { background-color: #f9fafb; border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .field { margin: 8px 0; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-left: 10px; }
          .action-buttons { text-align: center; margin: 20px 0; }
          .btn { display: inline-block; padding: 10px 20px; margin: 0 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .btn-approve { background-color: #10b981; color: white; }
          .btn-reject { background-color: #ef4444; color: white; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 新車輛申請待審核</h1>
        </div>
        
        <div class="content">
          <p>有新的車輛申請需要您的審核：</p>
          
          <div class="application-info">
            <h3>申請資料</h3>
            
            <div class="field">
              <span class="label">申請編號：</span>
              <span class="value">${applicationData.id}</span>
            </div>
            
            <div class="field">
              <span class="label">申請人：</span>
              <span class="value">${applicationData.applicantName}</span>
            </div>
            
            <div class="field">
              <span class="label">身份類別：</span>
              <span class="value">${applicationData.identityType}</span>
            </div>
            
            <div class="field">
              <span class="label">車牌號碼：</span>
              <span class="value">${applicationData.plate}</span>
            </div>
            
            <div class="field">
              <span class="label">車輛類型：</span>
              <span class="value">${applicationData.vehicleType}</span>
            </div>
            
            <div class="field">
              <span class="label">聯絡電話：</span>
              <span class="value">${applicationData.contactPhone}</span>
            </div>
            
            <div class="field">
              <span class="label">電子郵件：</span>
              <span class="value">${applicationData.applicantEmail || 'N/A'}</span>
            </div>
            
            <div class="field">
              <span class="label">來訪目的：</span>
              <span class="value">${applicationData.visitPurpose || 'N/A'}</span>
            </div>
            
            <div class="field">
              <span class="label">申請日期：</span>
              <span class="value">${applicationData.applicationDate}</span>
            </div>
            
            <div class="field">
              <span class="label">預期停留：</span>
              <span class="value">${applicationData.expectedDuration || 'N/A'}</span>
            </div>
            
            <div class="field">
              <span class="label">提交時間：</span>
              <span class="value">${new Date(applicationData.createdAt).toLocaleString('zh-TW')}</span>
            </div>
            
            ${applicationData.notes ? `
            <div class="field">
              <span class="label">備註：</span>
              <span class="value">${applicationData.notes}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="action-buttons">
            <a href="/admin/applications/${applicationData.id}?action=approve" class="btn btn-approve">
              ✅ 核准申請
            </a>
            <a href="/admin/applications/${applicationData.id}?action=reject" class="btn btn-reject">
              ❌ 拒絕申請
            </a>
          </div>
          
          <p><strong>請盡快處理此申請，以確保良好的用戶體驗。</strong></p>
        </div>
        
        <div class="footer">
          <p>車輛管理系統 - 管理員通知</p>
          <p>如需協助，請聯繫系統管理員</p>
        </div>
      </body>
      </html>
    `;
  }

  // 審核結果通知模板
  private generateApprovalNotificationTemplate(
    applicationData: VehicleRecord, 
    isApproved: boolean, 
    rejectionReason?: string
  ): string {
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusText = isApproved ? '核准' : '拒絕';
    const statusIcon = isApproved ? '✅' : '❌';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Microsoft JhengHei', Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; color: #666; }
          .status-box { background-color: ${isApproved ? '#ecfdf5' : '#fef2f2'}; border: 2px solid ${statusColor}; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .application-summary { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .field { margin: 5px 0; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${statusIcon} 車輛申請${statusText}通知</h1>
        </div>
        
        <div class="content">
          <p>親愛的 <strong>${applicationData.applicantName}</strong>，您好：</p>
          
          <div class="status-box">
            <h2 style="margin: 0; color: ${statusColor};">
              您的車輛申請已${statusText}
            </h2>
            <p>申請編號：${applicationData.id}</p>
          </div>
          
          <div class="application-summary">
            <h3>申請摘要</h3>
            <div class="field"><span class="label">車牌號碼：</span> ${applicationData.plate}</div>
            <div class="field"><span class="label">車輛類型：</span> ${applicationData.vehicleType}</div>
            <div class="field"><span class="label">申請日期：</span> ${applicationData.applicationDate}</div>
            <div class="field"><span class="label">審核時間：</span> ${new Date().toLocaleString('zh-TW')}</div>
          </div>
          
          ${isApproved ? `
            <h3>🎉 恭喜！您的申請已通過審核</h3>
            <p><strong>您現在可以：</strong></p>
            <ul>
              <li>✅ 在指定時間進入停車區域</li>
              <li>✅ 使用申請的停車權限</li>
              <li>✅ 查詢您的停車記錄</li>
            </ul>
            
            <div style="background-color: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0;">
              <p><strong>重要提醒：</strong></p>
              <ul>
                <li>請遵守停車場相關規定</li>
                <li>車輛異動時請及時更新資料</li>
                <li>如有問題請聯繫管理員</li>
              </ul>
            </div>
          ` : `
            <h3>😔 很抱歉，您的申請未通過審核</h3>
            ${rejectionReason ? `
              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0;">
                <p><strong>拒絕原因：</strong></p>
                <p>${rejectionReason}</p>
              </div>
            ` : ''}
            
            <p><strong>您可以：</strong></p>
            <ul>
              <li>📝 檢查並修正申請資料後重新提交</li>
              <li>📞 聯繫管理員了解詳細原因</li>
              <li>📧 回復此郵件提出疑問</li>
            </ul>
          `}
          
          <p>如有任何疑問，請聯繫我們：</p>
          <p>📧 電子郵件：parking-admin@company.com</p>
          <p>📞 電話：(02) 1234-5678</p>
        </div>
        
        <div class="footer">
          <p>此為系統自動發送的郵件，如有疑問請聯繫管理員。</p>
          <p>&copy; 2025 車輛管理系統</p>
        </div>
      </body>
      </html>
    `;
  }
}

// 系統通知服務
export class SystemNotificationService {
  private notifications: NotificationData[] = [];

  // 新增系統通知
  addNotification(notification: Omit<NotificationData, 'id' | 'sentAt' | 'status'>): string {
    const id = this.generateNotificationId();
    const newNotification: NotificationData = {
      ...notification,
      id,
      sentAt: new Date().toISOString(),
      status: 'pending'
    };

    this.notifications.push(newNotification);
    return id;
  }

  // 取得通知列表
  getNotifications(applicationId?: string): NotificationData[] {
    if (applicationId) {
      return this.notifications.filter(n => n.applicationId === applicationId);
    }
    return this.notifications;
  }

  // 更新通知狀態
  updateNotificationStatus(notificationId: string, status: NotificationData['status']): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = status;
      return true;
    }
    return false;
  }

  private generateNotificationId(): string {
    return `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 整合通知管理器
export class NotificationManager {
  private emailService: EmailNotificationService;
  private systemService: SystemNotificationService;

  constructor() {
    this.emailService = EmailNotificationService.getInstance();
    this.systemService = new SystemNotificationService();
  }

  // 處理新申請通知
  async handleNewApplication(applicationData: VehicleRecord): Promise<void> {
    try {
      // 發送確認郵件給申請者
      if (applicationData.applicantEmail) {
        await this.emailService.sendApplicationConfirmation(
          applicationData.applicantEmail,
          applicationData.id,
          applicationData.applicantName
        );

        // 記錄系統通知
        this.systemService.addNotification({
          type: 'email',
          recipient: applicationData.applicantEmail,
          subject: `申請確認 - ${applicationData.id}`,
          message: '申請確認郵件已發送',
          applicationId: applicationData.id
        });
      }

      // 發送通知給管理員
      const adminEmails = ['admin@company.com', 'parking-admin@company.com'];
      await this.emailService.sendAdminNotification(adminEmails, applicationData);

      // 記錄管理員通知
      adminEmails.forEach(email => {
        this.systemService.addNotification({
          type: 'email',
          recipient: email,
          subject: `新申請待審核 - ${applicationData.applicantName}`,
          message: '管理員審核通知已發送',
          applicationId: applicationData.id
        });
      });

    } catch (error) {
      console.error('處理新申請通知失敗:', error);
    }
  }

  // 處理審核結果通知
  async handleApprovalNotification(
    applicationData: VehicleRecord,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    try {
      if (applicationData.applicantEmail) {
        await this.emailService.sendApprovalNotification(
          applicationData.applicantEmail,
          applicationData,
          isApproved,
          rejectionReason
        );

        // 記錄系統通知
        this.systemService.addNotification({
          type: 'email',
          recipient: applicationData.applicantEmail,
          subject: `審核結果 - ${applicationData.id}`,
          message: `申請${isApproved ? '核准' : '拒絕'}通知已發送`,
          applicationId: applicationData.id
        });
      }
    } catch (error) {
      console.error('處理審核結果通知失敗:', error);
    }
  }

  // 取得通知記錄
  getNotificationHistory(applicationId?: string): NotificationData[] {
    return this.systemService.getNotifications(applicationId);
  }
}

// 匯出單例
export const notificationManager = new NotificationManager();
