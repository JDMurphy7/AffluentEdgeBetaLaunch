export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  timeout: number;
}

export interface AgentResult<T = any> {
  success: boolean;
  data: T;
  source: 'agent' | 'fallback';
  executionTime: number;
  cacheHit?: boolean;
  error?: string;
}

export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageExecutionTime: number;
  cacheHitRate: number;
  lastError?: string;
}
