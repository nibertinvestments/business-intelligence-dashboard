import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if data source exists and user has permission
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!dataSource) {
      return NextResponse.json(
        { success: false, error: 'Data source not found' },
        { status: 404 }
      )
    }

    // Only admins and editors can test data sources
    if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You need editor permissions to test data sources' },
        { status: 403 }
      )
    }

    // Update status to testing
    await prisma.dataSource.update({
      where: { id: params.id },
      data: { status: 'TESTING' },
    })

    try {
      // Simulate connection test based on data source type
      const testResult = await testDataSourceConnection(dataSource)
      
      // Update status based on test result
      const newStatus = testResult.success ? 'CONNECTED' : 'ERROR'
      
      await prisma.dataSource.update({
        where: { id: params.id },
        data: { status: newStatus },
      })

      return NextResponse.json({
        success: testResult.success,
        data: {
          status: newStatus,
          message: testResult.message,
          connectionTime: testResult.connectionTime,
        },
      })
    } catch (testError) {
      // Update status to error if test fails
      await prisma.dataSource.update({
        where: { id: params.id },
        data: { status: 'ERROR' },
      })

      return NextResponse.json({
        success: false,
        data: {
          status: 'ERROR',
          message: 'Connection test failed',
          error: testError instanceof Error ? testError.message : 'Unknown error',
        },
      })
    }
  } catch (error) {
    console.error('Error testing data source:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function testDataSourceConnection(dataSource: any): Promise<{
  success: boolean
  message: string
  connectionTime?: number
}> {
  const startTime = Date.now()
  
  try {
    switch (dataSource.type) {
      case 'POSTGRESQL':
      case 'MYSQL':
      case 'SQLITE':
        return await testDatabaseConnection(dataSource)
      
      case 'API':
        return await testApiConnection(dataSource)
      
      case 'CSV':
      case 'SPREADSHEET':
        return await testFileConnection(dataSource)
      
      case 'MONGODB':
        return await testMongoConnection(dataSource)
      
      default:
        return {
          success: false,
          message: `Unsupported data source type: ${dataSource.type}`,
        }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed',
      connectionTime: Date.now() - startTime,
    }
  }
}

async function testDatabaseConnection(dataSource: any): Promise<{
  success: boolean
  message: string
  connectionTime?: number
}> {
  const startTime = Date.now()
  
  // In a real implementation, you would use the appropriate database client
  // For demo purposes, we'll simulate the connection test
  const { host, port, database, username, password } = dataSource.config
  
  if (!host || !database || !username) {
    return {
      success: false,
      message: 'Missing required connection parameters',
    }
  }

  // Simulate connection test delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  
  // Simulate success/failure (80% success rate for demo)
  const success = Math.random() > 0.2
  
  return {
    success,
    message: success ? 'Database connection successful' : 'Failed to connect to database',
    connectionTime: Date.now() - startTime,
  }
}

async function testApiConnection(dataSource: any): Promise<{
  success: boolean
  message: string
  connectionTime?: number
}> {
  const startTime = Date.now()
  
  const { url, headers, timeout = 5000 } = dataSource.config
  
  if (!url) {
    return {
      success: false,
      message: 'API URL is required',
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers || {},
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    const success = response.ok
    
    return {
      success,
      message: success 
        ? `API connection successful (${response.status})` 
        : `API connection failed (${response.status})`,
      connectionTime: Date.now() - startTime,
    }
  } catch (error) {
    return {
      success: false,
      message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      connectionTime: Date.now() - startTime,
    }
  }
}

async function testFileConnection(dataSource: any): Promise<{
  success: boolean
  message: string
  connectionTime?: number
}> {
  const startTime = Date.now()
  
  const { url, path } = dataSource.config
  
  if (!url && !path) {
    return {
      success: false,
      message: 'File URL or path is required',
    }
  }

  // Simulate file access test
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500))
  
  // Simulate success/failure (85% success rate for demo)
  const success = Math.random() > 0.15
  
  return {
    success,
    message: success ? 'File access successful' : 'Failed to access file',
    connectionTime: Date.now() - startTime,
  }
}

async function testMongoConnection(dataSource: any): Promise<{
  success: boolean
  message: string
  connectionTime?: number
}> {
  const startTime = Date.now()
  
  const { connectionString, database } = dataSource.config
  
  if (!connectionString || !database) {
    return {
      success: false,
      message: 'MongoDB connection string and database name are required',
    }
  }

  // Simulate MongoDB connection test
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))
  
  // Simulate success/failure (75% success rate for demo)
  const success = Math.random() > 0.25
  
  return {
    success,
    message: success ? 'MongoDB connection successful' : 'Failed to connect to MongoDB',
    connectionTime: Date.now() - startTime,
  }
}