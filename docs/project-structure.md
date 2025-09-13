# Project Structure Overview

This document outlines the recommended project structure for the Business Intelligence Dashboard.

## Directory Structure

```
business-intelligence-dashboard/
├── .env.example                 # Environment variables template
├── .gitignore                  # Git ignore rules
├── .github/                    # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci.yml             # Continuous integration
│   │   ├── deploy.yml         # Deployment workflow
│   │   └── security.yml       # Security scanning
│   └── pull_request_template.md
├── docs/                       # Documentation
│   ├── api.md                 # API documentation
│   ├── deployment.md          # Deployment guide
│   ├── testing.md             # Testing guidelines
│   ├── troubleshooting.md     # Troubleshooting guide
│   └── branch-management.md   # Branch and test recovery
├── public/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── src/                        # Source code
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── auth/             # Authentication components
│   │   └── analytics/        # Analytics components
│   ├── pages/                # Next.js pages and API routes
│   │   ├── api/              # API endpoints
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # Dashboard pages
│   │   └── admin/            # Admin pages
│   ├── lib/                  # Utility libraries
│   │   ├── prisma.ts         # Database client
│   │   ├── auth.ts           # Authentication config
│   │   ├── redis.ts          # Redis client
│   │   └── utils.ts          # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   ├── styles/               # CSS and styling
│   └── middleware.ts         # Next.js middleware
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Database seeding
├── tests/                     # Test files
│   ├── __mocks__/            # Mock data and modules
│   ├── helpers/              # Test utilities
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── fixtures/             # Test data
├── e2e/                      # End-to-end tests
├── scripts/                  # Utility scripts
├── docker/                   # Docker configuration
├── k8s/                      # Kubernetes manifests
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
├── jest.config.js           # Jest testing configuration
├── playwright.config.ts     # Playwright E2E testing
├── prettier.config.js       # Code formatting rules
├── eslint.config.js         # Linting rules
└── README.md                # Project documentation
```

## Component Organization

### UI Components (`src/components/ui/`)

Reusable, generic UI components:

```
ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   ├── Button.stories.tsx
│   └── index.ts
├── Input/
├── Modal/
├── Card/
├── Table/
└── Chart/
```

### Feature Components (`src/components/dashboard/`)

Feature-specific components:

```
dashboard/
├── DashboardGrid/
├── WidgetContainer/
├── ChartWidget/
├── MetricWidget/
├── TableWidget/
└── DashboardSidebar/
```

## API Organization (`src/pages/api/`)

```
api/
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   ├── register.ts
│   └── [...nextauth].ts
├── dashboards/
│   ├── index.ts              # GET /api/dashboards
│   ├── [id].ts              # GET/PUT/DELETE /api/dashboards/[id]
│   └── [id]/
│       ├── widgets.ts        # GET/POST /api/dashboards/[id]/widgets
│       └── export.ts         # GET /api/dashboards/[id]/export
├── widgets/
│   └── [id].ts              # GET/PUT/DELETE /api/widgets/[id]
├── analytics/
│   ├── query.ts             # POST /api/analytics/query
│   └── chart-data/
│       └── [widgetId].ts    # GET /api/analytics/chart-data/[widgetId]
├── users/
│   ├── me.ts                # GET/PUT /api/users/me
│   └── [id].ts              # GET/PUT/DELETE /api/users/[id]
├── organizations/
│   ├── members.ts           # GET/POST /api/organizations/members
│   └── invites.ts           # POST /api/organizations/invites
├── data-sources/
│   ├── index.ts             # GET/POST /api/data-sources
│   ├── [id].ts              # GET/PUT/DELETE /api/data-sources/[id]
│   └── [id]/
│       ├── test.ts          # POST /api/data-sources/[id]/test
│       └── schema.ts        # GET /api/data-sources/[id]/schema
├── admin/
│   ├── users.ts             # Admin user management
│   ├── organizations.ts     # Admin organization management
│   └── system/
│       ├── health.ts        # GET /api/admin/system/health
│       └── metrics.ts       # GET /api/admin/system/metrics
└── webhooks/
    ├── stripe.ts            # POST /api/webhooks/stripe
    └── github.ts            # POST /api/webhooks/github
```

## Database Schema Organization

### Core Entities

```prisma
// User Management
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  tenantId  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant      Tenant       @relation(fields: [tenantId], references: [id])
  dashboards  Dashboard[]
  sessions    Session[]
  
  @@map("users")
}

model Tenant {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  dashboards  Dashboard[]
  dataSources DataSource[]
  
  @@map("tenants")
}

// Dashboard Entities
model Dashboard {
  id          String   @id @default(cuid())
  title       String
  description String?
  layout      Json?
  settings    Json?
  tenantId    String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tenant  Tenant   @relation(fields: [tenantId], references: [id])
  user    User     @relation(fields: [userId], references: [id])
  widgets Widget[]
  
  @@map("dashboards")
}

model Widget {
  id           String   @id @default(cuid())
  type         WidgetType
  title        String
  config       Json
  position     Json
  dashboardId  String
  dataSourceId String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  dashboard  Dashboard   @relation(fields: [dashboardId], references: [id], onDelete: Cascade)
  dataSource DataSource? @relation(fields: [dataSourceId], references: [id])
  
  @@map("widgets")
}

// Data Management
model DataSource {
  id        String           @id @default(cuid())
  name      String
  type      DataSourceType
  config    Json
  status    DataSourceStatus @default(DISCONNECTED)
  tenantId  String
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  
  tenant  Tenant   @relation(fields: [tenantId], references: [id])
  widgets Widget[]
  
  @@map("data_sources")
}

// Enums
enum Role {
  ADMIN
  EDITOR
  VIEWER
}

enum WidgetType {
  CHART
  TABLE
  METRIC
  TEXT
}

enum DataSourceType {
  POSTGRESQL
  MYSQL
  API
  CSV
  SPREADSHEET
}

enum DataSourceStatus {
  CONNECTED
  DISCONNECTED
  ERROR
}
```

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js Configuration (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

## Naming Conventions

### Files and Directories

- **Components**: PascalCase (e.g., `DashboardGrid.tsx`)
- **Pages**: kebab-case (e.g., `user-settings.tsx`)
- **API routes**: kebab-case (e.g., `data-sources.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Code

- **Variables**: camelCase (e.g., `dashboardData`)
- **Functions**: camelCase (e.g., `fetchDashboard`)
- **Components**: PascalCase (e.g., `<DashboardGrid />`)
- **Types/Interfaces**: PascalCase (e.g., `DashboardConfig`)
- **Enums**: PascalCase with SCREAMING_SNAKE_CASE values

### Database

- **Tables**: snake_case (e.g., `user_sessions`)
- **Columns**: snake_case (e.g., `created_at`)
- **Indexes**: `idx_table_column` (e.g., `idx_users_email`)

## Security Considerations

### Authentication Flow

```
User Login → NextAuth.js → JWT Token → API Middleware → Route Handler
```

### Authorization Levels

1. **Public**: Accessible without authentication
2. **Authenticated**: Requires valid JWT token
3. **Tenant-Scoped**: User can only access their tenant's data
4. **Role-Based**: Additional role-based restrictions
5. **Admin**: Full system access

### Data Protection

- All database queries include tenant filtering
- Input validation using Zod schemas
- SQL injection prevention with Prisma
- XSS protection with proper sanitization
- CSRF protection for state-changing operations

This structure provides a solid foundation for a scalable, maintainable Business Intelligence Dashboard application.