/**
 * A simple in-memory cache service
 */
export class CacheService {
  private cache: Record<string, any> = {};

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    return this.cache[key];
  }

  /**
   * Put a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @returns The cached value
   */
  put<T>(key: string, value: T): T {
    return this.cache[key] = value;
  }

  /**
   * Clear a value from the cache
   * @param key The cache key
   */
  clear(key: string): void {
    delete this.cache[key];
  }

  /**
   * Clear all values from the cache that match a pattern
   * @param pattern The pattern to match (e.g. 'menu:*')
   */
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    Object.keys(this.cache).forEach(key => {
      if (regex.test(key)) {
        this.clear(key);
      }
    });
  }
}

export default new CacheService();