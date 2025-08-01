import { NextRequest, NextResponse } from 'next/server';
import { MemberRecord, MembershipApiResponse, MemberSearchOptions } from '@/types/membership';
import { RagicAPI } from '@/lib/api';

// Ragic 欄位對應 - 會員資料表
const MEMBER_FIELD_MAPPING = {
  memberNumber: '1004010', // 會員編號
  name: '1004011', // 姓名
  email: '1004012', // 電子郵件
  phone: '1004013', // 聯絡電話
  idNumber: '1004014', // 身份證字號
  department: '1004015', // 部門
  position: '1004016', // 職位
  membershipType: '1004017', // 會員類型
  status: '1004018', // 狀態
  registrationDate: '1004019', // 註冊日期
  expiryDate: '1004020', // 到期日期
  lastRenewalDate: '1004021', // 最後續約日期
  vehicleQuota: '1004022', // 車輛配額
  usedQuota: '1004023', // 已使用配額
  notes: '1004024' // 備註
};

// 轉換會員資料為 Ragic 格式
function transformMemberToRagic(member: Partial<MemberRecord>): Record<string, string> {
  const ragicData: Record<string, string> = {};
  
  Object.entries(MEMBER_FIELD_MAPPING).forEach(([key, ragicField]) => {
    const value = member[key as keyof MemberRecord];
    if (value !== undefined && value !== null) {
      ragicData[ragicField] = String(value);
    }
  });
  
  return ragicData;
}

// 轉換 Ragic 資料為會員格式
function transformRagicToMember(ragicData: any): MemberRecord {
  return {
    id: ragicData._ragicId?.toString() || '0',
    memberNumber: ragicData[MEMBER_FIELD_MAPPING.memberNumber] || '',
    name: ragicData[MEMBER_FIELD_MAPPING.name] || '',
    email: ragicData[MEMBER_FIELD_MAPPING.email] || '',
    phone: ragicData[MEMBER_FIELD_MAPPING.phone] || '',
    idNumber: ragicData[MEMBER_FIELD_MAPPING.idNumber] || '',
    department: ragicData[MEMBER_FIELD_MAPPING.department] || '',
    position: ragicData[MEMBER_FIELD_MAPPING.position] || '',
    membershipType: ragicData[MEMBER_FIELD_MAPPING.membershipType] || 'monthly',
    status: ragicData[MEMBER_FIELD_MAPPING.status] || 'active',
    registrationDate: ragicData[MEMBER_FIELD_MAPPING.registrationDate] || '',
    expiryDate: ragicData[MEMBER_FIELD_MAPPING.expiryDate] || '',
    lastRenewalDate: ragicData[MEMBER_FIELD_MAPPING.lastRenewalDate] || '',
    vehicleQuota: parseInt(ragicData[MEMBER_FIELD_MAPPING.vehicleQuota]) || 1,
    usedQuota: parseInt(ragicData[MEMBER_FIELD_MAPPING.usedQuota]) || 0,
    notes: ragicData[MEMBER_FIELD_MAPPING.notes] || '',
    createdAt: ragicData._create_date 
      ? new Date(ragicData._create_date).toISOString() 
      : new Date().toISOString(),
    updatedAt: ragicData._update_date 
      ? new Date(ragicData._update_date).toISOString() 
      : new Date().toISOString()
  } as MemberRecord;
}

