import { NextRequest, NextResponse } from 'next/server';
import { RagicAPI } from '@/lib/api';

// GET /api/vehicles/statistics - 獲取統計資料
export async function GET() {
  try {
    const vehicles = await RagicAPI.getRecords();
    
    const statistics = {
      total: vehicles.length,
      byType: vehicles.reduce((acc, v) => {
        acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: vehicles.reduce((acc, v) => {
        acc[v.approvalStatus] = (acc[v.approvalStatus] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: vehicles.filter(v => {
        const createDate = new Date(v.createdAt || v.applicationDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createDate >= weekAgo;
      }).length
    };

    return NextResponse.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('獲取統計資料錯誤:', error);
    return NextResponse.json({
      success: false,
      error: '獲取統計資料失敗',
      data: {
        total: 0,
        byType: {},
        byStatus: {},
        recent: 0
      }
    }, { status: 500 });
  }
}
