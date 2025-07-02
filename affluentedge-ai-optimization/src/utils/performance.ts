import { performance } from 'perf_hooks';

export function trackExecutionTime(fn: Function): Function {
    return function(...args: any[]) {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();
        console.log(`Execution time for ${fn.name}: ${end - start} ms`);
        return result;
    };
}

export function trackCacheHitRate(cache: Map<string, any>, key: string): void {
    const hit = cache.has(key);
    if (hit) {
        console.log(`Cache hit for key: ${key}`);
    } else {
        console.log(`Cache miss for key: ${key}`);
    }
}