// GET: 取得所有會員或搜尋會員
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams: MemberSearchOptions = {
      query: url.searchParams.get('query') || undefined,
      status: url.searchParams.get('status') as any || undefined,
      membershipType: url.searchParams.get('membershipType') as any || undefined,
      expiringWithinDays: url.searchParams.get('expiringWithinDays') 
        ? parseInt(url.searchParams.get('expiringWithinDays')!) 
        : undefined,
      department: url.searchParams.get('department') || undefined,
      sortBy: url.searchParams.get('sortBy') as any || 'registrationDate',
      sortOrder: url.searchParams.get('sortOrder') as any || 'desc',
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined
    };

    // 從 Ragic 取得會員資料
    const ragicResponse = await fetch(
      `${process.env.NEXT_PUBLIC_RAGIC_BASE_URL}/${process.env.NEXT_PUBLIC_RAGIC_ACCOUNT}/ragicforms32/7?api&APIKey=${process.env.NEXT_PUBLIC_RAGIC_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!ragicResponse.ok) {
      throw new Error(`Ragic API 錯誤: ${ragicResponse.status}`);
    }

    const ragicData = await ragicResponse.json();
    
    // 轉換為會員格式
    let members: MemberRecord[] = [];
    if (ragicData && typeof ragicData === 'object') {
      members = Object.values(ragicData)
        .filter((item: any) => item && typeof item === 'object' && item._ragicId !== undefined)
        .map(transformRagicToMember);
    }

    // 應用搜尋篩選
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      members = members.filter(member => 
        member.name.toLowerCase().includes(query) ||
        member.memberNumber.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        (member.department && member.department.toLowerCase().includes(query)) ||
        (member.position && member.position.toLowerCase().includes(query))
      );
    }

    if (searchParams.status) {
      members = members.filter(member => member.status === searchParams.status);
    }

    if (searchParams.membershipType) {
      members = members.filter(member => member.membershipType === searchParams.membershipType);
    }

    if (searchParams.expiringWithinDays) {
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + searchParams.expiringWithinDays);
      
      members = members.filter(member => {
        const expiryDate = new Date(member.expiryDate);
        return expiryDate <= targetDate && expiryDate >= now;
      });
    }

    if (searchParams.department) {
      members = members.filter(member => member.department === searchParams.department);
    }

    // 排序
    members.sort((a, b) => {
      const sortBy = searchParams.sortBy || 'registrationDate';
      const order = searchParams.sortOrder === 'asc' ? 1 : -1;
      
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }
      
      return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * order;
    });

    // 分頁
    if (searchParams.offset || searchParams.limit) {
      const offset = searchParams.offset || 0;
      const limit = searchParams.limit || members.length;
      members = members.slice(offset, offset + limit);
    }

    return NextResponse.json<MembershipApiResponse<MemberRecord[]>>({
      success: true,
      data: members,
      message: `成功取得 ${members.length} 筆會員資料`
    });

  } catch (error) {
    console.error('取得會員資料失敗:', error);
    return NextResponse.json<MembershipApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '取得會員資料失敗'
    }, { status: 500 });
  }
}

// POST: 新增會員
export async function POST(request: NextRequest) {
  try {
    const memberData: Partial<MemberRecord> = await request.json();
    
    // 產生會員編號
    if (!memberData.memberNumber) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      memberData.memberNumber = `M${timestamp}${random}`;
    }
    
    // 設定預設值
    memberData.status = memberData.status || 'active';
    memberData.membershipType = memberData.membershipType || 'monthly';
    memberData.vehicleQuota = memberData.vehicleQuota || 1;
    memberData.usedQuota = memberData.usedQuota || 0;
    memberData.registrationDate = memberData.registrationDate || new Date().toISOString().split('T')[0];
    
    // 計算到期日期
    if (!memberData.expiryDate && memberData.registrationDate) {
      const startDate = new Date(memberData.registrationDate);
      const expiryDate = new Date(startDate);
      
      switch (memberData.membershipType) {
        case 'monthly':
          expiryDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'yearly':
          expiryDate.setFullYear(startDate.getFullYear() + 1);
          break;
        case 'permanent':
          expiryDate.setFullYear(startDate.getFullYear() + 99);
          break;
      }
      
      memberData.expiryDate = expiryDate.toISOString().split('T')[0];
    }
    
    // 轉換為 Ragic 格式
    const ragicData = transformMemberToRagic(memberData);
    
    // 提交到 Ragic
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RAGIC_BASE_URL}/${process.env.NEXT_PUBLIC_RAGIC_ACCOUNT}/ragicforms32/7?api&APIKey=${process.env.NEXT_PUBLIC_RAGIC_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(ragicData).toString()
      }
    );

    if (!response.ok) {
      throw new Error(`Ragic API 錯誤: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'SUCCESS') {
      const newMember = transformRagicToMember(result.data);
      
      return NextResponse.json<MembershipApiResponse<MemberRecord>>({
        success: true,
        data: newMember,
        message: '會員建立成功'
      }, { status: 201 });
    } else {
      throw new Error(result.msg || '建立會員失敗');
    }

  } catch (error) {
    console.error('建立會員失敗:', error);
    return NextResponse.json<MembershipApiResponse<null>>({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : '建立會員失敗'
    }, { status: 500 });
  }
}
