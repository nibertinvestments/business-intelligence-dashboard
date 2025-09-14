# Business Intelligence Dashboard - GitHub Copilot Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only if the information in these instructions is incomplete or found to be in error.**

## Project Overview

The Business Intelligence Dashboard is a comprehensive SaaS Analytics Platform built with Next.js 14, TypeScript, PostgreSQL, and Prisma. It provides real-time data visualization, multi-tenant architecture, and enterprise-grade monitoring capabilities.

## Critical Setup & Build Instructions

### Prerequisites Validation
- **Node.js**: Version 20+ required (currently validated with 20.19.5)
- **npm**: Version 9+ required (currently validated with 10.8.2)
- **PostgreSQL**: Version 15+ required (currently validated with 16.10)
- **System Memory**: 8GB RAM minimum, 16GB recommended

### Environment Setup
```bash
# 1. Copy environment template (REQUIRED)
cp .env.example .env.local

# 2. Install dependencies (~25 seconds)
npm install

# 3. Start PostgreSQL service
sudo systemctl start postgresql

# 4. Create database and user
sudo -u postgres createdb bi_dashboard_dev
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"

# 5. Update .env.local with correct DATABASE_URL
# Change: DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard_dev
```

### Database Setup Commands
```bash
# Set environment variable for Prisma
export DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard_dev

# Generate Prisma client (~1 second)
npm run db:generate

# Run database migrations (~2 seconds)
npm run db:migrate

# Seed database with sample data (~3 seconds)
npm run db:seed
```

**Login Credentials After Seeding:**
- Admin: `admin@example.com` / `admin123`
- Demo: `demo@example.com` / `demo123`

### Build & Development Commands

#### Development Server
```bash
# Start development server
export DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard_dev
npm run dev
# Server starts on http://localhost:3000
# Ready in ~1.3 seconds
```

#### Build Process
```bash
# Production build (~25 seconds) - NEVER CANCEL
# Set timeout to 60+ minutes for safety
export DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard_dev
npm run build
```
**⚠️ CRITICAL: NEVER CANCEL BUILD COMMANDS. Build takes ~25 seconds but may take longer on slower systems. Always set timeout to 60+ minutes.**

### Testing Commands

#### Unit Tests
```bash
# Run unit tests (~2 seconds) - NEVER CANCEL
export DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard_dev
npm test
# Set timeout to 30+ minutes for safety
```

#### End-to-End Tests
```bash
# Install Playwright browsers first (required once)
npx playwright install

# Run e2e tests (requires dev server to be stopped first)
npm run test:e2e
# Note: Will start its own dev server automatically
```

#### Test Coverage
```bash
# Run tests with coverage
npm run test:coverage
```

### Code Quality Commands

#### Linting
```bash
# Run linting (~2 seconds)
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

#### Type Checking
```bash
# Run TypeScript type checking (~4 seconds)
npm run type-check
# Note: May show test file type errors - this is expected
```

#### Code Formatting
```bash
# Check formatting
npm run format:check
# Note: May fail due to missing @tailwindcss/forms dependency

# Fix formatting
npm run format
```

## Validation Scenarios

**ALWAYS test these scenarios after making changes:**

### 1. Complete Application Flow
```bash
# 1. Start development server
export DATABASE_URL=postgresql://postgres:password@localhost:5432/bi_dashboard_dev
npm run dev

# 2. Navigate to http://localhost:3000
# 3. Should redirect to /auth/signin
# 4. Login with admin@example.com / admin123
# 5. Should redirect to /dashboard
# 6. Verify navigation works (Dashboards, Data Sources, Analytics)
# 7. Test dashboard creation and viewing
```

### 2. Build Validation
```bash
# 1. Run full build
npm run build

# 2. Start production server
npm start

# 3. Test application functionality
# 4. Verify all routes work correctly
```

### 3. Database Operations
```bash
# Test database connectivity
npm run db:status

# Reset database if needed (WARNING: destroys data)
npm run db:migrate:reset

