# Business Intelligence Dashboard

<div align="center">

![Business Intelligence Dashboard](https://img.shields.io/badge/BI-Dashboard-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![New Relic](https://img.shields.io/badge/New%20Relic-008C99?logo=newrelic&logoColor=white)

🚀 **Professional Business Intelligence Dashboard** - A comprehensive SaaS Analytics Platform with real-time data visualization, multi-tenant architecture, and enterprise-grade monitoring.

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Support](#support)

## 🔍 Overview

The Business Intelligence Dashboard is a modern, scalable SaaS platform designed for enterprise-level data analytics and visualization. Built with cutting-edge technologies, it provides real-time insights, customizable dashboards, and robust data processing capabilities.

### Key Capabilities

- **Real-time Data Visualization**: Interactive charts, graphs, and KPI displays
- **Multi-tenant Architecture**: Secure data isolation for multiple organizations
- **Advanced Analytics**: Statistical analysis, predictive modeling, and trend analysis
- **Custom Dashboards**: Drag-and-drop dashboard builder with customizable widgets
- **Enterprise Security**: Role-based access control, SSO integration, and data encryption
- **API-First Design**: RESTful APIs with comprehensive documentation
- **Performance Monitoring**: Integrated New Relic monitoring and alerting

## ✨ Features

### Core Features
- 📊 **Interactive Dashboards**: Create custom dashboards with drag-and-drop interface
- 📈 **Real-time Analytics**: Live data streaming and real-time chart updates
- 🔐 **Enterprise Security**: Multi-factor authentication, RBAC, and audit logging
- 🏢 **Multi-tenancy**: Complete data isolation between organizations
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🚀 **High Performance**: Optimized queries and caching for fast data retrieval

### Advanced Features
- 🤖 **AI-Powered Insights**: Machine learning models for predictive analytics
- 📊 **Custom Reports**: Automated report generation and scheduling
- 🔗 **Data Connectors**: Integration with popular data sources (SQL, NoSQL, APIs)
- 📧 **Alerts & Notifications**: Configurable alerts via email, Slack, or webhooks
- 🎨 **White-label Solutions**: Customizable branding for reseller partners
- 📈 **Usage Analytics**: Track user engagement and system performance

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: React 18 with Hooks
- **Styling**: Tailwind CSS + Headless UI
- **Charts**: Chart.js, D3.js, Recharts
- **State Management**: Zustand / Redux Toolkit

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js / Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Caching**: Redis
- **Authentication**: NextAuth.js / Auth0
- **File Storage**: AWS S3 / Azure Blob Storage

### Infrastructure & DevOps
- **Monitoring**: New Relic APM
- **Logging**: Winston + ELK Stack
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Cloud**: AWS / Azure / GCP

### Development Tools
- **Package Manager**: npm / yarn
- **Code Quality**: ESLint, Prettier, Husky
- **Testing**: Jest, Cypress, Playwright
- **Documentation**: TypeDoc, Storybook

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 9.0.0 or higher (or yarn 3.0.0+)
- **PostgreSQL**: Version 15.0 or higher
- **Redis**: Version 7.0 or higher (for caching)
- **Git**: Latest version
- **Docker**: Version 24.0+ (optional, for containerized development)

### System Requirements
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: At least 10GB free space
- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# Clone the repository
git clone https://github.com/nibertinvestments/business-intelligence-dashboard.git
cd business-intelligence-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

**Demo Credentials:**
- Admin: `admin@example.com` / `admin123`
- Demo User: `demo@example.com` / `demo123`

## 📦 Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nibertinvestments/business-intelligence-dashboard.git
   cd business-intelligence-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit the environment file
   nano .env.local
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL (if using Docker)
   docker run --name bi-postgres -e POSTGRES_PASSWORD=yourpassword -d -p 5432:5432 postgres:15
   
   # Run database migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Setup

For production deployment, see our [Deployment Guide](docs/deployment.md).

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bi_dashboard
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# New Relic Monitoring
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key
NEW_RELIC_APP_NAME=BI-Dashboard

# External APIs
STRIPE_SECRET_KEY=your-stripe-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key

# Cloud Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
```

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Configuration is handled through the `DATABASE_URL` environment variable.

## 🎯 Usage

### Creating Your First Dashboard

1. **Sign up** for an account at `/auth/signup`
2. **Create an organization** or join an existing one
3. **Connect data sources** in the Data Sources section
4. **Build dashboards** using the drag-and-drop dashboard builder
5. **Share and collaborate** with team members

### API Usage

The platform provides RESTful APIs for all major operations:

```javascript
// Example: Fetch dashboard data
const response = await fetch('/api/dashboards/123/data', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

For complete API documentation, visit `/api/docs` when running the application.

## 📚 API Documentation

### Authentication

All API requests require authentication via JWT tokens:

```bash
curl -X GET "http://localhost:3000/api/dashboards" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Key Endpoints

- `GET /api/dashboards` - List all dashboards
- `POST /api/dashboards` - Create a new dashboard
- `GET /api/dashboards/{id}` - Get dashboard details
- `PUT /api/dashboards/{id}` - Update dashboard
- `DELETE /api/dashboards/{id}` - Delete dashboard
- `GET /api/analytics/data` - Fetch analytics data
- `POST /api/data-sources` - Connect new data source

For complete API documentation, see [API Documentation](docs/api.md).

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and fixtures
```

### Writing Tests

Follow our [Testing Guidelines](docs/testing.md) for best practices.

## 🚀 Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t bi-dashboard .

# Run with Docker Compose
docker-compose up -d
```

### Cloud Deployment

We support deployment to major cloud platforms:

- **AWS**: ECS, EKS, or Elastic Beanstalk
- **Azure**: Container Instances or AKS
- **GCP**: Cloud Run or GKE
- **Vercel**: For frontend deployment

See our [Deployment Guide](docs/deployment.md) for detailed instructions.

## 📊 Monitoring

The application includes comprehensive monitoring with New Relic:

- **Application Performance Monitoring (APM)**
- **Real User Monitoring (RUM)**
- **Infrastructure Monitoring**
- **Synthetic Monitoring**
- **Custom Dashboards and Alerts**

Monitor your application at: [New Relic Dashboard](https://one.newrelic.com/)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

We use ESLint and Prettier for code formatting. Run `npm run lint` to check your code.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Reset database
npm run db:reset
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Node Version Issues**
```bash
# Use Node Version Manager
nvm install 20
nvm use 20
```

For more troubleshooting tips, see our [Troubleshooting Guide](docs/troubleshooting.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/nibertinvestments/business-intelligence-dashboard/wiki)
- **Issues**: [GitHub Issues](https://github.com/nibertinvestments/business-intelligence-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nibertinvestments/business-intelligence-dashboard/discussions)
- **Email**: support@nibertinvestments.com

---

<div align="center">

**[⬆ Back to Top](#business-intelligence-dashboard)**

Made with ❤️ by [Nibert Investments](https://github.com/nibertinvestments)

</div>
