# Business Intelligence Dashboard - Environment Setup Guide

## Quick Setup Instructions

### 1. Copy Environment Template
```bash
cp .env.example .env.local
```

### 2. Configure Database
Update the DATABASE_URL in .env.local:
```
DATABASE_URL=postgresql://username:password@localhost:5432/bi_dashboard_dev
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## Production Environment Variables

For production deployment, ensure these are set:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
SECRET_KEY=your-strong-production-secret-key

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
NEXTAUTH_SECRET=your-nextauth-production-secret
NEXTAUTH_URL=https://your-domain.com

# Optional: Redis for caching
REDIS_URL=redis://your-redis-host:6379

# Optional: New Relic monitoring
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME=BI-Dashboard-Production
```

## Default Credentials

After seeding, use these credentials to login:

- **Admin**: admin@example.com / admin123
- **Demo User**: demo@example.com / demo123

## Security Notes

1. **Change default passwords** in production
2. **Use strong SECRET_KEY** and **NEXTAUTH_SECRET**
3. **Configure firewall** rules for database access
4. **Enable SSL/TLS** for database connections
5. **Use environment-specific** database credentials

## Docker Setup (Alternative)

```bash
# Start database
docker run --name bi-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:15

# Run application
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d bi_dashboard_dev
```

### Migration Issues
```bash
# Reset database (WARNING: destroys data)
npm run db:migrate:reset

# Check migration status
npm run db:status
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clean install
rm -rf node_modules package-lock.json
npm install
```