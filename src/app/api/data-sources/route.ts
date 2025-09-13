import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const getDataSourcesSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val), 100) : 20),
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['name', 'type', 'createdAt', 'updatedAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

const createDataSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['POSTGRESQL', 'MYSQL', 'SQLITE', 'API', 'CSV', 'SPREADSHEET', 'MONGODB']),
  config: z.record(z.any()),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const {
      page,
      limit,
      search,
      type,
      status,
      sortBy,
      sortOrder,
    } = getDataSourcesSchema.parse(params)

    const skip = (page - 1) * limit

    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(type && { type: type as any }),
      ...(status && { status: status as any }),
    }

    const [dataSources, total] = await Promise.all([
      prisma.dataSource.findMany({
        where,
        include: {
          _count: {
            select: { widgets: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.dataSource.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        dataSources,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching data sources:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins and editors can create data sources
    if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You need editor permissions to create data sources' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createDataSourceSchema.parse(body)

    // Remove sensitive information from config for logging
    const { config: dataSourceConfig, ...logData } = data
    console.log('Creating data source:', logData)

    const dataSource = await prisma.dataSource.create({
      data: {
        ...data,
        tenantId: session.user.tenantId,
        status: 'DISCONNECTED', // Start as disconnected until tested
      },
      include: {
        _count: {
          select: { widgets: true },
        },
      },
    })

    // Remove sensitive config data from response
    const config = dataSource.config as any
    const responseDataSource = {
      ...dataSource,
      config: {
        ...config,
        password: config?.password ? '[HIDDEN]' : undefined,
        apiKey: config?.apiKey ? '[HIDDEN]' : undefined,
      },
    }

    return NextResponse.json({
      success: true,
      data: responseDataSource,
    }, { status: 201 })
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

    console.error('Error creating data source:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}