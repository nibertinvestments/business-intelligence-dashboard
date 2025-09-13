import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD || '';
  
  if (password) {
    return `redis://:${password}@${host}:${port}`;
  }
  
  return `redis://${host}:${port}`;
};

const createRedisInstance = () => {
  try {
    const redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    return redis;
  } catch (error) {
    console.error('Failed to create Redis instance:', error);
    throw error;
  }
};

// Create Redis instance
export const redis = createRedisInstance();

// Cache helper functions
export class CacheService {
  private static instance: CacheService;
  private client: Redis;

  constructor() {
    this.client = redis;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set cache key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Failed to check cache key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Failed to flush cache:', error);
      return false;
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch and set
      const data = await fetcher();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Failed to get or set cache key ${key}:`, error);
      return null;
    }
  }

  // Generate cache keys
  static generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}

// Cache key constants
export const CACHE_KEYS = {
  DASHBOARD: (id: string) => CacheService.generateKey('dashboard', id),
  DASHBOARD_DATA: (id: string) => CacheService.generateKey('dashboard', id, 'data'),
  USER: (id: string) => CacheService.generateKey('user', id),
  ORGANIZATION: (id: string) => CacheService.generateKey('organization', id),
  WIDGET_DATA: (id: string) => CacheService.generateKey('widget', id, 'data'),
  ANALYTICS: (type: string, period: string) => CacheService.generateKey('analytics', type, period),
};

// TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes  
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
};

export default redis;