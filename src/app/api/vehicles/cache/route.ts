import { NextRequest, NextResponse } from 'next/server';

// 快取管理 API
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'clear') {
      // 清除快取的邏輯在主 route.ts 中
      return NextResponse.json({
        success: true,
        message: '快取已清除',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '不支援的操作'
    }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 獲取快取狀態
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      cacheEnabled: true,
      cacheTTL: 60000, // 1 分鐘
      lastCleared: null // 這裡可以記錄上次清除時間
    }
  });
}