# View database in browser
npm run db:studio
```

## Critical Timing & Timeout Information

**⚠️ NEVER CANCEL ANY OF THESE COMMANDS:**

| Command | Typical Time | Recommended Timeout | Notes |
|---------|-------------|-------------------|-------|
| `npm install` | 25 seconds | 300 seconds | Downloads ~1463 packages |
| `npm run build` | 25 seconds | 3600 seconds | **NEVER CANCEL** - May take longer |
| `npm test` | 2 seconds | 1800 seconds | **NEVER CANCEL** - Unit tests |
| `npm run test:e2e` | Variable | 1800 seconds | **NEVER CANCEL** - E2E tests |
| `npm run db:migrate` | 2 seconds | 120 seconds | Database operations |
| `npm run db:seed` | 3 seconds | 120 seconds | Sample data creation |
| `npm run lint` | 2 seconds | 300 seconds | Code linting |
| `npm run type-check` | 4 seconds | 300 seconds | TypeScript validation |

## Known Issues & Workarounds

### 1. Prettier/Tailwind Configuration
- `npm run format:check` fails due to missing `@tailwindcss/forms` dependency
- **Workaround**: This doesn't affect application functionality
- Individual file formatting with `prettier` works correctly

### 2. Type Checking Test Files
- `npm run type-check` shows errors in test files for Jest globals
- **Workaround**: Tests run correctly despite TypeScript errors
- This is a configuration issue, not a functional problem

### 3. E2E Test Server Conflicts
- E2E tests fail if dev server is already running on port 3000
- **Solution**: Stop dev server before running e2e tests, or set `reuseExistingServer: true`

### 4. Database Authentication
- Default PostgreSQL setup may require password configuration
- **Solution**: Set postgres user password as shown in setup commands

## Project Structure (Key Locations)

### Source Code
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
└── types/              # TypeScript type definitions
```

### Configuration Files
```
.env.local              # Environment variables (create from .env.example)
package.json            # Dependencies and scripts
prisma/schema.prisma    # Database schema
jest.config.js          # Test configuration
playwright.config.ts    # E2E test configuration
tailwind.config.js      # Tailwind CSS configuration
```

### Testing
```
tests/
├── unit/               # Unit tests (Jest + React Testing Library)
└── e2e/                # End-to-end tests (Playwright)
```

## Multi-Tenant Security Requirements

**CRITICAL**: This application uses multi-tenant architecture. Always ensure:

1. **Tenant Isolation**: All database queries include tenant ID filtering
2. **Authentication**: Verify user authentication on all protected routes
3. **Authorization**: Check user permissions before data access
4. **Data Validation**: Validate all inputs to prevent injection attacks

Example of proper tenant-aware query:
```typescript
const dashboard = await prisma.dashboard.findUnique({
  where: { 
    id: dashboardId, 
    tenantId: user.tenantId  // ALWAYS include tenant isolation
  }
});
```

## CI/CD Pipeline Requirements

Before committing changes, ALWAYS run:
```bash
# 1. Linting
npm run lint

# 2. Type checking (expect test file errors)
npm run type-check

# 3. Unit tests
npm test

# 4. Build verification
npm run build
```

## Performance Monitoring

The application includes New Relic monitoring. Key metrics to watch:
- Page load times (target: < 2 seconds)
- Database query performance
- API response times
- Error rates and user experience

## Common Development Tasks

### Adding New Database Entities
```bash
# 1. Update prisma/schema.prisma
# 2. Generate migration
npm run db:migrate

# 3. Update seed data if needed
# Edit prisma/seed.ts and run:
npm run db:seed
```

### Creating New Components
- Place in `src/components/`
- Include TypeScript types
- Add unit tests in `tests/unit/`
- Follow existing patterns for styling with Tailwind CSS

### API Development
- API routes in `src/app/api/`
- Include proper error handling
- Implement tenant isolation
- Add input validation with Zod schemas

## Emergency Procedures

### Reset Development Environment
```bash
# 1. Stop all servers
# 2. Reset database
npm run db:migrate:reset

# 3. Clean install
rm -rf node_modules package-lock.json .next
npm install

# 4. Rebuild
npm run build

# 5. Restart development
npm run dev
```

### Debug Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# View database logs
sudo journalctl -u postgresql

# Test database connection
sudo -u postgres psql -d bi_dashboard_dev
```

## Technology Stack Summary

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js (via Next.js API routes)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library, Playwright
- **Monitoring**: New Relic APM
- **Deployment**: Docker, Vercel (frontend), cloud platforms

## Success Validation Checklist

After any changes, verify:
- [ ] Application builds successfully (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Development server starts without errors (`npm run dev`)
- [ ] Login functionality works with demo credentials
- [ ] Dashboard displays correctly with sample data
- [ ] Navigation between sections works
- [ ] Database operations complete successfully
- [ ] No console errors in browser developer tools

Remember: This is an enterprise-grade application handling sensitive business data. Always prioritize security, performance, and reliability in all implementations.