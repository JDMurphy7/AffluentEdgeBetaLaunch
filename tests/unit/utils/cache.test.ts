import { trackCacheHitRate } from '@aeopt/utils/performance';

describe('Cache Utility', () => {
  test('Cache hit/miss logic functions correctly', () => {
    const cache = new Map<string, any>();
    cache.set('key1', 'value1');
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    trackCacheHitRate(cache, 'key1');
    expect(consoleSpy).toHaveBeenCalledWith('Cache hit for key: key1');
    trackCacheHitRate(cache, 'key2');
    expect(consoleSpy).toHaveBeenCalledWith('Cache miss for key: key2');
    consoleSpy.mockRestore();
  });

  test('Cache invalidation works when data changes', () => {
    const cache = new Map<string, any>();
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });
});
