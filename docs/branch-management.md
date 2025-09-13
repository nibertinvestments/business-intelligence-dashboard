# Branch Management and Test Recovery Guide

This guide specifically addresses getting failed tests passing and merging branches to get the Business Intelligence Dashboard project back on track.

## Current Situation Analysis

Based on the issue description, we need to:
1. Identify and fix failing tests
2. Merge branches onto main branch
3. Get the project development moving forward again

## Step 1: Identifying Failed Tests

### Check Test Status

```bash
# Check current test status
npm test

# Get detailed test output
npm test -- --verbose

# Check test coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Common Test Failure Patterns

#### Database-Related Test Failures

**Symptoms:**
- Connection timeout errors
- Migration failures
- Prisma client errors

**Solutions:**
```bash
# Reset test database
npm run db:migrate:reset

# Generate fresh Prisma client
npm run db:generate

# Seed test data
npm run db:seed

# Check database connection
npm run db:status
```

#### Environment Variable Issues

**Symptoms:**
- "Cannot read property of undefined" errors
- API connection failures
- Authentication errors in tests

**Solutions:**
```bash
# Create test environment file
cp .env.example .env.test

# Set test-specific variables
echo "NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/bi_dashboard_test
NEXTAUTH_SECRET=test-secret-key
REDIS_URL=redis://localhost:6379/1" > .env.test

# Export test variables
export NODE_ENV=test
```

#### Dependency Issues

**Symptoms:**
- Module not found errors
- Version conflicts
- Missing peer dependencies

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for vulnerability issues
npm audit fix

# Update dependencies
npm update
```

## Step 2: Fixing Common Test Issues

### React Component Tests

**Common issues and fixes:**

```typescript
// ❌ Common mistake: Not wrapping components that use hooks
import { render } from '@testing-library/react';
import { Dashboard } from './Dashboard';

test('renders dashboard', () => {
  render(<Dashboard />); // This might fail if Dashboard uses React Query or other providers
});

// ✅ Correct: Wrap with necessary providers
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Dashboard } from './Dashboard';

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('renders dashboard', () => {
  render(<Dashboard />, { wrapper: TestWrapper });
});
```

### API Route Tests

**Common issues and fixes:**

```typescript
// ❌ Common mistake: Not mocking database
import handler from '../pages/api/dashboards';

test('GET /api/dashboards', async () => {
  // This will fail if it tries to connect to real database
});

// ✅ Correct: Mock Prisma client
import { jest } from '@jest/globals';
import { prisma } from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  prisma: {
    dashboard: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

test('GET /api/dashboards', async () => {
  mockPrisma.dashboard.findMany.mockResolvedValue([
    { id: '1', title: 'Test Dashboard' },
  ]);
  
  // Test implementation
});
```

### Authentication Tests

**Common issues and fixes:**

```typescript
// ❌ Common mistake: Not mocking authentication
import { getServerSession } from 'next-auth';

test('protected route', async () => {
  // This will fail without proper session mocking
});

// ✅ Correct: Mock authentication
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

test('protected route returns data for authenticated user', async () => {
  mockGetServerSession.mockResolvedValue({
    user: { id: '1', email: 'test@example.com' },
  });
  
  // Test implementation
});

test('protected route returns 401 for unauthenticated user', async () => {
  mockGetServerSession.mockResolvedValue(null);
  
  // Test implementation
});
```

## Step 3: Database Test Setup

### Test Database Configuration

Create a separate test database configuration:

```typescript
// lib/prisma-test.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Test Database Setup Script

```typescript
// scripts/setup-test-db.ts
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

