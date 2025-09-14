'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { PlusIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DataSource {
  id: string
  name: string
  type: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TESTING'
  config: any
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  data?: {
    dataSources: DataSource[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

const statusConfig = {
  CONNECTED: { 
    icon: CheckCircleIcon, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Connected' 
  },
  DISCONNECTED: { 
    icon: XCircleIcon, 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Disconnected' 
  },
  ERROR: { 
    icon: ExclamationTriangleIcon, 
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Error' 
  },
  TESTING: { 
    icon: ExclamationTriangleIcon, 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Testing' 
  },
}

export default function DataSourcesPage() {
  const { data: session } = useSession()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data-sources')
      const data: ApiResponse = await response.json()

      if (data.success && data.data) {
        setDataSources(data.data.dataSources)
      } else {
        setError(data.error || 'Failed to fetch data sources')
      }
    } catch (err) {
      setError('Failed to fetch data sources')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (id: string) => {
    try {
      const response = await fetch(`/api/data-sources/${id}/test`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        // Refresh the list to show updated status
        fetchDataSources()
      } else {
        setError(data.error || 'Connection test failed')
      }
    } catch (err) {
      setError('Connection test failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Sources</h1>
          <p className="mt-2 text-sm text-gray-700">
            Connect and manage your data sources for dashboard analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Data Source
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Data Sources Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dataSources.map((dataSource) => {
          const StatusIcon = statusConfig[dataSource.status].icon
          return (
            <Card key={dataSource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{dataSource.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {dataSource.type} Database
                    </CardDescription>
                  </div>
                  <div className="flex items-center ml-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[dataSource.status].bgColor} ${statusConfig[dataSource.status].color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[dataSource.status].label}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>Host:</strong> {dataSource.config?.host || 'N/A'}</p>
                    <p><strong>Database:</strong> {dataSource.config?.database || 'N/A'}</p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(dataSource.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => testConnection(dataSource.id)}
                    >
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {dataSources.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No data sources yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by connecting your first data source.
            </p>
            <div className="mt-6">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Data Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}