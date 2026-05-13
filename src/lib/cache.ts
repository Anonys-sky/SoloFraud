/**
 * ScamShield Intelligent Caching Layer (DISABLED)
 * ───────────────────────────────────────────────
 * Caching has been disabled as per user request to ensure system stability.
 * Previously: LRU-based in-memory cache with TTL expiration.
 */

interface CacheMetrics {
  totalHits: number;
  totalMisses: number;
  totalEntries: number;
  hitRate: number;
  oldestEntryAge: number;
  estimatedSavings: number;
}

class LRUCache<T> {
  constructor(maxSize: number = 200, defaultTTLSeconds: number = 300) {
    // No-op
  }

  static hashKey(content: string): string {
    return "disabled";
  }

  get(key: string): T | null {
    return null; // Always miss
  }

  set(key: string, value: T, ttlSeconds?: number): void {
    // Do nothing
  }

  cleanup(): number {
    return 0;
  }

  getMetrics(): CacheMetrics {
    return {
      totalHits: 0,
      totalMisses: 0,
      totalEntries: 0,
      hitRate: 0,
      oldestEntryAge: 0,
      estimatedSavings: 0,
    };
  }

  clear(): void {
    // No-op
  }
}

export const analysisCache = new LRUCache<any>(200, 300);
export const chatCache = new LRUCache<string>(100, 600);
export const generateCacheKey = LRUCache.hashKey;

export { LRUCache };
export type { CacheMetrics };
