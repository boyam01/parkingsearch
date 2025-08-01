'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/vehicles')
      if (!response.ok) {
        throw new Error('Network error')
      }
      const result = await response.json()
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-700 font-semibold">Records</div>
              <div className="text-2xl font-bold text-blue-600">{data.length}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-green-700 font-semibold">API</div>
              <div className="text-2xl font-bold text-green-600">
                {loading ? 'Loading' : 'Ready'}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-700 font-semibold">Status</div>
              <div className="text-2xl font-bold text-purple-600">OK</div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-700 font-semibold">Error:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Reload'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Data</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No data
            </div>
          ) : (
            <div className="p-6">
              <div className="text-sm text-gray-600">
                Found {data.length} records
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
