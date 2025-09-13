// Base types for the application
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string | null;
  config: any;
  isPublic: boolean;
  organizationId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Widget {
  id: string;
  title: string;
  type: string;
  config: any;
  position: any;
  dashboardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: any;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  title: string;
  description?: string | null;
  query: string;
  config: any;
  schedule?: string | null;
  isActive: boolean;
  dataSourceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relations
export interface UserWithOrganization extends User {
  organization?: Organization;
}

export interface DashboardWithWidgets extends Dashboard {
  widgets: Widget[];
  createdBy: User;
  organization: Organization;
}

export interface WidgetWithDashboard extends Widget {
  dashboard: Dashboard;
}

export interface DataSourceWithReports extends DataSource {
  reports: Report[];
  organization: Organization;
}

export interface ReportWithDataSource extends Report {
  dataSource: DataSource;
  createdBy: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Dashboard types
export interface DashboardConfig {
  layout: LayoutConfig[];
  theme: ThemeConfig;
  filters: FilterConfig[];
  refreshInterval?: number;
}

export interface LayoutConfig {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
}

export interface FilterConfig {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'range' | 'search';
  options?: FilterOption[];
  defaultValue?: any;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

// Widget types
export interface WidgetConfig {
  chartType?: ChartType;
  dataConfig: DataConfig;
  styleConfig: StyleConfig;
  interactionConfig?: InteractionConfig;
}

export interface DataConfig {
  query: string;
  dataSourceId: string;
  refreshInterval?: number;
  columns: ColumnConfig[];
  aggregations?: AggregationConfig[];
}

export interface ColumnConfig {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  format?: string;
  alias?: string;
}

export interface AggregationConfig {
  column: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface StyleConfig {
  colors?: string[];
  fontSize?: number;
  fontFamily?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

export interface InteractionConfig {
  clickable?: boolean;
  drillDown?: DrillDownConfig;
  tooltip?: TooltipConfig;
}

export interface DrillDownConfig {
  enabled: boolean;
  targetDashboard?: string;
  parameters?: Record<string, string>;
}

export interface TooltipConfig {
  enabled: boolean;
  format?: string;
  fields?: string[];
}

// Chart types
export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'bubble'
  | 'radar'
  | 'polar'
  | 'histogram';

// Data Source types
export interface DataSourceConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  apiUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  queryTimeout?: number;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
    idle: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}

// Analytics types
export interface AnalyticsData {
  labels: string[];
  datasets: AnalyticsDataset[];
}

export interface AnalyticsDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface KPIData {
  value: number;
  label: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  trend?: number[];
}

// Form types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  reports: boolean;
  alerts: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface DashboardSettings {
  defaultRefreshInterval: number;
  autoSave: boolean;
  gridSnap: boolean;
  showGrid: boolean;
}

// Export all Prisma types
export * from '@prisma/client';