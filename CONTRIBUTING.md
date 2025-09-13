# Contributing to Business Intelligence Dashboard

Thank you for your interest in contributing to the Business Intelligence Dashboard! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Security](#security)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20+ installed
- PostgreSQL 15+ running locally
- Redis 7+ running locally
- Git configured with your GitHub account

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/business-intelligence-dashboard.git
   cd business-intelligence-dashboard
   
   # Add upstream remote
   git remote add upstream https://github.com/nibertinvestments/business-intelligence-dashboard.git
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your local environment variables
   # Edit .env.local with your database and API keys
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed development data
   npm run db:seed
   ```

5. **Verify Setup**
   ```bash
   # Run tests to ensure everything is working
   npm test
   
   # Start development server
   npm run dev
   ```

## Development Workflow

### Branch Strategy

We use the following branch strategy:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

### Workflow Steps

1. **Sync with Upstream**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development**
   - Make your changes
   - Write/update tests
   - Ensure code follows style guidelines
   - Update documentation if needed

4. **Testing**
   ```bash
   # Run all tests
   npm test
   
   # Run linting
   npm run lint
   
   # Run type checking
   npm run type-check
   ```

5. **Commit Changes**
   ```bash
   # Use conventional commits format
   git commit -m "feat: add new dashboard widget component"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Implement proper error handling

```typescript
// Good
interface DashboardConfig {
  id: string;
  title: string;
  widgets: WidgetConfig[];
}

function createDashboard(config: DashboardConfig): Promise<Dashboard> {
  // Implementation
}

// Avoid
type DashboardConfig = {
  id: string;
  title: string;
  widgets: any[];
}
```

### React/Next.js Patterns

- Use functional components with hooks
- Implement proper error boundaries
- Use Server Components by default
- Implement loading states and error handling

```typescript
// Good
export default function DashboardPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard id={params.id} />
    </Suspense>
  );
}

// Component with error handling
function Dashboard({ id }: { id: string }) {
  const { data, error, loading } = useDashboard(id);
  
  if (error) return <ErrorMessage error={error} />;
  if (loading) return <DashboardSkeleton />;
  
  return <DashboardContent data={data} />;
}
```

### Database Patterns

- Use Prisma for all database operations
- Implement proper error handling
- Use transactions for data consistency
- Implement tenant isolation

```typescript
// Good
async function createDashboardWidget(
  data: CreateWidgetInput,
  tenantId: string
): Promise<Widget> {
  return await prisma.widget.create({
    data: {
      ...data,
      tenantId, // Always include tenant ID
      dashboard: {
        connect: { id: data.dashboardId, tenantId } // Verify tenant access
      }
    },
    include: {
      dataSource: true
    }
  });
}
```

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement consistent error responses
- Add input validation

```typescript
// Good API route structure
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await getTenantId(request);
    const dashboard = await getDashboard(params.id, tenantId);
    
    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: dashboard });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Testing Guidelines

### Test Structure

```
tests/
├── unit/              # Unit tests for individual functions/components
├── integration/       # Integration tests for API endpoints
├── e2e/              # End-to-end tests for user workflows
└── fixtures/         # Test data and mock objects
```

### Testing Requirements

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows
- **Coverage**: Maintain minimum 80% code coverage

### Writing Tests

```typescript
// Unit test example
describe('Dashboard Utils', () => {
  describe('calculateMetrics', () => {
    it('should calculate correct metrics for valid data', () => {
      const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
      const result = calculateMetrics(data);
      
      expect(result.total).toBe(60);
      expect(result.average).toBe(20);
    });
    
    it('should handle empty data gracefully', () => {
      const result = calculateMetrics([]);
      
      expect(result.total).toBe(0);
      expect(result.average).toBe(0);
    });
  });
});

// Integration test example
describe('Dashboard API', () => {
  it('should create dashboard with valid data', async () => {
    const response = await request(app)
      .post('/api/dashboards')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Test Dashboard',
        description: 'Test description'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Test Dashboard');
  });
});
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Update documentation
3. Add changelog entry if applicable
4. Verify code follows style guidelines
5. Test your changes manually

### PR Template

Use this template for your pull request:

```markdown
## Description
Brief description of the changes and why they were made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Changelog updated
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer reviews the code
3. **Testing**: All tests must pass
4. **Approval**: Code review approval required
5. **Merge**: Maintainer merges the PR

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead:

1. Email security@nibertinvestments.com
2. Include detailed description of the vulnerability
3. Provide steps to reproduce if possible
4. Wait for confirmation before disclosing publicly

### Security Guidelines

- Never commit secrets or API keys
- Always validate user input
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Follow OWASP security guidelines

## Documentation

### Types of Documentation

1. **Code Comments**: Explain complex business logic
2. **API Documentation**: Document all API endpoints
3. **README Updates**: Keep setup instructions current
4. **Architecture Docs**: Document major architectural decisions

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

## Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Join our [Discord community](https://discord.gg/nibertinvestments)
3. Create a discussion on GitHub
4. Email contributors@nibertinvestments.com

Thank you for contributing to the Business Intelligence Dashboard!