import { PrismaClient, Role, DataSourceType, DataSourceStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default',
      description: 'Default organization for the BI Dashboard',
      settings: {
        theme: 'light',
        timezone: 'UTC',
        currency: 'USD',
      },
    },
  })

  console.log('✅ Created default tenant:', defaultTenant.name)

  // Create admin user
  const hashedPassword = await hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: defaultTenant.id,
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create demo user
  const demoPassword = await hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: demoPassword,
      role: Role.EDITOR,
      tenantId: defaultTenant.id,
    },
  })

  console.log('✅ Created demo user:', demoUser.email)

  // Create sample data source
  const sampleDataSource = await prisma.dataSource.upsert({
    where: { id: 'sample-ds' },
    update: {},
    create: {
      id: 'sample-ds',
      name: 'Sample PostgreSQL Database',
      type: DataSourceType.POSTGRESQL,
      status: DataSourceStatus.CONNECTED,
      tenantId: defaultTenant.id,
      config: {
        host: 'localhost',
        port: 5432,
        database: 'sample_analytics',
        username: 'analytics_user',
        description: 'Sample data source for demo purposes',
      },
    },
  })

  console.log('✅ Created sample data source:', sampleDataSource.name)

  // Create sample dashboard
  const sampleDashboard = await prisma.dashboard.upsert({
    where: { id: 'sample-dashboard' },
    update: {},
    create: {
      id: 'sample-dashboard',
      title: 'Sales Analytics Dashboard',
      description: 'A comprehensive view of sales performance and key metrics',
      tenantId: defaultTenant.id,
      userId: adminUser.id,
      isPublic: true,
      layout: {
        cols: 12,
        rows: 10,
        gridGap: 16,
      },
      settings: {
        refreshInterval: 300000, // 5 minutes
        theme: 'light',
        showHeader: true,
        showFooter: true,
      },
    },
  })

  console.log('✅ Created sample dashboard:', sampleDashboard.title)

  // Create sample widgets
  const widgets = [
    {
      id: 'widget-revenue',
      type: 'METRIC' as const,
      title: 'Total Revenue',
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {
        metric: 'revenue',
        format: 'currency',
        prefix: '$',
        query: 'SELECT SUM(amount) FROM sales WHERE date >= NOW() - INTERVAL \'30 days\'',
      },
    },
    {
      id: 'widget-orders',
      type: 'METRIC' as const,
      title: 'Total Orders',
      position: { x: 3, y: 0, w: 3, h: 2 },
      config: {
        metric: 'orders',
        format: 'number',
        query: 'SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL \'30 days\'',
      },
    },
    {
      id: 'widget-growth',
      type: 'CHART' as const,
      title: 'Revenue Growth',
      position: { x: 0, y: 2, w: 6, h: 4 },
      config: {
        chartType: 'line',
        xAxis: 'date',
        yAxis: 'revenue',
        query: 'SELECT DATE(created_at) as date, SUM(amount) as revenue FROM sales GROUP BY DATE(created_at) ORDER BY date',
      },
    },
    {
      id: 'widget-top-products',
      type: 'TABLE' as const,
      title: 'Top Products',
      position: { x: 6, y: 0, w: 6, h: 6 },
      config: {
        columns: ['product_name', 'sales_count', 'revenue'],
        query: 'SELECT product_name, COUNT(*) as sales_count, SUM(amount) as revenue FROM sales GROUP BY product_name ORDER BY revenue DESC LIMIT 10',
      },
    },
  ]

  for (const widget of widgets) {
    await prisma.widget.upsert({
      where: { id: widget.id },
      update: {},
      create: {
        ...widget,
        dashboardId: sampleDashboard.id,
        dataSourceId: sampleDataSource.id,
      },
    })
  }

  console.log('✅ Created sample widgets')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Demo:  demo@example.com / demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Database seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })