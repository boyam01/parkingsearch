import { NextRequest, NextResponse } from 'next/server';
import { VehicleRecord } from '@/types/vehicle';

// 🔍 車輛搜尋 API 路由
export async function GET(request: NextRequest) {
  console.log('🔍 車輛搜尋 API 被呼叫');
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    
    if (!query) {
      return NextResponse.json({
        success: false,
        message: '請提供搜尋關鍵字',
        data: []
      }, { status: 400 });
    }
    
    console.log('🔍 搜尋關鍵字:', query);
    
    // 使用主要的車輛 API 來取得資料
    const baseUrl = request.nextUrl.origin;
    const vehiclesResponse = await fetch(`${baseUrl}/api/vehicles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!vehiclesResponse.ok) {
      throw new Error('無法取得車輛資料');
    }
    
    const vehiclesData = await vehiclesResponse.json();
    
    if (!vehiclesData.success) {
      throw new Error(vehiclesData.error || '取得車輛資料失敗');
    }
    
    const allVehicles: VehicleRecord[] = vehiclesData.data;
    
    // 執行搜尋過濾
    const searchResults = allVehicles.filter((vehicle) => {
      const searchTerm = query.toLowerCase();
      
      return (
        vehicle.plate.toLowerCase().includes(searchTerm) ||
        vehicle.applicantName.toLowerCase().includes(searchTerm) ||
        vehicle.contactPhone.includes(searchTerm) ||
        vehicle.brand?.toLowerCase().includes(searchTerm) ||
        vehicle.color?.toLowerCase().includes(searchTerm) ||
        vehicle.department?.toLowerCase().includes(searchTerm) ||
        vehicle.notes?.toLowerCase().includes(searchTerm)
      );
    });
    
    console.log(`🔍 搜尋結果: 找到 ${searchResults.length} 筆記錄`);
    
    return NextResponse.json({
      success: true,
      message: `找到 ${searchResults.length} 筆符合的記錄`,
      data: searchResults,
      query: query
    });
    
  } catch (error) {
    console.error('🔍 搜尋錯誤:', error);
    
    return NextResponse.json({
      success: false,
      message: '搜尋失敗，請稍後再試',
      data: [],
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 });
  }
}