async function setupTestDatabase() {
  const testDatabaseUrl = process.env.DATABASE_URL_TEST;
  
  if (!testDatabaseUrl) {
    throw new Error('DATABASE_URL_TEST environment variable not set');
  }

  console.log('Setting up test database...');

  // Create test database if it doesn't exist
  try {
    execSync('npx prisma db push --force-reset', {
      env: { ...process.env, DATABASE_URL: testDatabaseUrl },
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('Failed to setup test database:', error);
    process.exit(1);
  }

  // Seed test data
  const prisma = new PrismaClient({
    datasources: {
      db: { url: testDatabaseUrl },
    },
  });

  await seedTestData(prisma);
  await prisma.$disconnect();

  console.log('Test database setup complete');
}

async function seedTestData(prisma: PrismaClient) {
  // Create test tenant
  const testTenant = await prisma.tenant.create({
    data: {
      id: 'test-tenant-id',
      name: 'Test Organization',
      slug: 'test-org',
    },
  });

  // Create test user
  await prisma.user.create({
    data: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      tenantId: testTenant.id,
    },
  });

  // Create test dashboard
  await prisma.dashboard.create({
    data: {
      id: 'test-dashboard-id',
      title: 'Test Dashboard',
      description: 'Test dashboard for unit tests',
      tenantId: testTenant.id,
      userId: 'test-user-id',
    },
  });
}

if (require.main === module) {
  setupTestDatabase();
}
```

## Step 4: Continuous Integration Fixes

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bi_dashboard_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test environment
        run: |
          cp .env.example .env.test
          echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bi_dashboard_test" >> .env.test
          echo "REDIS_URL=redis://localhost:6379" >> .env.test
          echo "NEXTAUTH_SECRET=test-secret-key" >> .env.test

      - name: Setup test database
        run: npm run setup:test-db
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bi_dashboard_test

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:ci
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bi_dashboard_test
          REDIS_URL: redis://localhost:6379
          NEXTAUTH_SECRET: test-secret-key

      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bi_dashboard_test
          REDIS_URL: redis://localhost:6379
          NEXTAUTH_SECRET: test-secret-key

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bi_dashboard_test
          REDIS_URL: redis://localhost:6379
          NEXTAUTH_SECRET: test-secret-key

      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
```

## Step 5: Branch Management Strategy

### Current Branch Assessment

```bash
# List all branches
git branch -a

# Check branch status
git status

# Check for uncommitted changes
git diff --name-only

# Check for conflicts
git log --oneline --graph --all
```

### Safe Branch Merging Process

#### 1. Backup Current Work

```bash
# Create backup branch
git checkout -b backup-$(date +%Y%m%d-%H%M%S)
git add .
git commit -m "Backup before merge operations"
git push origin backup-$(date +%Y%m%d-%H%M%S)
```

#### 2. Prepare Main Branch

```bash
# Switch to main branch
git checkout main

# Ensure main is up to date
git pull origin main

# Check if tests pass on main
npm test
```

#### 3. Merge Feature Branches

```bash
# List branches to merge
git branch --no-merged main

# For each feature branch:
git checkout feature-branch-name

# Rebase onto main to avoid merge commits
git rebase main

# Fix any conflicts that arise
# Edit conflicted files, then:
git add .
git rebase --continue

# Run tests on the rebased branch
npm test

# If tests pass, merge to main
git checkout main
git merge feature-branch-name

# Push changes
git push origin main

# Clean up merged branch
git branch -d feature-branch-name
git push origin --delete feature-branch-name
```

#### 4. Alternative: Squash and Merge

For branches with messy commit history:

```bash
# Squash merge to main
git checkout main
git merge --squash feature-branch-name
git commit -m "feat: add feature from branch-name"

# Run tests
npm test

# Push if tests pass
git push origin main
```

### Emergency Recovery Procedures

#### If Main Branch is Broken

```bash
# Identify last working commit
git log --oneline main

# Reset main to last working commit
git checkout main
git reset --hard <last-working-commit-hash>

# Force push (use with extreme caution)
git push --force-with-lease origin main
```

#### If Tests are Completely Broken

```bash
# Skip tests temporarily to unblock development
git commit -m "wip: temporarily skip broken tests" --no-verify

# Create hotfix branch for test fixes
git checkout -b hotfix/fix-tests

# Fix tests systematically
# ... make fixes ...

# Test the fixes
npm test

# Merge hotfix back to main
git checkout main
git merge hotfix/fix-tests
```

## Step 6: Quick Win Checklist

To get the project moving forward quickly:

### Immediate Actions (Day 1)

- [ ] Set up proper test environment variables
- [ ] Create test database with seed data
- [ ] Mock external dependencies in tests
- [ ] Fix basic linting and type errors
- [ ] Get at least unit tests passing

### Short-term Goals (Week 1)

- [ ] All unit tests passing
- [ ] Integration tests working with test database
- [ ] CI/CD pipeline green
- [ ] All feature branches merged or documented
- [ ] Development workflow documented

### Medium-term Goals (Month 1)

- [ ] E2E tests implemented and passing
- [ ] Performance tests baseline established
- [ ] Security testing implemented
- [ ] Production deployment pipeline ready
- [ ] Monitoring and alerting configured

## Step 7: Preventing Future Test Issues

### Code Quality Gates

```json
// .github/pull_request_template.md
## Checklist

- [ ] Tests added for new functionality
- [ ] All tests passing locally
- [ ] Code follows project style guidelines
- [ ] Documentation updated if needed
- [ ] No breaking changes without migration guide

## Testing

- [ ] Unit tests: `npm test`
- [ ] Integration tests: `npm run test:integration`
- [ ] E2E tests: `npm run test:e2e`
- [ ] Performance impact assessed

## Security

- [ ] No sensitive data in commits
- [ ] Dependencies scanned for vulnerabilities
- [ ] Authentication/authorization changes reviewed
```

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"

# Create pre-commit script
echo '#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test

# Check for security issues
npm audit --audit-level moderate' > .husky/pre-commit

chmod +x .husky/pre-commit
```

### Test-Driven Development

```typescript
// Example: TDD approach for new features
describe('Dashboard Analytics', () => {
  // Write tests first
  it('should calculate total revenue correctly', () => {
    const data = [
      { amount: 100, date: '2024-01-01' },
      { amount: 200, date: '2024-01-02' },
    ];
    
    const result = calculateTotalRevenue(data);
    expect(result).toBe(300);
  });

  // Then implement the function
  it('should handle empty data gracefully', () => {
    const result = calculateTotalRevenue([]);
    expect(result).toBe(0);
  });
});
```

This approach ensures:
1. Tests are written before implementation
2. All code paths are tested
3. Requirements are clearly defined
4. Regressions are caught early

By following this guide, you should be able to get the failed tests passing and the project back on track for active development.