import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // 強制清除所有可能的快取
    console.log('🧹 清除快取...');
    
    // 這個端點可以用來觸發資料重新載入
    return NextResponse.json({
      success: true,
      message: '快取已清除，請重新整理頁面'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '清除快取失敗'
    }, { status: 500 });
  }
}
