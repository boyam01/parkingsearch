// 環境變數檢查頁面
export default function EnvCheck() {
  const envVars = {
    'NEXT_PUBLIC_RAGIC_BASE_URL': process.env.NEXT_PUBLIC_RAGIC_BASE_URL,
    'NEXT_PUBLIC_RAGIC_API_KEY': process.env.NEXT_PUBLIC_RAGIC_API_KEY ? '已設定 (隱藏)' : '未設定',
    'NEXT_PUBLIC_RAGIC_ACCOUNT': process.env.NEXT_PUBLIC_RAGIC_ACCOUNT,
    'NEXT_PUBLIC_RAGIC_FORM_ID': process.env.NEXT_PUBLIC_RAGIC_FORM_ID,
    'NEXT_PUBLIC_RAGIC_SUBTABLE_ID': process.env.NEXT_PUBLIC_RAGIC_SUBTABLE_ID,
    'NEXT_PUBLIC_RAGIC_ADD_RECORD_ID': process.env.NEXT_PUBLIC_RAGIC_ADD_RECORD_ID,
    'NODE_ENV': process.env.NODE_ENV,
    'VERCEL': process.env.VERCEL,
    'VERCEL_URL': process.env.VERCEL_URL
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">環境變數檢查</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">當前環境變數</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-mono text-sm text-gray-600">{key}</span>
                <span className={`font-mono text-sm ${value ? 'text-green-600' : 'text-red-600'}`}>
                  {value || '未設定'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">注意事項</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• 環境變數需要在 Vercel 控制台中設定</li>
            <li>• 設定後需要重新部署才會生效</li>
            <li>• NEXT_PUBLIC_ 開頭的變數會在客戶端可見</li>
            <li>• API Key 應該保密，不要在客戶端程式碼中直接顯示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
