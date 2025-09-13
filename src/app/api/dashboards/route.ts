import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Mock data for development
const mockDashboards = [
  {
    id: '1',
    title: 'Sales Dashboard',
    description: 'Overview of sales metrics',
    config: {},
    isPublic: false,
    organizationId: 'org-1',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    organization: {
      id: 'org-1',
      name: 'Example Company',
    },
    widgets: [
      {
        id: 'widget-1',
        title: 'Revenue Chart',
        type: 'CHART_LINE',
      },
    ],
  },
];

// Validation schema for dashboard creation
const createDashboardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  config: z.object({}).optional(),
  isPublic: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: mockDashboards,
      pagination: {
        total: mockDashboards.length,
        page,
        limit,
        totalPages: Math.ceil(mockDashboards.length / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch dashboards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDashboardSchema.parse(body);

    // Mock creation for now
    const newDashboard = {
      id: Date.now().toString(),
      ...validatedData,
      createdById: 'user-1',
      organizationId: 'org-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      organization: {
        id: 'org-1',
        name: 'Example Company',
      },
    };

    return NextResponse.json(
      { success: true, data: newDashboard },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}