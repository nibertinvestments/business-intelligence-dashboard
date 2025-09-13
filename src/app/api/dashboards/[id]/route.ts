import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateDashboardSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  layout: z.object({
    cols: z.number().min(1).max(24),
    rows: z.number().min(1).max(50),
    gridGap: z.number().optional(),
  }).optional(),
  settings: z.record(z.any()).optional(),
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

    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        widgets: {
          include: {
            dataSource: {
              select: { id: true, name: true, type: true, status: true },
            },
          },
        },
      },
    })

    if (!dashboard) {
      return NextResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dashboard,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
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
    const data = updateDashboardSchema.parse(body)

    // Check if dashboard exists and user has permission
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingDashboard) {
      return NextResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or has admin role
    if (existingDashboard.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only edit your own dashboards' },
        { status: 403 }
      )
    }

    const dashboard = await prisma.dashboard.update({
      where: { id: params.id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        widgets: {
          include: {
            dataSource: {
              select: { id: true, name: true, type: true, status: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: dashboard,
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

    console.error('Error updating dashboard:', error)
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

    // Check if dashboard exists and user has permission
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingDashboard) {
      return NextResponse.json(
        { success: false, error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or has admin role
    if (existingDashboard.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete your own dashboards' },
        { status: 403 }
      )
    }

    await prisma.dashboard.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Dashboard deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}