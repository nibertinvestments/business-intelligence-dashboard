'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { formatDate } from '@/lib/utils'
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Dashboard {
  id: string
  title: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  widgets: {
    id: string
    type: string
    title: string
  }[]
  _count: {
    widgets: number
  }
}

interface ApiResponse {
  success: boolean
  data?: {
    dashboards: Dashboard[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

export default function DashboardsPage() {
  const { data: session } = useSession()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboards')
      const data: ApiResponse = await response.json()

      if (data.success && data.data) {
        setDashboards(data.data.dashboards)
      } else {
        setError(data.error || 'Failed to fetch dashboards')
      }
    } catch (err) {
      setError('Failed to fetch dashboards')
    } finally {
      setLoading(false)
    }
  }

  const createDashboard = async () => {
    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Dashboard',
          description: 'A new dashboard created via the interface',
          isPublic: false,
        }),
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        fetchDashboards() // Refresh the list
      } else {
        setError(data.error || 'Failed to create dashboard')
      }
    } catch (err) {
      setError('Failed to create dashboard')
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
          <h1 className="text-2xl font-semibold text-gray-900">Dashboards</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage your business intelligence dashboards
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={createDashboard}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                  {dashboard.description && (
                    <CardDescription className="mt-1">
                      {dashboard.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  {dashboard.isPublic && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{dashboard._count.widgets} widgets</span>
                  <span>Updated {formatDate(dashboard.updatedAt, 'relative')}</span>
                </div>
                
                <div className="text-sm text-gray-500">
                  Created by {dashboard.user.name || dashboard.user.email}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {dashboards.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No dashboards yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first dashboard.
            </p>
            <div className="mt-6">
              <Button onClick={createDashboard}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}