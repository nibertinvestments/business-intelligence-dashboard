import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWidgetSchema = z.object({
  type: z.enum(['CHART', 'TABLE', 'METRIC', 'TEXT', 'IMAGE']).optional(),
  title: z.string().min(1, 'Title is required').optional(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1).max(24),
    h: z.number().min(1).max(20),
  }).optional(),
  config: z.record(z.any()).optional(),
  dataSourceId: z.string().optional(),
})

export async function GET(
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

    const widget = await prisma.widget.findFirst({
      where: {
        id: params.id,
        dashboard: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        dataSource: {
          select: { id: true, name: true, type: true, status: true },
        },
        dashboard: {
          select: { id: true, title: true, userId: true },
        },
      },
    })

    if (!widget) {
      return NextResponse.json(
        { success: false, error: 'Widget not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: widget,
    })
  } catch (error) {
    console.error('Error fetching widget:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const data = updateWidgetSchema.parse(body)

    // Check if widget exists and user has permission
    const existingWidget = await prisma.widget.findFirst({
      where: {
        id: params.id,
        dashboard: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        dashboard: true,
      },
    })

    if (!existingWidget) {
      return NextResponse.json(
        { success: false, error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Check if user is dashboard owner or has editor/admin role
    if (
      existingWidget.dashboard.userId !== session.user.id && 
      !['ADMIN', 'EDITOR'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You need editor permissions to modify widgets' },
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

    const widget = await prisma.widget.update({
      where: { id: params.id },
      data,
      include: {
        dataSource: {
          select: { id: true, name: true, type: true, status: true },
        },
        dashboard: {
          select: { id: true, title: true, userId: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: widget,
    })
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

    console.error('Error updating widget:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if widget exists and user has permission
    const existingWidget = await prisma.widget.findFirst({
      where: {
        id: params.id,
        dashboard: {
          tenantId: session.user.tenantId,
        },
      },
      include: {
        dashboard: true,
      },
    })

    if (!existingWidget) {
      return NextResponse.json(
        { success: false, error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Check if user is dashboard owner or has editor/admin role
    if (
      existingWidget.dashboard.userId !== session.user.id && 
      !['ADMIN', 'EDITOR'].includes(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You need editor permissions to delete widgets' },
        { status: 403 }
      )
    }

    await prisma.widget.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Widget deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting widget:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}