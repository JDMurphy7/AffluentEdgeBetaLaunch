import type { AgentConfig, AgentResult, AgentMetrics } from './types.js';

export abstract class BaseAgent<TConfig extends AgentConfig = AgentConfig> {
  protected config: TConfig;
  protected metrics: AgentMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageExecutionTime: 0,
    cacheHitRate: 0,
    lastError: undefined,
  };
  protected fallback: (...args: any[]) => Promise<any>;

  constructor(config: TConfig, fallback: (...args: any[]) => Promise<any>) {
    this.config = config;
    this.fallback = fallback;
  }

  getMetrics(): AgentMetrics {
    return this.metrics;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  protected async executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Agent timeout')), timeout);
      fn().then((result) => {
        clearTimeout(timer);
        resolve(result);
      }).catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  protected updateMetrics(success: boolean, executionTime: number, cacheHit?: boolean, error?: string) {
    this.metrics.totalRequests++;
    if (success) this.metrics.successfulRequests++;
    else this.metrics.failedRequests++;
    this.metrics.averageExecutionTime =
      ((this.metrics.averageExecutionTime * (this.metrics.totalRequests - 1)) + executionTime) / this.metrics.totalRequests;
    if (cacheHit !== undefined) {
      const hits = this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + (cacheHit ? 1 : 0);
      this.metrics.cacheHitRate = hits / this.metrics.totalRequests;
    }
    if (error) this.metrics.lastError = error;
  }

  abstract getId(): string;
}
