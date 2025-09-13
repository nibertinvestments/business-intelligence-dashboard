# Testing Guidelines

This document outlines the testing strategy, guidelines, and best practices for the Business Intelligence Dashboard project.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Testing Tools](#testing-tools)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

## Testing Philosophy

Our testing approach follows these principles:

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Test-Driven Development (TDD)**: Write tests before implementation when possible
3. **Quality over Quantity**: Focus on meaningful tests that catch real bugs
4. **Fast Feedback**: Tests should run quickly to enable rapid development
5. **Maintainable Tests**: Tests should be easy to read, write, and maintain

## Testing Strategy

### Coverage Goals

- **Unit Tests**: 90% coverage for business logic and utilities
- **Integration Tests**: 80% coverage for API endpoints and database operations
- **E2E Tests**: Cover critical user journeys and workflows
- **Performance Tests**: Validate performance requirements under load

### Risk-Based Testing

We prioritize testing based on:

1. **Business Critical Features**: Authentication, data integrity, billing
2. **High-Risk Areas**: Multi-tenant isolation, security, data processing
3. **Complex Logic**: Analytics calculations, dashboard rendering
4. **External Integrations**: Database connections, third-party APIs

## Test Types

### Unit Tests

Test individual functions, components, and modules in isolation.

**When to write:**
- Pure functions and business logic
- React components
- Utility functions
- Data transformations

**Example:**
```typescript
// utils/metrics.test.ts
import { calculateMetrics } from './metrics';

describe('calculateMetrics', () => {
  it('should calculate correct metrics for valid data', () => {
    const data = [
      { value: 10, timestamp: '2024-01-01' },
      { value: 20, timestamp: '2024-01-02' },
      { value: 30, timestamp: '2024-01-03' }
    ];

    const result = calculateMetrics(data);

    expect(result).toEqual({
      total: 60,
      average: 20,
      min: 10,
      max: 30,
      count: 3
    });
  });

  it('should handle empty data gracefully', () => {
    const result = calculateMetrics([]);

    expect(result).toEqual({
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0
    });
  });

  it('should handle null values in data', () => {
    const data = [
      { value: 10, timestamp: '2024-01-01' },
      { value: null, timestamp: '2024-01-02' },
      { value: 30, timestamp: '2024-01-03' }
    ];

    const result = calculateMetrics(data);

    expect(result).toEqual({
      total: 40,
      average: 20,
      min: 10,
      max: 30,
      count: 2 // Null values excluded
    });
  });
});
```

### Integration Tests

Test interactions between different modules, APIs, and external services.

**When to write:**
- API endpoints
- Database operations
- Service integrations
- Authentication flows

**Example:**
```typescript
// api/dashboards.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/dashboards';
import { prisma } from '../../lib/prisma';
import { createTestUser, createTestDashboard } from '../helpers/factories';

describe('/api/dashboards', () => {
  let testUser: any;
  let testToken: string;

  beforeEach(async () => {
    testUser = await createTestUser();
    testToken = generateTestToken(testUser.id);
  });

  afterEach(async () => {
    await prisma.dashboard.deleteMany({
      where: { tenantId: testUser.tenantId }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
  });

  describe('GET /api/dashboards', () => {
    it('should return user dashboards with correct tenant isolation', async () => {
      // Create dashboards for test user
      const dashboard1 = await createTestDashboard(testUser.tenantId);
      const dashboard2 = await createTestDashboard(testUser.tenantId);
      
      // Create dashboard for different tenant
      const otherTenantDashboard = await createTestDashboard('other-tenant');

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.dashboards).toHaveLength(2);
      expect(responseData.data.dashboards.map(d => d.id)).toContain(dashboard1.id);
      expect(responseData.data.dashboards.map(d => d.id)).toContain(dashboard2.id);
      expect(responseData.data.dashboards.map(d => d.id)).not.toContain(otherTenantDashboard.id);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('POST /api/dashboards', () => {
    it('should create dashboard with valid data', async () => {
      const dashboardData = {
        title: 'Test Dashboard',
        description: 'Test description',
        layout: { cols: 12, rows: 10 }
      };

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        body: dashboardData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data.title).toBe(dashboardData.title);
      expect(responseData.data.tenantId).toBe(testUser.tenantId);
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        body: {}, // Missing required fields
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('title');
    });
  });
});
```

### End-to-End Tests

Test complete user workflows and interactions.

**When to write:**
- Critical user journeys
- Cross-component interactions
- Authentication flows
- Data visualization workflows

**Example:**
```typescript
// e2e/dashboard-workflow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create and view a dashboard', async ({ page }) => {
    // Navigate to dashboard creation
    await page.click('[data-testid=create-dashboard-button]');
    await expect(page).toHaveURL('/dashboard/new');

    // Fill dashboard details
    await page.fill('[data-testid=dashboard-title]', 'E2E Test Dashboard');
    await page.fill('[data-testid=dashboard-description]', 'Created via E2E test');
    
    // Create dashboard
    await page.click('[data-testid=create-button]');
    await expect(page).toHaveURL(/\/dashboard\/[a-z0-9-]+/);

    // Verify dashboard is displayed
    await expect(page.locator('[data-testid=dashboard-title]')).toHaveText('E2E Test Dashboard');
    await expect(page.locator('[data-testid=dashboard-description]')).toHaveText('Created via E2E test');
  });

  test('should add widget to dashboard', async ({ page }) => {
    // Go to existing dashboard
    await page.goto('/dashboard/test-dashboard-id');

    // Add widget
    await page.click('[data-testid=add-widget-button]');
    await page.selectOption('[data-testid=widget-type-select]', 'chart');
    await page.fill('[data-testid=widget-title]', 'Sales Chart');
    await page.selectOption('[data-testid=chart-type-select]', 'line');
    
    // Save widget
    await page.click('[data-testid=save-widget-button]');

    // Verify widget is added
    await expect(page.locator('[data-testid=widget-title]')).toHaveText('Sales Chart');
    await expect(page.locator('[data-testid=chart-container]')).toBeVisible();
  });

  test('should handle real-time data updates', async ({ page }) => {
    await page.goto('/dashboard/live-dashboard-id');

    // Wait for initial data load
    await expect(page.locator('[data-testid=chart-container]')).toBeVisible();
    
    // Get initial data point count
    const initialDataPoints = await page.locator('[data-testid=data-point]').count();

    // Trigger data update (via API or WebSocket simulation)
    await page.evaluate(() => {
      // Simulate real-time update
      window.dispatchEvent(new CustomEvent('dashboard-update', {
        detail: { type: 'new-data', value: 150 }
      }));
    });

    // Verify new data point is displayed
    await expect(page.locator('[data-testid=data-point]')).toHaveCount(initialDataPoints + 1);
  });
});
```

### Component Tests

Test React components with React Testing Library.

**Example:**
```typescript
// components/Dashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { mockDashboardData } from '../__mocks__/dashboard';

// Mock dependencies
jest.mock('../hooks/useDashboard', () => ({
  useDashboard: jest.fn()
}));

describe('Dashboard Component', () => {
  const mockUseDashboard = require('../hooks/useDashboard').useDashboard;

  beforeEach(() => {
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      updateWidget: jest.fn(),
      deleteWidget: jest.fn()
    });
  });

  it('should render dashboard with widgets', () => {
    render(<Dashboard id="test-dashboard-id" />);

    expect(screen.getByText(mockDashboardData.title)).toBeInTheDocument();
    expect(screen.getByText(mockDashboardData.description)).toBeInTheDocument();
    expect(screen.getAllByTestId('widget-container')).toHaveLength(mockDashboardData.widgets.length);
  });

  it('should show loading state', () => {
    mockUseDashboard.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(<Dashboard id="test-dashboard-id" />);

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
  });

  it('should show error state', () => {
    const errorMessage = 'Failed to load dashboard';
    mockUseDashboard.mockReturnValue({
      data: null,
      loading: false,
      error: new Error(errorMessage)
    });

    render(<Dashboard id="test-dashboard-id" />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should handle widget deletion', async () => {
    const mockDeleteWidget = jest.fn();
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      loading: false,
      error: null,
      deleteWidget: mockDeleteWidget
    });

    render(<Dashboard id="test-dashboard-id" />);

    const deleteButton = screen.getAllByTestId('delete-widget-button')[0];
    fireEvent.click(deleteButton);

    // Confirm deletion in modal
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteWidget).toHaveBeenCalledWith(mockDashboardData.widgets[0].id);
    });
  });
});
```

## Testing Tools

### Primary Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW (Mock Service Worker)**: API mocking
- **Prisma Test Environment**: Database testing

### Additional Tools

- **@testing-library/jest-dom**: Additional Jest matchers
- **@testing-library/user-event**: Simulate user interactions
- **jest-environment-jsdom**: DOM environment for tests
- **supertest**: HTTP integration testing

### Configuration

**Jest Configuration (jest.config.js):**
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'pages/**/*.{js,ts,tsx}',
    'components/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).{js,ts,tsx}',
    '**/*.(test|spec).{js,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

**Playwright Configuration (playwright.config.ts):**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Project Structure

```
tests/
├── __mocks__/              # Mock data and modules
│   ├── dashboard.ts
│   ├── user.ts
│   └── api-responses.ts
├── helpers/                # Test utilities and factories
│   ├── factories.ts
│   ├── setup.ts
│   └── db-helpers.ts
├── unit/                   # Unit tests
│   ├── components/
│   ├── utils/
│   └── lib/
├── integration/            # Integration tests
│   ├── api/
│   └── database/
└── fixtures/               # Test data files
    ├── dashboards.json
    └── users.json

e2e/                        # End-to-end tests
├── auth.spec.ts
├── dashboard.spec.ts
└── admin.spec.ts
```

## Writing Tests

### Test Naming Conventions

- **Describe blocks**: Use the component/function name
- **Test cases**: Use "should [expected behavior] when [condition]"

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // Test implementation
    });

    it('should throw validation error when email is invalid', () => {
      // Test implementation
    });

    it('should throw conflict error when email already exists', () => {
      // Test implementation
    });
  });
});
```

### Test Data Management

Use factories for consistent test data:

```typescript
// tests/helpers/factories.ts
import { faker } from '@faker-js/faker';

