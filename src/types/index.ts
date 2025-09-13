import { User, Tenant, Dashboard, Widget, DataSource } from '@prisma/client'

// Extended types with relations
export interface UserWithTenant extends User {
  tenant: Tenant
}

export interface DashboardWithWidgets extends Dashboard {
  widgets: Widget[]
  user: User
}

export interface WidgetWithDataSource extends Widget {
  dataSource?: DataSource
}

export interface TenantWithUsers extends Tenant {
  users: User[]
  dashboards: Dashboard[]
  dataSources: DataSource[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Layout types
export interface GridLayout {
  cols: number
  rows: number
  gridGap?: number
}

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

// Chart configuration types
export interface ChartConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  xAxis?: string
  yAxis?: string | string[]
  colors?: string[]
  legend?: boolean
  grid?: boolean
  zoom?: boolean
}

export interface MetricConfig {
  metric: string
  format: 'number' | 'currency' | 'percentage'
  prefix?: string
  suffix?: string
  decimals?: number
  trend?: boolean
}

export interface TableConfig {
  columns: string[]
  sortable?: boolean
  searchable?: boolean
  pagination?: boolean
  pageSize?: number
}

// Data Source types
export interface DataSourceConfig {
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  url?: string
  apiKey?: string
  headers?: Record<string, string>
  timeout?: number
}

export interface QueryResult {
  columns: string[]
  rows: any[][]
  metadata: {
    totalRows: number
    executionTime: number
  }
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  tenantName?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  image?: string
}

// Form types
export interface DashboardFormData {
  title: string
  description?: string
  isPublic?: boolean
  layout?: GridLayout
  settings?: Record<string, any>
}

export interface WidgetFormData {
  type: string
  title: string
  position: WidgetPosition
  config: ChartConfig | MetricConfig | TableConfig
  dataSourceId?: string
}

export interface DataSourceFormData {
  name: string
  type: string
  config: DataSourceConfig
}

// Filter and search types
export interface DashboardFilters {
  search?: string
  userId?: string
  isPublic?: boolean
  sortBy?: 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface DataSourceFilters {
  search?: string
  type?: string
  status?: string
  sortBy?: 'name' | 'type' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Component props types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Store types (Zustand)
export interface AuthStore {
  user: AuthUser | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
}

export interface DashboardStore {
  dashboards: Dashboard[]
  currentDashboard: DashboardWithWidgets | null
  isLoading: boolean
  fetchDashboards: (filters?: DashboardFilters) => Promise<void>
  fetchDashboard: (id: string) => Promise<void>
  createDashboard: (data: DashboardFormData) => Promise<Dashboard>
  updateDashboard: (id: string, data: Partial<DashboardFormData>) => Promise<void>
  deleteDashboard: (id: string) => Promise<void>
}

export interface WidgetStore {
  widgets: Widget[]
  isLoading: boolean
  addWidget: (dashboardId: string, data: WidgetFormData) => Promise<Widget>
  updateWidget: (id: string, data: Partial<WidgetFormData>) => Promise<void>
  deleteWidget: (id: string) => Promise<void>
  moveWidget: (id: string, position: WidgetPosition) => Promise<void>
}

// Theme types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    muted: string
  }
}

// WebSocket types
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
}

export interface DashboardUpdate {
  dashboardId: string
  type: 'widget_added' | 'widget_updated' | 'widget_deleted' | 'dashboard_updated'
  data: any
}