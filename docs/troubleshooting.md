# Troubleshooting Guide

This guide helps you diagnose and resolve common issues in the Business Intelligence Dashboard.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Issues](#common-issues)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [Performance Issues](#performance-issues)
- [Frontend Issues](#frontend-issues)
- [API Issues](#api-issues)
- [Deployment Issues](#deployment-issues)
- [Monitoring and Logs](#monitoring-and-logs)
- [Getting Help](#getting-help)

## Quick Diagnostics

### Health Check Commands

Run these commands to quickly check system health:

```bash
# Check application health
curl -f http://localhost:3000/api/health || echo "App health check failed"

# Check database connectivity
npm run db:status

# Check Redis connectivity
redis-cli ping

# Check environment variables
npm run env:check

# Check dependencies
npm run check:deps

# Run system diagnostics
npm run diagnostics
```

### System Information

```bash
# Node.js version
node --version

# npm version
npm --version

# Check available memory
free -h

# Check disk space
df -h

# Check running processes
ps aux | grep node

# Check port usage
netstat -tulpn | grep :3000
```

## Common Issues

### Application Won't Start

**Symptoms:**
- Server crashes on startup
- Port already in use errors
- Module not found errors

**Diagnosis:**
```bash
# Check if port is in use
lsof -i :3000

# Check Node.js version
node --version

# Check for missing dependencies
npm list --depth=0

# Check environment variables
env | grep -E "(NODE_ENV|DATABASE_URL|REDIS_URL)"
```

**Solutions:**

1. **Port in use:**
```bash
# Kill process using port 3000
kill -9 $(lsof -t -i:3000)

# Or use different port
PORT=3001 npm run dev
```

2. **Missing dependencies:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

3. **Environment variables:**
```bash
# Copy environment template
cp .env.example .env.local

# Edit with correct values
nano .env.local
```

### Module Resolution Issues

**Symptoms:**
- "Cannot find module" errors
- Import/export errors
- TypeScript compilation errors

**Solutions:**

1. **Clear Next.js cache:**
```bash
rm -rf .next
npm run build
```

2. **Check TypeScript configuration:**
```bash
# Validate tsconfig.json
npx tsc --noEmit

# Check TypeScript version
npx tsc --version
```

3. **Verify import paths:**
```typescript
// Use absolute imports from project root
import { Dashboard } from '@/components/Dashboard';

// Instead of relative imports
import { Dashboard } from '../../../components/Dashboard';
```

## Database Issues

### Connection Problems

**Symptoms:**
- "Connection refused" errors
- Database timeout errors
- Authentication failures

**Diagnosis:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Verify database URL format
echo $DATABASE_URL
```

**Solutions:**

1. **Start PostgreSQL:**
```bash
# On Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# On macOS with Homebrew
brew services start postgresql
```

2. **Fix connection string:**
```bash
# Correct format
DATABASE_URL="postgresql://username:password@host:port/database"

# Common issues
# - Missing password encoding for special characters
# - Wrong host (localhost vs 127.0.0.1)
# - Incorrect port (default is 5432)
```

3. **Database permissions:**
```sql
-- Grant permissions to user
GRANT ALL PRIVILEGES ON DATABASE bi_dashboard TO bi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bi_user;
```

### Migration Issues

**Symptoms:**
- Migration failures
- Schema out of sync
- Prisma client errors

**Diagnosis:**
```bash
# Check migration status
npx prisma migrate status

# Generate Prisma client
npx prisma generate

# Check database schema
npx prisma db pull
```

**Solutions:**

1. **Reset database (development only):**
```bash
npx prisma migrate reset
npx prisma db seed
```

2. **Fix failed migrations:**
```bash
# Mark migration as applied
npx prisma migrate resolve --applied 20240101000000_migration_name

# Or rollback and reapply
npx prisma migrate reset
npx prisma migrate deploy
```

3. **Update Prisma client:**
```bash
npx prisma generate
npm run build
```

### Performance Issues

**Symptoms:**
- Slow query execution
- Database timeouts
- High CPU usage

**Diagnosis:**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Solutions:**

1. **Add database indexes:**
```sql
-- Add indexes for frequent queries
CREATE INDEX CONCURRENTLY idx_dashboards_tenant_id ON dashboards(tenant_id);
CREATE INDEX CONCURRENTLY idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX CONCURRENTLY idx_analytics_timestamp ON analytics_data(timestamp);
```

2. **Optimize connection pooling:**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Add connection pooling
  connectionLimit = 10
}
```

3. **Query optimization:**
```typescript
// Use select to limit fields
const dashboards = await prisma.dashboard.findMany({
  select: {
    id: true,
    title: true,
    createdAt: true,
  },
  where: { tenantId },
});

// Use pagination for large datasets
const dashboards = await prisma.dashboard.findMany({
  take: 20,
  skip: (page - 1) * 20,
  where: { tenantId },
});
```

## Authentication Problems

### JWT Token Issues

**Symptoms:**
- "Invalid token" errors
- Automatic logouts
- Authentication failures

**Diagnosis:**
```bash
# Decode JWT token (without verification)
echo "JWT_TOKEN" | base64 -d

# Check token expiration
node -e "console.log(new Date(JSON.parse(Buffer.from('JWT_PAYLOAD'.split('.')[1], 'base64')).exp * 1000))"

# Verify NextAuth configuration
npm run dev -- --inspect
```

**Solutions:**

1. **Check JWT secret:**
```bash
# Ensure NEXTAUTH_SECRET is set and consistent
echo $NEXTAUTH_SECRET

# Generate new secret if needed
openssl rand -base64 32
```

2. **Update token expiration:**
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

3. **Clear stored tokens:**
```bash
# Clear localStorage in browser
localStorage.clear();

# Clear session cookies
# (Browser dev tools > Application > Storage)
```

### Session Management

**Symptoms:**
- Users logged out unexpectedly
- Session data not persisting
- Redis connection errors

**Solutions:**

1. **Check Redis configuration:**
```bash
# Test Redis connection
redis-cli ping

# Check Redis memory usage
redis-cli info memory

# Monitor Redis logs
redis-cli monitor
```

2. **Configure session storage:**
```typescript
// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});
```

## Performance Issues

### Slow Page Loading

**Symptoms:**
- Pages take >3 seconds to load
- High Time to First Byte (TTFB)
- Slow API responses

**Diagnosis:**
```bash
# Check page performance
npm run lighthouse

# Profile API responses
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/dashboards"

# Monitor memory usage
node --inspect npm run dev
```

**Solutions:**

1. **Enable caching:**
```typescript
// lib/cache.ts
import { redis } from './redis';

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

2. **Optimize database queries:**
```typescript
// Use includes instead of separate queries
const dashboard = await prisma.dashboard.findUnique({
  where: { id, tenantId },
  include: {
    widgets: {
      include: {
        dataSource: true
      }
    }
  }
});
```

3. **Implement pagination:**
```typescript
// API route with pagination
export default async function handler(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const [dashboards, total] = await Promise.all([
    prisma.dashboard.findMany({
      take: limit,
      skip,
      where: { tenantId },
    }),
    prisma.dashboard.count({ where: { tenantId } }),
  ]);

  res.json({
    data: dashboards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### Memory Leaks

**Symptoms:**
- Gradually increasing memory usage
- Application crashes with out-of-memory errors
- Poor garbage collection

**Solutions:**

1. **Profile memory usage:**
```bash
# Run with memory profiling
node --inspect --max-old-space-size=4096 npm run dev

# Generate heap snapshots
node --heapsnapshot-signal=SIGUSR2 npm run dev
```

2. **Fix common memory leaks:**
```typescript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Clean up intervals/timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // Update data
  }, 5000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

## Frontend Issues

### React Hydration Errors

**Symptoms:**
- "Hydration failed" errors
- Content mismatch between server and client
- Console warnings about hydration

**Solutions:**

1. **Fix hydration mismatches:**
```typescript
// Use useEffect for client-only content
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <div>Loading...</div>;
}

return <ClientOnlyComponent />;
```

2. **Suppress hydration warnings (last resort):**
```typescript
<div suppressHydrationWarning={true}>
  {new Date().toLocaleString()}
</div>
```

### Chart Rendering Issues

**Symptoms:**
- Charts not displaying
- Incorrect data visualization
- Performance problems with large datasets

**Solutions:**

1. **Debug chart data:**
```typescript
// Add debug logging
console.log('Chart data:', chartData);
console.log('Chart config:', chartConfig);

// Validate data format
const isValidData = chartData.every(item => 
  typeof item.value === 'number' && item.label
);
```

2. **Optimize large datasets:**
```typescript
// Sample data for large datasets
const sampleData = useMemo(() => {
  if (data.length > 1000) {
    const step = Math.ceil(data.length / 1000);
    return data.filter((_, index) => index % step === 0);
  }
  return data;
}, [data]);
```

### State Management Issues

**Symptoms:**
- State not updating
- Stale data in components
- Race conditions

**Solutions:**

1. **Use proper dependency arrays:**
```typescript
// Include all dependencies
useEffect(() => {
  fetchData(userId, filters);
}, [userId, filters]); // Don't forget dependencies

// Use useCallback for stable references
const handleClick = useCallback(() => {
  onUpdate(data);
}, [onUpdate, data]);
```

2. **Handle async state properly:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await api.getData();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## API Issues

### CORS Errors

**Symptoms:**
- "CORS policy" errors in browser
- API calls failing from frontend
- Preflight request failures

**Solutions:**

1. **Configure CORS properly:**
```typescript
// middleware/cors.ts
import Cors from 'cors';

const cors = Cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export default cors;
```

2. **Handle preflight requests:**
```typescript
// pages/api/dashboards.ts
export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle actual request
}
```

### Rate Limiting Issues

**Symptoms:**
- "Too Many Requests" errors
- API calls being blocked
- Legitimate users affected

**Solutions:**

1. **Configure rate limiting:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': reset,
    },
  };
}
```

2. **Implement retry logic:**
```typescript
// lib/api-client.ts
async function apiCall(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = response.headers.get('Retry-After');
        await new Promise(resolve => 
          setTimeout(resolve, (retryAfter ? parseInt(retryAfter) : 1) * 1000)
        );
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

## Deployment Issues

### Docker Build Failures

**Symptoms:**
- Docker build process fails
- Image size too large
- Runtime errors in container

**Solutions:**

1. **Optimize Dockerfile:**
```dockerfile
# Use multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

2. **Fix build context:**
```bash
# Use .dockerignore
echo "node_modules
.git
.next
coverage
*.log" > .dockerignore

# Build with specific context
docker build -t bi-dashboard .
```

### Environment Variable Issues

**Symptoms:**
- Configuration not loading
- Features not working in production
- API connections failing

**Solutions:**

1. **Validate environment variables:**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'REDIS_URL',
] as const;

export function validateEnv() {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
```

2. **Use environment-specific configs:**
```bash
# .env.development
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/bi_dev

# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://prod-host:5432/bi_prod
```

## Monitoring and Logs

### Log Analysis

**Common log patterns to check:**

```bash
# Application errors
grep -i "error" logs/app.log | tail -20

# Database connection issues
grep -i "connection" logs/app.log | grep -i "error"

# Authentication failures
grep -i "auth" logs/app.log | grep -i "fail"

# Performance issues
grep -i "slow" logs/app.log | tail -10

# Memory issues
grep -i "memory\|heap" logs/app.log | tail -10
```

### New Relic Troubleshooting

**Check New Relic dashboard for:**

1. **Error Rate**: Sudden spikes in error rate
2. **Response Time**: Slow endpoints or database queries
3. **Throughput**: Traffic patterns and bottlenecks
4. **Apdex Score**: User satisfaction metrics

**Common New Relic issues:**

```bash
# Verify New Relic agent
curl -H "Api-Key: YOUR_API_KEY" \
  "https://api.newrelic.com/v2/applications.json"

# Check agent logs
tail -f logs/newrelic_agent.log

# Validate configuration
node -e "console.log(require('./newrelic.js'))"
```

## Getting Help

### Before Asking for Help

1. **Check the logs** for error messages
2. **Search existing issues** on GitHub
3. **Try the solutions** in this guide
4. **Gather system information** (versions, environment, etc.)

### How to Report Issues

Create a GitHub issue with:

1. **Clear description** of the problem
2. **Steps to reproduce** the issue
3. **Expected vs actual behavior**
4. **Environment details** (OS, Node.js version, etc.)
5. **Relevant logs or error messages**
6. **Screenshots or videos** if applicable

### Issue Template

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

**Environment:**
- OS: [e.g. Ubuntu 20.04]
- Node.js version: [e.g. 20.5.0]
- npm version: [e.g. 9.8.0]
- Browser: [e.g. Chrome 115]

**Logs**
```
paste relevant logs here
```

**Additional context**
Add any other context about the problem here.
```

### Community Resources

- **GitHub Discussions**: Ask questions and share ideas
- **Discord Server**: Real-time community support
- **Stack Overflow**: Technical questions with `bi-dashboard` tag
- **Documentation**: Comprehensive guides and API reference

Remember: The more information you provide, the faster we can help you resolve the issue!