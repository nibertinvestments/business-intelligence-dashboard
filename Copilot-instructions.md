# GitHub Copilot Instructions

## Project Overview

This is a **Business Intelligence Dashboard** - a professional SaaS Analytics Platform that provides real-time data visualization, multi-tenant architecture, and enterprise-grade monitoring. The platform is designed to serve as a comprehensive business intelligence solution for organizations of all sizes.

## Technology Stack & Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router and TypeScript
- **UI Components**: React 18 with modern hooks pattern
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: Zustand for lightweight state management
- **Data Visualization**: Chart.js, D3.js, and Recharts for interactive charts
- **Authentication**: NextAuth.js with multi-provider support

### Backend Architecture
- **Runtime**: Node.js 20+ with Express.js framework
- **Database**: PostgreSQL 15+ with Prisma ORM for type-safe database access
- **Caching**: Redis for session storage and query caching
- **API Design**: RESTful APIs with OpenAPI/Swagger documentation
- **Authentication**: JWT tokens with refresh token rotation
- **Security**: CORS, CSRF protection, rate limiting, and input validation

### Infrastructure & Monitoring
- **Monitoring**: New Relic APM for application performance monitoring
- **Logging**: Structured logging with Winston and ELK stack integration
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Cloud**: Multi-cloud support (AWS, Azure, GCP)

## Code Style & Conventions

### TypeScript Guidelines
- Use strict TypeScript configuration with `strict: true`
- Prefer interfaces over types for object shapes
- Use generic types for reusable components
- Implement proper error handling with custom error classes
- Use discriminated unions for complex state management

### React/Next.js Patterns
- Use functional components with hooks exclusively
- Implement proper error boundaries for fault tolerance
- Use Server Components by default, Client Components when needed
- Implement proper loading states and error handling
- Follow the principle of least privilege for data fetching

### Database Patterns
- Use Prisma schema for type-safe database operations
- Implement proper indexing for query optimization
- Use transactions for data consistency
- Follow database normalization principles
- Implement soft deletes for audit trails

### API Design Principles
- Follow RESTful conventions with proper HTTP status codes
- Implement proper pagination for list endpoints
- Use consistent error response format
- Implement API versioning strategy
- Add comprehensive input validation and sanitization

## Security Requirements

### Authentication & Authorization
- Implement multi-factor authentication (MFA)
- Use role-based access control (RBAC) with granular permissions
- Implement session management with secure cookies
- Add OAuth2/SAML integration for enterprise SSO
- Implement account lockout policies and security monitoring

### Data Protection
- Encrypt sensitive data at rest and in transit
- Implement data masking for non-production environments
- Follow GDPR and SOC2 compliance requirements
- Implement audit logging for all data access
- Use parameterized queries to prevent SQL injection

### Multi-Tenancy Security
- Ensure complete data isolation between tenants
- Implement tenant-aware queries and middleware
- Use row-level security (RLS) in PostgreSQL
- Implement cross-tenant access prevention
- Add tenant-specific configuration management

## Performance Requirements

### Frontend Performance
- Implement code splitting and lazy loading
- Optimize bundle size with tree shaking
- Use React.memo and useMemo for expensive calculations
- Implement virtual scrolling for large datasets
- Optimize images with Next.js Image component

### Backend Performance
- Implement database query optimization
- Use Redis for caching frequently accessed data
- Implement connection pooling for database connections
- Add API response caching with proper invalidation
- Implement rate limiting to prevent abuse

### Real-time Features
- Use WebSockets for real-time data updates
- Implement efficient data streaming for large datasets
- Use Server-Sent Events (SSE) for dashboard updates
- Implement proper connection management and reconnection logic
- Add offline support with service workers

## Testing Strategy

### Test Coverage Requirements
- Maintain minimum 80% code coverage
- Write unit tests for all business logic
- Implement integration tests for API endpoints
- Add end-to-end tests for critical user journeys
- Test multi-tenant scenarios and data isolation

