'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  EyeIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  overview: {
    totalDashboards: number
    totalUsers: number
    totalViews: number
    averageLoadTime: number
  }
  trends: {
    dashboardsGrowth: number
    usersGrowth: number
    viewsGrowth: number
    performanceChange: number
  }
  topDashboards: Array<{
    id: string
    title: string
    views: number
    lastViewed: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    user: string
  }>
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/query')
      const data = await response.json()

      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        setError(data.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0
    const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center ${color}`}>
        <TrendIcon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{trend.toFixed(1)}%
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No analytics data available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Analytics data will appear here once there is sufficient usage.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor dashboard usage, performance, and user engagement
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Dashboards</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analyticsData.overview.totalDashboards)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                {formatTrend(analyticsData.trends.dashboardsGrowth)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analyticsData.overview.totalUsers)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
                {formatTrend(analyticsData.trends.usersGrowth)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analyticsData.overview.totalViews)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <EyeIcon className="h-8 w-8 text-purple-600" />
                {formatTrend(analyticsData.trends.viewsGrowth)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Avg. Load Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.overview.averageLoadTime.toFixed(1)}s
                </p>
              </div>
              <div className="flex flex-col items-end">
                <ClockIcon className="h-8 w-8 text-orange-600" />
                {formatTrend(analyticsData.trends.performanceChange)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Dashboards */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Dashboards</CardTitle>
            <CardDescription>
              Most viewed dashboards in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topDashboards.map((dashboard, index) => (
                <div key={dashboard.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dashboard.title}</p>
                      <p className="text-xs text-gray-500">
                        Last viewed: {new Date(dashboard.lastViewed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(dashboard.views)} views
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest dashboard and user activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{activity.user}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}