export const createTestUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  tenantId: faker.string.uuid(),
  createdAt: faker.date.past(),
  ...overrides,
});

export const createTestDashboard = (tenantId: string, overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  tenantId,
  widgets: [],
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});
```

### Mock Management

Use MSW for API mocking:

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/dashboards', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          dashboards: [
            createTestDashboard('tenant-1'),
            createTestDashboard('tenant-1'),
          ],
        },
      })
    );
  }),

  rest.post('/api/dashboards', (req, res, ctx) => {
    const newDashboard = createTestDashboard('tenant-1', req.body);
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newDashboard,
      })
    );
  }),
];
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- dashboard.test.ts

# Run tests with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### High-Priority Areas (90% coverage required)

- Authentication and authorization
- Data validation and sanitization
- Multi-tenant isolation logic
- Business calculation functions
- API route handlers

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run db:migrate:test
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Testing

### Load Testing with k6

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50, // 50 virtual users
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function () {
  const response = http.get('http://localhost:3000/api/dashboards', {
    headers: {
      Authorization: `Bearer ${__ENV.TEST_TOKEN}`,
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

### Database Performance Testing

```typescript
// tests/performance/database.test.ts
describe('Database Performance', () => {
  it('should handle concurrent dashboard queries efficiently', async () => {
    const concurrentQueries = 100;
    const startTime = Date.now();

    const promises = Array.from({ length: concurrentQueries }, () =>
      prisma.dashboard.findMany({
        where: { tenantId: 'test-tenant' },
        include: { widgets: true },
      })
    );

    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should maintain performance with large datasets', async () => {
    // Create test data
    await createLargeDataset(10000); // 10k records

    const startTime = Date.now();
    
    const result = await prisma.analyticsData.findMany({
      where: {
        timestamp: {
          gte: new Date('2024-01-01'),
          lte: new Date('2024-12-31'),
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    const duration = Date.now() - startTime;
    
    expect(result).toHaveLength(1000);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

## Security Testing

### Authentication Testing

```typescript
// tests/security/auth.test.ts
describe('Authentication Security', () => {
  it('should prevent unauthorized access to protected endpoints', async () => {
    const response = await request(app)
      .get('/api/dashboards')
      .expect(401);

    expect(response.body.error).toContain('unauthorized');
  });

  it('should validate JWT token properly', async () => {
    const invalidToken = 'invalid.jwt.token';
    
    const response = await request(app)
      .get('/api/dashboards')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);

    expect(response.body.error).toContain('invalid token');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array.from({ length: 10 }, () =>
      request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
    );

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

### Input Validation Testing

```typescript
// tests/security/validation.test.ts
describe('Input Validation', () => {
  it('should sanitize SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/dashboards')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: maliciousInput,
        description: 'Test description',
      });

    // Should create dashboard with sanitized title, not execute SQL
    expect(response.status).toBe(201);
    expect(response.body.data.title).not.toContain('DROP TABLE');
  });

  it('should prevent XSS in user inputs', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/dashboards')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: xssPayload,
        description: 'Test description',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.title).not.toContain('<script>');
  });
});
```

This comprehensive testing guide provides the foundation for maintaining high-quality, secure, and performant code in the Business Intelligence Dashboard project.