### Testing Tools & Patterns
- Use Jest for unit and integration testing
- Use React Testing Library for component testing
- Use Playwright for end-to-end testing
- Use MSW (Mock Service Worker) for API mocking
- Implement visual regression testing for UI components

### Test Organization
- Follow the AAA pattern (Arrange, Act, Assert)
- Use factories for test data generation
- Implement proper test isolation and cleanup
- Use descriptive test names that explain the scenario
- Group related tests in describe blocks

## Development Workflow

### Branch Strategy
- Use feature branches for all development work
- Implement proper code review process
- Use conventional commits for clear commit messages
- Implement automatic dependency updates with Renovate
- Use semantic versioning for releases

### Code Quality
- Use ESLint with strict TypeScript rules
- Implement Prettier for consistent code formatting
- Use Husky for pre-commit hooks
- Implement automated security scanning
- Add performance monitoring and alerting

### Documentation Requirements
- Maintain comprehensive README with setup instructions
- Document all API endpoints with OpenAPI/Swagger
- Add inline code documentation for complex logic
- Maintain architecture decision records (ADRs)
- Document deployment and operational procedures

## Common Patterns & Solutions

### Error Handling
```typescript
// Use custom error classes for different error types
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Implement global error handling middleware
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message, field: error.field });
  }
  // Handle other error types...
};
```

### Database Queries
```typescript
// Use Prisma for type-safe database operations
const dashboard = await prisma.dashboard.findUnique({
  where: { id: dashboardId, tenantId },
  include: {
    widgets: {
      include: {
        dataSource: true
      }
    }
  }
});
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Project-Specific Context

### Current Challenges
1. **Failed Tests**: The project currently has failing tests that need to be addressed before merging branches
2. **Branch Management**: Multiple feature branches need to be merged to main branch
3. **Documentation Gap**: Need comprehensive documentation for new team members
4. **Performance Optimization**: Dashboard loading times need improvement
5. **Security Review**: Multi-tenant security implementation needs audit

### Immediate Priorities
1. Fix failing unit and integration tests
2. Implement proper error boundaries in React components
3. Add comprehensive API documentation
4. Optimize database queries for dashboard data fetching
5. Implement proper tenant isolation validation

### Long-term Goals
1. Implement AI-powered analytics features
2. Add white-label solutions for reseller partners
3. Implement advanced data connectors for external APIs
4. Add real-time collaboration features
5. Implement advanced security features (SSO, SAML)

## Copilot Role & Responsibilities

As GitHub Copilot working on this project, you should:

### Code Generation
- Generate TypeScript code following the established patterns
- Implement proper error handling and validation
- Create type-safe database queries using Prisma
- Generate comprehensive tests for new functionality
- Follow security best practices for multi-tenant applications

### Problem Solving
- Help debug failing tests and identify root causes
- Suggest performance optimizations for slow queries
- Recommend security improvements for sensitive operations
- Provide architectural guidance for complex features
- Help resolve merge conflicts and branch issues

### Code Review & Quality
- Suggest improvements to code structure and readability
- Identify potential security vulnerabilities
- Recommend performance optimizations
- Ensure proper error handling is implemented
- Validate that multi-tenant security is maintained

### Documentation & Learning
- Help create comprehensive code documentation
- Explain complex business logic and architectural decisions
- Provide examples of proper implementation patterns
- Suggest improvements to development workflow
- Help onboard new team members with code explanations

## Success Metrics

The project will be considered successful when:
- All tests are passing with >80% coverage
- All feature branches are successfully merged to main
- Performance benchmarks meet SLA requirements (< 2s page load)
- Security audit passes without critical findings
- Documentation is comprehensive and up-to-date
- New team members can onboard within 2 days

Remember: This is an enterprise-grade business intelligence platform that handles sensitive business data. Always prioritize security, performance, and reliability in all code suggestions and implementations.