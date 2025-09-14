import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET endpoint for analytics overview
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get analytics data from database
    const [dashboards, users, dataSources] = await Promise.all([
      prisma.dashboard.count({ where: { tenantId: session.user.tenantId } }),
      prisma.user.count({ where: { tenantId: session.user.tenantId } }),
      prisma.dataSource.count({ where: { tenantId: session.user.tenantId } }),
    ])

    // Get top dashboards
    const topDashboards = await prisma.dashboard.findMany({
      where: { tenantId: session.user.tenantId },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })

    // Get recent activity (simplified)
    const recentActivity = await prisma.dashboard.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    // Mock some analytics data since we don't have tracking tables yet
    const analyticsData = {
      overview: {
        totalDashboards: dashboards,
        totalUsers: users,
        totalViews: Math.floor(Math.random() * 5000) + 1000, // Mock data
        averageLoadTime: Math.random() * 2 + 0.5, // Mock data
      },
      trends: {
        dashboardsGrowth: Math.random() * 20 - 5, // Mock data
        usersGrowth: Math.random() * 15 + 2, // Mock data
        viewsGrowth: Math.random() * 30 + 5, // Mock data
        performanceChange: Math.random() * 10 - 5, // Mock data
      },
      topDashboards: topDashboards.map((dashboard, index) => ({
        id: dashboard.id,
        title: dashboard.title,
        views: Math.floor(Math.random() * 1000) + 100, // Mock data
        lastViewed: dashboard.updatedAt.toISOString(),
      })),
      recentActivity: recentActivity.map((activity, index) => ({
        id: `activity-${index}`,
        type: 'dashboard_update',
        description: `Dashboard "${activity.title}" was updated`,
        timestamp: activity.updatedAt.toISOString(),
        user: activity.user.name || activity.user.email,
      })),
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const queryDataSchema = z.object({
  dataSourceId: z.string().min(1, 'Data source ID is required'),
  query: z.string().min(1, 'Query is required'),
  parameters: z.record(z.any()).optional().default({}),
  limit: z.number().min(1).max(10000).optional().default(1000),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dataSourceId, query, parameters, limit } = queryDataSchema.parse(body)

    // Check if data source exists and user has access
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        id: dataSourceId,
        tenantId: session.user.tenantId,
      },
    })

    if (!dataSource) {
      return NextResponse.json(
        { success: false, error: 'Data source not found' },
        { status: 404 }
      )
    }

    if (dataSource.status !== 'CONNECTED') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Data source is not connected (status: ${dataSource.status})` 
        },
        { status: 400 }
      )
    }

    // Validate query for security (basic SQL injection prevention)
    if (!isQuerySafe(query)) {
      return NextResponse.json(
        { success: false, error: 'Query contains potentially unsafe operations' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    try {
      // Execute query based on data source type
      const result = await executeQuery(dataSource, query, parameters, limit)
      const executionTime = Date.now() - startTime

      return NextResponse.json({
        success: true,
        data: {
          columns: result.columns,
          rows: result.rows,
          metadata: {
            totalRows: result.rows.length,
            executionTime,
            dataSourceType: dataSource.type,
            cached: false,
          },
        },
      })
    } catch (queryError) {
      console.error('Query execution error:', queryError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Query execution failed',
          details: queryError instanceof Error ? queryError.message : 'Unknown error'
        },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Error executing query:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isQuerySafe(query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Allow only SELECT queries for security
  if (!normalizedQuery.startsWith('select')) {
    return false
  }

  // Block potentially dangerous operations
  const dangerousPatterns = [
    /;\s*(drop|delete|update|insert|alter|create|truncate|exec|execute)/i,
    /union.*select/i,
    /information_schema/i,
    /pg_catalog/i,
    /mysql\./i,
    /sys\./i,
    /master\./i,
    /--/,
    /\/\*/,
    /xp_/i,
    /sp_/i,
  ]

  return !dangerousPatterns.some(pattern => pattern.test(query))
}

async function executeQuery(
  dataSource: any,
  query: string,
  parameters: Record<string, any> = {},
  limit: number = 1000
): Promise<{ columns: string[], rows: any[][] }> {
  
  switch (dataSource.type) {
    case 'POSTGRESQL':
    case 'MYSQL':
    case 'SQLITE':
      return await executeDatabaseQuery(dataSource, query, parameters, limit)
    
    case 'API':
      return await executeApiQuery(dataSource, query, parameters, limit)
    
    case 'CSV':
    case 'SPREADSHEET':
      return await executeFileQuery(dataSource, query, parameters, limit)
    
    case 'MONGODB':
      return await executeMongoQuery(dataSource, query, parameters, limit)
    
    default:
      throw new Error(`Unsupported data source type: ${dataSource.type}`)
  }
}

async function executeDatabaseQuery(
  dataSource: any,
  query: string,
  parameters: Record<string, any>,
  limit: number
): Promise<{ columns: string[], rows: any[][] }> {
  // In a real implementation, you would use the appropriate database client
  // For demo purposes, we'll return mock data based on common query patterns
  
  console.log(`Executing ${dataSource.type} query:`, query)
  
  // Simulate query execution delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500))
  
  // Generate mock data based on query patterns
  if (query.toLowerCase().includes('select count')) {
    return {
      columns: ['count'],
      rows: [[Math.floor(Math.random() * 10000)]],
    }
  }
  
  if (query.toLowerCase().includes('select sum')) {
    return {
      columns: ['sum'],
      rows: [[Math.floor(Math.random() * 100000)]],
    }
  }
  
  if (query.toLowerCase().includes('sales') || query.toLowerCase().includes('revenue')) {
    return generateSalesData(limit)
  }
  
  if (query.toLowerCase().includes('users') || query.toLowerCase().includes('customers')) {
    return generateUserData(limit)
  }
  
  // Default mock data
  return generateGenericData(limit)
}

async function executeApiQuery(
  dataSource: any,
  query: string,
  parameters: Record<string, any>,
  limit: number
): Promise<{ columns: string[], rows: any[][] }> {
  const { url, headers = {} } = dataSource.config
  
  // For API queries, the "query" might be an endpoint path or filter
  const apiUrl = url + (query.startsWith('/') ? query : '/' + query)
  
  const response = await fetch(apiUrl, {
    headers,
    method: 'GET',
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  
  const data = await response.json()
  
  // Convert API response to tabular format
  if (Array.isArray(data)) {
    const limitedData = data.slice(0, limit)
    if (limitedData.length === 0) {
      return { columns: [], rows: [] }
    }
    
    const columns = Object.keys(limitedData[0])
    const rows = limitedData.map(item => columns.map(col => item[col]))
    
    return { columns, rows }
  }
  
  // Single object response
  const columns = Object.keys(data)
  const rows = [columns.map(col => data[col])]
  
  return { columns, rows }
}

async function executeFileQuery(
  dataSource: any,
  query: string,
  parameters: Record<string, any>,
  limit: number
): Promise<{ columns: string[], rows: any[][] }> {
  // For file data sources, generate mock CSV-like data
  // In a real implementation, you would parse the actual file
  
  console.log(`Executing file query for ${dataSource.type}:`, query)
  
  // Simulate file reading delay
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  
  return generateGenericData(Math.min(limit, 100))
}

async function executeMongoQuery(
  dataSource: any,
  query: string,
  parameters: Record<string, any>,
  limit: number
): Promise<{ columns: string[], rows: any[][] }> {
  // For MongoDB, the query would typically be a JSON query
  // For demo purposes, return mock data
  
  console.log('Executing MongoDB query:', query)
  
  // Simulate MongoDB query delay
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 400))
  
  return generateGenericData(Math.min(limit, 500))
}

function generateSalesData(limit: number): { columns: string[], rows: any[][] } {
  const columns = ['date', 'product', 'amount', 'quantity', 'customer']
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
  const customers = ['Customer 1', 'Customer 2', 'Customer 3', 'Customer 4', 'Customer 5']
  
  const rows = Array.from({ length: Math.min(limit, 100) }, (_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const product = products[Math.floor(Math.random() * products.length)]
    const amount = (Math.random() * 1000 + 50).toFixed(2)
    const quantity = Math.floor(Math.random() * 10 + 1)
    const customer = customers[Math.floor(Math.random() * customers.length)]
    
    return [date, product, amount, quantity, customer]
  })
  
  return { columns, rows }
}

function generateUserData(limit: number): { columns: string[], rows: any[][] } {
  const columns = ['id', 'name', 'email', 'created_at', 'status']
  const statuses = ['active', 'inactive', 'pending']
  
  const rows = Array.from({ length: Math.min(limit, 50) }, (_, i) => {
    const id = i + 1
    const name = `User ${id}`
    const email = `user${id}@example.com`
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    return [id, name, email, createdAt, status]
  })
  
  return { columns, rows }
}

function generateGenericData(limit: number): { columns: string[], rows: any[][] } {
  const columns = ['id', 'name', 'value', 'category', 'timestamp']
  const categories = ['Category A', 'Category B', 'Category C']
  
  const rows = Array.from({ length: Math.min(limit, 20) }, (_, i) => {
    const id = i + 1
    const name = `Item ${id}`
    const value = (Math.random() * 100).toFixed(2)
    const category = categories[Math.floor(Math.random() * categories.length)]
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    
    return [id, name, value, category, timestamp]
  })
  
  return { columns, rows }
}