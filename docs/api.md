# API Documentation

## Overview

The Business Intelligence Dashboard provides a comprehensive RESTful API for managing dashboards, analytics data, and user interactions. The API is currently in development mode using mock data.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

**Note:** Authentication is currently being implemented. All endpoints are temporarily accessible without authentication for development purposes.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field that caused the error"
  }
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Endpoints

## Available Endpoints

### Health Check

#### System Health
```http
GET /api/health
```

Returns the current system health status and information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-13T22:20:35.749Z",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 16.848162195,
  "database": {
    "status": "healthy",
    "timestamp": "2025-09-13T22:20:35.749Z"
  },
  "services": {
    "api": "healthy",
    "redis": "healthy"
  }
}
```

### Dashboards

#### List Dashboards
```http
GET /api/dashboards
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Sales Dashboard",
      "description": "Overview of sales metrics",
      "config": {},
      "isPublic": false,
      "organizationId": "org-1",
      "createdById": "user-1",
      "createdAt": "2025-09-13T22:20:41.615Z",
      "updatedAt": "2025-09-13T22:20:41.615Z",
      "createdBy": {
        "id": "user-1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "organization": {
        "id": "org-1",
        "name": "Example Company"
      },
      "widgets": [
        {
          "id": "widget-1",
          "title": "Revenue Chart",
          "type": "CHART_LINE"
        }
      ]
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Create Dashboard
```http
POST /api/dashboards
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "string (required, max 255 chars)",
  "description": "string (optional)",
  "config": "object (optional)",
  "isPublic": "boolean (optional, default: false)"
}
```

**Example Request:**
```json
{
  "title": "Test Dashboard",
  "description": "A test dashboard",
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1757802278308",
    "title": "Test Dashboard",
    "description": "A test dashboard",
    "isPublic": false,
    "createdById": "user-1",
    "organizationId": "org-1",
    "createdAt": "2025-09-13T22:24:38.308Z",
    "updatedAt": "2025-09-13T22:24:38.308Z",
    "createdBy": {
      "id": "user-1",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "organization": {
      "id": "org-1",
      "name": "Example Company"
    }
  }
}
```

### Authentication (Coming Soon)

Authentication endpoints will be available in the next release:

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Dashboards

#### List Dashboards
```http
GET /api/dashboards
```

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search term for dashboard title
- `sortBy` (string, optional): Sort field (title, createdAt, updatedAt)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "dashboards": [
      {
        "id": "dashboard-id",
        "title": "Dashboard Title",
        "description": "Dashboard description",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "widgets": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### Get Dashboard
```http
GET /api/dashboards/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "dashboard-id",
    "title": "Dashboard Title",
    "description": "Dashboard description",
    "layout": {
      "cols": 12,
      "rows": 10
    },
    "widgets": [
      {
        "id": "widget-id",
        "type": "chart",
        "title": "Widget Title",
        "position": {
          "x": 0,
          "y": 0,
          "w": 6,
          "h": 4
        },
        "config": {
          "chartType": "line",
          "dataSource": "data-source-id"
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Dashboard
```http
POST /api/dashboards
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "layout": {
    "cols": 12,
    "rows": 10
  }
}
```

#### Update Dashboard
```http
PUT /api/dashboards/{id}
```

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "layout": {
    "cols": 12,
    "rows": 10
  }
}
```

#### Delete Dashboard
```http
DELETE /api/dashboards/{id}
```

### Widgets

#### Add Widget to Dashboard
```http
POST /api/dashboards/{dashboardId}/widgets
```

**Request Body:**
```json
{
  "type": "chart|table|metric|text",
  "title": "string",
  "position": {
    "x": 0,
    "y": 0,
    "w": 6,
    "h": 4
  },
  "config": {
    "chartType": "line|bar|pie|area",
    "dataSourceId": "string",
    "query": "string",
    "options": {}
  }
}
```

#### Update Widget
```http
PUT /api/widgets/{id}
```

#### Delete Widget
```http
DELETE /api/widgets/{id}
```

### Data Sources

#### List Data Sources
```http
GET /api/data-sources
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "data-source-id",
      "name": "Database Connection",
      "type": "postgresql|mysql|api|csv",
      "status": "connected|disconnected|error",
      "config": {
        "host": "localhost",
        "database": "analytics_db"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Data Source
```http
POST /api/data-sources
```

**Request Body:**
```json
{
  "name": "string",
  "type": "postgresql|mysql|api|csv",
  "config": {
    "host": "string",
    "port": "number",
    "database": "string",
    "username": "string",
    "password": "string"
  }
}
```

#### Test Data Source Connection
```http
POST /api/data-sources/{id}/test
```

### Analytics Data

#### Query Data
```http
POST /api/analytics/query
```

**Request Body:**
```json
{
  "dataSourceId": "string",
  "query": "SELECT * FROM table",
  "parameters": {},
  "limit": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "columns": ["column1", "column2"],
    "rows": [
      ["value1", "value2"],
      ["value3", "value4"]
    ],
    "metadata": {
      "totalRows": 2,
      "executionTime": 150
    }
  }
}
```

#### Get Chart Data
```http
GET /api/analytics/chart-data/{widgetId}
```

**Query Parameters:**
- `startDate` (string, optional): Start date filter (ISO 8601)
- `endDate` (string, optional): End date filter (ISO 8601)
- `filters` (object, optional): Additional filters

### Users & Organizations

#### Get Current User
```http
GET /api/users/me
```

#### Update User Profile
```http
PUT /api/users/me
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "preferences": {
    "theme": "light|dark",
    "timezone": "string"
  }
}
```

#### List Organization Members
```http
GET /api/organizations/members
```

#### Invite User to Organization
```http
POST /api/organizations/invites
```

**Request Body:**
```json
{
  "email": "string",
  "role": "admin|editor|viewer"
}
```

## WebSocket API

For real-time updates, connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/ws');

// Subscribe to dashboard updates
ws.send(JSON.stringify({
  type: 'subscribe',
  resource: 'dashboard',
  id: 'dashboard-id'
}));

// Listen for updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'dashboard_update') {
    // Handle dashboard update
  }
};
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Data query endpoints**: 100 requests per hour per user
- **General endpoints**: 1000 requests per hour per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## SDKs and Examples

### JavaScript/TypeScript SDK

```javascript
import { BIDashboardClient } from '@nibertinvestments/bi-dashboard-sdk';

const client = new BIDashboardClient({
  baseURL: 'https://your-domain.com/api',
  token: 'your-jwt-token'
});

// List dashboards
const dashboards = await client.dashboards.list();

// Create dashboard
const dashboard = await client.dashboards.create({
  title: 'My Dashboard',
  description: 'Dashboard description'
});

// Query data
const data = await client.analytics.query({
  dataSourceId: 'source-id',
  query: 'SELECT * FROM sales'
});
```

### Python SDK

```python
from bi_dashboard import Client

client = Client(
    base_url='https://your-domain.com/api',
    token='your-jwt-token'
)

# List dashboards
dashboards = client.dashboards.list()

# Create dashboard
dashboard = client.dashboards.create(
    title='My Dashboard',
    description='Dashboard description'
)

# Query data
data = client.analytics.query(
    data_source_id='source-id',
    query='SELECT * FROM sales'
)
```

## Changelog

### v1.0.0
- Initial API release
- Dashboard CRUD operations
- Widget management
- Data source connections
- Analytics queries
- Authentication and authorization
- Real-time updates via WebSocket