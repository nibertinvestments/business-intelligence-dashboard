import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createWidgetSchema = z.object({
  type: z.enum(['CHART', 'TABLE', 'METRIC', 'TEXT', 'IMAGE']),
  title: z.string().min(1, 'Title is required'),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1).max(24),
    h: z.number().min(1).max(20),
  }),
  config: z.record(z.any()),
  dataSourceId: z.string().optional(),
})

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

    const body = await request.json()
    const data = createWidgetSchema.parse(body)

    // Check if dashboard exists and user has permission
    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!dashboard) {
      return NextResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or has editor/admin role
    if (
      dashboard.userId !== session.user.id && 
      !['ADMIN', 'EDITOR'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You need editor permissions to add widgets' },
        { status: 403 }
      )
    }

    // Validate data source exists if provided
    if (data.dataSourceId) {
      const dataSource = await prisma.dataSource.findFirst({
        where: {
          id: data.dataSourceId,
          tenantId: session.user.tenantId,
        },
      })

      if (!dataSource) {
        return NextResponse.json(
          { success: false, error: 'Data source not found' },
          { status: 400 }
        )
      }
    }

    const widget = await prisma.widget.create({
      data: {
        ...data,
        dashboardId: params.id,
      },
      include: {
        dataSource: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: widget,
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

    console.error('Error creating widget:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}