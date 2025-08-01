import { NextRequest, NextResponse } from 'next/server';
import { RenewalReminder, ReminderSettings, MembershipApiResponse } from '@/types/membership';

// 續約提醒服務
export class RenewalReminderService {
  private static instance: RenewalReminderService;
  private reminderSettings: ReminderSettings;

  constructor() {
    this.reminderSettings = {
      daysBeforeExpiry: [30, 15, 7, 3, 1],
      emailTemplate: `
        親愛的 {memberName} 您好，
        
        您的月租車位即將於 {expiryDate} 到期，請及時辦理續約手續。
        
        車牌號碼：{plateNumber}
        到期日期：{expiryDate}
        月租費用：NT$ {monthlyFee}
        
        如需續約，請洽詢管理人員。
        
        謝謝！
      `,
      smsTemplate: '【停車場】您的車位 {plateNumber} 將於 {expiryDate} 到期，請及時續約。',
      enableEmail: true,
      enableSms: false,
      enableSystemNotification: true,
      maxRetryAttempts: 3,
      retryInterval: 24 // 24小時
    };
  }

  static getInstance(): RenewalReminderService {
    if (!RenewalReminderService.instance) {
      RenewalReminderService.instance = new RenewalReminderService();
    }
    return RenewalReminderService.instance;
  }

  // 檢查需要提醒的記錄
  async checkExpiringRecords(): Promise<void> {
    try {
      // 取得所有活躍的月租車記錄
      const base = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : 'http://localhost:3000';
      
      const response = await fetch(`${base}/api/monthly-parking?status=active`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('無法取得月租車資料');
      }

      const records = data.data;
      const now = new Date();

      for (const record of records) {
        const expiryDate = new Date(record.contractEndDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // 檢查是否需要發送提醒
        if (this.reminderSettings.daysBeforeExpiry.includes(daysUntilExpiry)) {
          await this.scheduleReminder(record, daysUntilExpiry);
        }
      }
    } catch (error) {
      console.error('檢查到期記錄失敗:', error);
    }
  }

  // 排程提醒
  private async scheduleReminder(record: any, daysUntilExpiry: number): Promise<void> {
    try {
      // 檢查是否已經發送過提醒
      const existingReminder = await this.checkExistingReminder(record.id, daysUntilExpiry);
      if (existingReminder) {
        return;
      }

      // 取得會員資料
      const memberResponse = await fetch(`/api/members?memberNumber=${record.memberNumber}`);
      const memberData = await memberResponse.json();
      
      if (!memberData.success || memberData.data.length === 0) {
        throw new Error('找不到會員資料');
      }

      const member = memberData.data[0];

      // 創建提醒記錄
      const reminder: Partial<RenewalReminder> = {
        type: 'email',
        scheduledDate: new Date().toISOString(),
        status: 'pending',
        message: this.generateReminderMessage(member, record, daysUntilExpiry),
        recipientEmail: member.email,
        recipientPhone: member.phone,
        attempt: 0
      };

      // 發送提醒
      if (this.reminderSettings.enableEmail && member.email) {
        await this.sendEmailReminder(reminder as RenewalReminder);
      }

      if (this.reminderSettings.enableSystemNotification) {
        await this.sendSystemNotification(reminder as RenewalReminder);
      }

    } catch (error) {
      console.error('排程提醒失敗:', error);
    }
  }

  // 生成提醒訊息
  private generateReminderMessage(member: any, record: any, daysUntilExpiry: number): string {
    return this.reminderSettings.emailTemplate
      .replace('{memberName}', member.name)
      .replace('{plateNumber}', record.plate)
      .replace('{expiryDate}', record.contractEndDate)
      .replace('{monthlyFee}', record.monthlyFee.toString())
      .replace('{daysUntilExpiry}', daysUntilExpiry.toString());
  }

  // 檢查現有提醒
  private async checkExistingReminder(recordId: string, daysUntilExpiry: number): Promise<boolean> {
    // 這裡應該查詢資料庫檢查是否已有相同的提醒
    // 暫時回傳 false，實際實作時需要連接資料庫
    return false;
  }

  // 發送郵件提醒
  private async sendEmailReminder(reminder: RenewalReminder): Promise<void> {
    try {
      // 這裡整合實際的郵件服務 (如 SendGrid, AWS SES 等)
      console.log('發送郵件提醒:', {
        to: reminder.recipientEmail,
        subject: '月租車位到期提醒',
        message: reminder.message
      });

      // 模擬發送成功
      reminder.status = 'sent';
      reminder.sentDate = new Date().toISOString();
      
    } catch (error) {
      console.error('發送郵件失敗:', error);
      reminder.status = 'failed';
      reminder.attempt += 1;
    }
  }

  // 發送系統通知
  private async sendSystemNotification(reminder: RenewalReminder): Promise<void> {
    try {
      // 這裡可以整合推播通知系統
      console.log('發送系統通知:', reminder.message);
      
    } catch (error) {
      console.error('發送系統通知失敗:', error);
    }
  }

  // 更新提醒設定
  updateSettings(newSettings: Partial<ReminderSettings>): void {
    this.reminderSettings = { ...this.reminderSettings, ...newSettings };
  }

  // 取得提醒設定
  getSettings(): ReminderSettings {
    return { ...this.reminderSettings };
  }
}

// API 端點
export async function GET(request: NextRequest) {
  try {
    const reminderService = RenewalReminderService.getInstance();
    
    // 執行定期檢查
    await reminderService.checkExpiringRecords();
    
    return NextResponse.json<MembershipApiResponse<{ message: string }>>({
      success: true,
      data: { message: '續約提醒檢查完成' },
      message: '續約提醒檢查完成'
    });

  } catch (error) {
    console.error('續約提醒檢查失敗:', error);
    return NextResponse.json<MembershipApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '續約提醒檢查失敗'
    }, { status: 500 });
  }
}

// POST: 手動觸發提醒或更新設定
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, settings } = body;

    const reminderService = RenewalReminderService.getInstance();

    if (action === 'check') {
      await reminderService.checkExpiringRecords();
      return NextResponse.json<MembershipApiResponse<{ message: string }>>({
        success: true,
        data: { message: '續約提醒檢查完成' },
        message: '續約提醒檢查完成'
      });
    }

    if (action === 'updateSettings' && settings) {
      reminderService.updateSettings(settings);
      return NextResponse.json<MembershipApiResponse<ReminderSettings>>({
        success: true,
        data: reminderService.getSettings(),
        message: '提醒設定更新成功'
      });
    }

    throw new Error('不支援的操作');

  } catch (error) {
    console.error('處理續約提醒請求失敗:', error);
    return NextResponse.json<MembershipApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '處理續約提醒請求失敗'
    }, { status: 500 });
  }
}
