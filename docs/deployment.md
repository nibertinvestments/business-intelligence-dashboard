# Deployment Guide

This guide covers deploying the Business Intelligence Dashboard to various environments and cloud platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Database Setup](#database-setup)
- [Monitoring Setup](#monitoring-setup)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **CPU**: Minimum 2 cores, recommended 4+ cores
- **Memory**: Minimum 4GB RAM, recommended 8GB+ RAM
- **Storage**: Minimum 20GB, recommended 100GB+ SSD
- **Network**: Stable internet connection for external dependencies

### Required Services

- **PostgreSQL 15+**: Primary database
- **Redis 7+**: Session storage and caching
- **Node.js 20+**: Runtime environment

## Environment Configuration

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
SECRET_KEY=your-strong-secret-key-here
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database
REDIS_URL=redis://host:6379

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com

# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password

# New Relic Monitoring
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME=BI-Dashboard-Production

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-production-bucket
AWS_REGION=us-east-1

# External APIs
STRIPE_SECRET_KEY=your-production-stripe-key
SENDGRID_API_KEY=your-sendgrid-key

# Security
CORS_ORIGINS=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Configuration

```bash
# SSL/TLS Configuration
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/key.pem

# Security Headers
SECURITY_HEADERS_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true

# Database Security
DB_SSL_MODE=require
DB_SSL_CERT=/path/to/db/cert.pem
```

## Docker Deployment

### Single Container Deployment

1. **Build the Docker image:**

```bash
# Clone repository
git clone https://github.com/nibertinvestments/business-intelligence-dashboard.git
cd business-intelligence-dashboard

# Build production image
docker build -t bi-dashboard:latest .
```

2. **Run the container:**

```bash
docker run -d \
  --name bi-dashboard \
  -p 3000:3000 \
  --env-file .env.production \
  bi-dashboard:latest
```

### Docker Compose Deployment

Create a `docker-compose.prod.yml` file:

```yaml
version: '3.8'

services:
  app:
    image: bi-dashboard:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: bi_dashboard
      POSTGRES_USER: bi_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bi_user -d bi_dashboard"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

Deploy with Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Cloud Deployments

### AWS Deployment

#### Using AWS ECS

1. **Create ECS Cluster:**

```bash
aws ecs create-cluster --cluster-name bi-dashboard-cluster
```

2. **Create Task Definition:**

```json
{
  "family": "bi-dashboard-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "bi-dashboard",
      "image": "your-account.dkr.ecr.region.amazonaws.com/bi-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:bi-dashboard/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/bi-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

3. **Create ECS Service:**

```bash
aws ecs create-service \
  --cluster bi-dashboard-cluster \
  --service-name bi-dashboard-service \
  --task-definition bi-dashboard-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"
```

#### Using Elastic Beanstalk

1. **Create application:**

```bash
eb init -p node.js bi-dashboard
eb create production
eb deploy
```

2. **Configure environment variables:**

```bash
eb setenv NODE_ENV=production DATABASE_URL=your-database-url
```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name bi-dashboard-rg --location eastus

# Create container instance
az container create \
  --resource-group bi-dashboard-rg \
  --name bi-dashboard \
  --image your-registry.azurecr.io/bi-dashboard:latest \
  --cpu 2 \
  --memory 4 \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables DATABASE_URL=your-database-url
```

#### Using Azure Kubernetes Service (AKS)

1. **Create AKS cluster:**

```bash
az aks create \
  --resource-group bi-dashboard-rg \
  --name bi-dashboard-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys
```

2. **Deploy to AKS:**

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bi-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bi-dashboard
  template:
    metadata:
      labels:
        app: bi-dashboard
    spec:
      containers:
      - name: bi-dashboard
        image: your-registry.azurecr.io/bi-dashboard:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bi-dashboard-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: bi-dashboard-service
spec:
  selector:
    app: bi-dashboard
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Google Cloud Platform Deployment

#### Using Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT-ID/bi-dashboard

# Deploy to Cloud Run
gcloud run deploy bi-dashboard \
  --image gcr.io/PROJECT-ID/bi-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --memory 2Gi \
  --cpu 2
```

## Database Setup

### PostgreSQL Configuration

1. **Production Database Setup:**

```sql
-- Create database and user
CREATE DATABASE bi_dashboard;
CREATE USER bi_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE bi_dashboard TO bi_user;

-- Enable required extensions
\c bi_dashboard
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

2. **Run Migrations:**

```bash
# Set production database URL
export DATABASE_URL="postgresql://bi_user:password@host:5432/bi_dashboard"

# Run migrations
npm run db:migrate:deploy

# Seed initial data (optional)
npm run db:seed:production
```

3. **Database Backup Setup:**

```bash
# Create backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="bi_dashboard_backup_$DATE.sql"

pg_dump $DATABASE_URL > "$BACKUP_DIR/$FILENAME"
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "bi_dashboard_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup-database.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /path/to/backup-database.sh" | crontab -
```

## Monitoring Setup

### New Relic Configuration

1. **Install New Relic agent:**

```bash
npm install newrelic
```

2. **Create newrelic.js configuration:**

```javascript
'use strict'

exports.config = {
  app_name: ['BI Dashboard Production'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
```

### Health Checks

Create health check endpoints:

```typescript
// pages/api/health.ts
export default function handler(req: Request, res: Response) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
}

// pages/api/health/database.ts
export default async function handler(req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
}
```

## Security Configuration

### SSL/TLS Setup

1. **Obtain SSL certificates:**

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. **Configure Nginx for SSL:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## Performance Optimization

### Application-Level Optimizations

1. **Enable compression:**

```javascript
// middleware/compression.js
import compression from 'compression';

export default compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});
```

2. **Configure caching:**

```javascript
// Cache configuration
const cacheConfig = {
  ttl: 3600, // 1 hour
  max: 1000, // Maximum items in cache
  updateAgeOnGet: true
};
```

### Database Optimizations

```sql
-- Create indexes for better query performance
CREATE INDEX CONCURRENTLY idx_dashboards_tenant_id ON dashboards(tenant_id);
CREATE INDEX CONCURRENTLY idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX CONCURRENTLY idx_analytics_data_timestamp ON analytics_data(timestamp);

-- Configure PostgreSQL for production
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
max_connections = 100
```

## Troubleshooting

### Common Issues

1. **Application won't start:**

```bash
# Check logs
docker logs bi-dashboard

# Check environment variables
env | grep -E "(DATABASE_URL|REDIS_URL|NODE_ENV)"

# Test database connection
npm run db:status
```

2. **Database connection issues:**

```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

3. **Memory issues:**

```bash
# Monitor memory usage
free -h
top -p $(pidof node)

# Increase container memory limits
docker update --memory=4g bi-dashboard
```

### Logs and Debugging

```bash
# Application logs
docker logs -f bi-dashboard

# Database logs
sudo journalctl -u postgresql -f

# System logs
sudo journalctl -f
```

### Performance Monitoring

```bash
# Monitor CPU and memory
htop

# Monitor disk I/O
iotop

# Monitor network
nethogs

# Check application metrics
curl http://localhost:3000/api/metrics
```