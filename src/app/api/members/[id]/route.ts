import { NextRequest, NextResponse } from 'next/server';
import { MemberRecord } from '@/types/membership';

// Ragic 會員表單配置
const RAGIC_MEMBER_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_RAGIC_BASE_URL,
  account: process.env.NEXT_PUBLIC_RAGIC_ACCOUNT,
  apiKey: process.env.NEXT_PUBLIC_RAGIC_API_KEY,
  formId: '32',
  subtableId: '7'
};

// 欄位映射：前端 -> Ragic
const fieldMapping = {
  name: '1000002',
  email: '1000003',
  phone: '1000004',
  membershipType: '1000005',
  company: '1000006',
  department: '1000007',
  address: '1000008',
  emergencyContact: '1000009',
  emergencyPhone: '1000010',
  registrationDate: '1000011',
  status: '1000012',
  notes: '1000013'
};

// 反向映射：Ragic -> 前端
const reverseFieldMapping = Object.entries(fieldMapping).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

// 轉換會員數據：前端 -> Ragic
function transformMemberToRagic(member: Partial<MemberRecord>) {
  const ragicData: Record<string, any> = {};
  Object.entries(member).forEach(([key, value]) => {
    const ragicField = fieldMapping[key as keyof typeof fieldMapping];
    if (ragicField && value !== undefined) {
      ragicData[ragicField] = value;
    }
  });
  return ragicData;
}

// 轉換會員數據：Ragic -> 前端
function transformRagicToMember(ragicData: any): MemberRecord {
  const member: any = { id: ragicData._ragicId };
  Object.entries(ragicData).forEach(([ragicField, value]) => {
    const frontendField = reverseFieldMapping[ragicField];
    if (frontendField) {
      member[frontendField] = value;
    }
  });
  return member;
}

// GET /api/members/[id] - 取得單一會員記錄
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    const url = `${RAGIC_MEMBER_CONFIG.baseUrl}/${RAGIC_MEMBER_CONFIG.account}/${RAGIC_MEMBER_CONFIG.formId}/${RAGIC_MEMBER_CONFIG.subtableId}/${recordId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${RAGIC_MEMBER_CONFIG.apiKey?.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: '找不到指定的會員記錄',
          data: null
        }, { status: 404 });
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const ragicData = await response.json();
    const member = transformRagicToMember(ragicData);

    return NextResponse.json({
      success: true,
      data: member,
      message: '會員記錄取得成功'
    });
  } catch (error) {
    console.error('取得會員記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '取得記錄失敗',
      data: null
    }, { status: 500 });
  }
}

// PUT /api/members/[id] - 更新會員記錄
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    const body = await request.json();

    // 驗證必要欄位
    const requiredFields = ['name', 'email', 'phone', 'membershipType', 'registrationDate', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `缺少必要欄位: ${field}`,
          data: null
        }, { status: 400 });
      }
    }

    // 轉換數據格式
    const ragicData = transformMemberToRagic(body);
    
    // 更新到 Ragic
    const url = `${RAGIC_MEMBER_CONFIG.baseUrl}/${RAGIC_MEMBER_CONFIG.account}/${RAGIC_MEMBER_CONFIG.formId}/${RAGIC_MEMBER_CONFIG.subtableId}/${recordId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${RAGIC_MEMBER_CONFIG.apiKey?.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ragicData)
    });

    if (!response.ok) {
      throw new Error(`更新失敗: HTTP ${response.status}`);
    }

    const updatedRagicData = await response.json();
    const updatedMember = transformRagicToMember(updatedRagicData);

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: '會員記錄更新成功'
    });
  } catch (error) {
    console.error('更新會員記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '更新記錄失敗',
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/members/[id] - 刪除會員記錄
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id;
    
    // 從 Ragic 刪除記錄
    const url = `${RAGIC_MEMBER_CONFIG.baseUrl}/${RAGIC_MEMBER_CONFIG.account}/${RAGIC_MEMBER_CONFIG.formId}/${RAGIC_MEMBER_CONFIG.subtableId}/${recordId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${RAGIC_MEMBER_CONFIG.apiKey?.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: '找不到要刪除的會員記錄',
          data: null
        }, { status: 404 });
      }
      throw new Error(`刪除失敗: HTTP ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      data: { id: recordId },
      message: '會員記錄刪除成功'
    });
  } catch (error) {
    console.error('刪除會員記錄錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '刪除記錄失敗',
      data: null
    }, { status: 500 });
  }
}
