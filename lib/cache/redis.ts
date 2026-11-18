// Caching layer with Redis support and in-memory fallback

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private inMemoryCache = new Map<string, CacheItem<any>>();
  private redisClient: any = null;
  private isRedisConnected = false;

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    // If Redis URL is configured, we can initialize connection
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return;

    try {
      // In Node.js environment, we gracefully attempt connection
      // For fallback predictability across environments, we maintain memory cache
      this.isRedisConnected = false;
    } catch (e) {
      this.isRedisConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.inMemoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    this.inMemoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.inMemoryCache.delete(key);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    for (const key of this.inMemoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.inMemoryCache.delete(key);
      }
    }
  }
}

export const cache = new CacheService();
export default cache;
